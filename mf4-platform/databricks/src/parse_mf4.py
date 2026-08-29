"""Executor-parallel MF4 parser job. Temporary files are inputs only; Delta is the record."""
import os
import re
import tempfile
from typing import Iterator

import pandas as pd
from asammdf import MDF
from pyspark.sql import Row, SparkSession
from pyspark.sql import functions as F

CATALOG_SCHEMA = "main.demo"
BRONZE = f"{CATALOG_SCHEMA}.bronze_mf4_files"
SILVER = f"{CATALOG_SCHEMA}.silver_mf4_signals"
SESSIONS = f"{CATALOG_SCHEMA}.mf4_sessions"

CHANNELS = {
    "PTC_FW_ENG_TRQ_ACT": "engine_torque_actual_nm",
    "PTC_DRVR_WHL_TRQ_REQ": "driver_wheel_torque_req_nm",
    "PTC_DRVR_WHL_TRQ_REQ_SS": "driver_wheel_torque_req_ss_nm",
    "RPMX1": "engine_rpm", "CAP_REF_RPM": "cap_ref_rpm",
    "ECT": "engine_coolant_temp_c", "CAT_TEMP": "catalyst_temp_c",
    "PTC_PDL_PCT": "pedal_position_pct", "FUEL_LVL_SCALED": "fuel_level_scaled",
    "FUEL_TEMP": "fuel_temperature_c", "BATTERY_VOLTAGE_TRIMMED": "battery_voltage_v",
    "ODOMETER_READING": "odometer_reading",
}

def session_id(name: str) -> str:
    stem = os.path.splitext(os.path.basename(name))[0]
    return re.sub(r"[^A-Z0-9_]+", "_", stem.upper()).strip("_")

def parse_one(record: Row) -> Iterator[Row]:
    """Runs on an executor. It never calls collect and processes one MF4 at a time."""
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".mf4", delete=False) as handle:
            handle.write(record.content)
            temporary = handle.name
        mdf = MDF(temporary, memory="minimum")
        signals = []
        for source, canonical in CHANNELS.items():
            try:
                signal = mdf.get(source)
            except Exception:  # Optional/missing channel: publish no values, not a failed file.
                continue
            values = pd.to_numeric(pd.Series(signal.samples), errors="coerce")
            times = pd.to_numeric(pd.Series(signal.timestamps), errors="coerce")
            signals.append(pd.DataFrame({"time_sec": times, canonical: values}))
        if not signals:
            raise ValueError("No configured channels found")
        # Outer alignment retains each available signal. It is deliberately per-file;
        # production should choose an explicit resampling policy appropriate to signal semantics.
        frame = signals[0]
        for other in signals[1:]:
            frame = frame.merge(other, on="time_sec", how="outer")
        frame = frame.dropna(subset=["time_sec"]).query("time_sec >= 0").drop_duplicates("time_sec").sort_values("time_sec")
        sid = session_id(record.file_name)
        for values in frame.to_dict("records"):
            values.update(session_id=sid, source_file_id=record.source_file_id, source_file=record.source_file)
            yield Row(**values)
    finally:
        if temporary and os.path.exists(temporary):
            os.remove(temporary)

def main() -> None:
    spark = SparkSession.builder.getOrCreate()
    candidates = spark.table(BRONZE).join(
        spark.table(SESSIONS).where("processing_status = 'READY'").select("source_file_id"),
        "source_file_id", "left_anti",
    )
    # toLocalIterator/collect are forbidden: partition work stays on executors.
    parsed = spark.createDataFrame(candidates.rdd.mapPartitions(lambda rows: (out for r in rows for out in parse_one(r))))
    parsed.write.format("delta").mode("append").saveAsTable(SILVER)
    summary = parsed.groupBy("session_id", "source_file_id", "source_file").agg(
        F.min("time_sec").alias("start_time"), F.max("time_sec").alias("end_time"), F.count("*").alias("total_samples"))
    summary.withColumn("duration_sec", F.col("end_time") - F.col("start_time")).withColumn("processing_status", F.lit("READY")) \
        .withColumn("status", F.lit("READY")).withColumn("processing_end", F.current_timestamp()) \
        .write.format("delta").mode("append").saveAsTable(SESSIONS)

if __name__ == "__main__":
    main()
