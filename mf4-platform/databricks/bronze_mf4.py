from pyspark.sql import functions as F

INPUT_PATH = "/Volumes/main/demo/mf4_storage_location/"
CHECKPOINT_PATH = "/Volumes/main/demo/mf4_checkpoints/bronze_mf4_files"
BRONZE_TABLE = "main.demo.bronze_mf4_files"

# Run as a Lakeflow source definition or an ordinary structured-streaming job. The
# binaryFile source yields path, modificationTime, length and raw content. Keep the
# checkpoint separate from the source volume and never write derived CSV beside MF4s.
bronze = (
    spark.readStream.format("cloudFiles")
    .option("cloudFiles.format", "binaryFile")
    .option("pathGlobFilter", "*.mf4")
    .load(INPUT_PATH)
    .select(
        F.sha2(F.concat_ws("|", "path", "length", F.col("modificationTime").cast("string")), 256).alias("source_file_id"),
        F.col("path").alias("source_file"),
        F.element_at(F.split("path", "/"), -1).alias("file_name"),
        F.col("length").alias("file_size_bytes"),
        F.col("modificationTime").alias("source_modification_time"),
        F.col("content"),
        F.current_timestamp().alias("ingested_at"),
        F.input_file_name().alias("ingestion_input_file"),
    )
)

(
    bronze.writeStream.option("checkpointLocation", CHECKPOINT_PATH)
    .trigger(availableNow=True)
    .toTable(BRONZE_TABLE)
)
