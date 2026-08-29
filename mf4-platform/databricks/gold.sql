-- All datasets are session-aware. Refresh incrementally in the Gold job by limiting
-- source sessions to sessions changed since the last successful watermark.
CREATE OR REPLACE TABLE main.demo.gold_mf4_session_kpis AS
SELECT
  session_id,
  max(engine_torque_actual_nm) AS peak_torque_nm,
  avg(engine_torque_actual_nm) AS avg_torque_nm,
  min(engine_torque_actual_nm) AS min_torque_nm,
  stddev_samp(engine_torque_actual_nm) AS torque_variability_nm,
  max(driver_wheel_torque_req_nm) AS max_driver_torque_req_nm,
  max(engine_rpm) AS max_engine_rpm, avg(engine_rpm) AS avg_engine_rpm, min(engine_rpm) AS min_engine_rpm,
  max(engine_coolant_temp_c) AS max_coolant_temp_c, avg(engine_coolant_temp_c) AS avg_coolant_temp_c,
  max(catalyst_temp_c) AS max_catalyst_temp_c, avg(catalyst_temp_c) AS avg_catalyst_temp_c,
  min(fuel_level_scaled) AS min_fuel_level, max(fuel_level_scaled) AS max_fuel_level, avg(fuel_level_scaled) AS avg_fuel_level,
  min(battery_voltage_v) AS min_battery_voltage_v, avg(battery_voltage_v) AS avg_battery_voltage_v,
  max(pedal_position_pct) AS max_pedal_position_pct, avg(pedal_position_pct) AS avg_pedal_position_pct,
  max(time_sec) - min(time_sec) AS duration_sec, count(*) AS total_samples,
  max_by(odometer_reading, time_sec) AS final_odometer_reading
FROM main.demo.silver_mf4_signals
GROUP BY session_id;

CREATE OR REPLACE TABLE main.demo.gold_mf4_timeseries_1sec AS
SELECT session_id, floor(time_sec) AS time_sec,
  avg(engine_torque_actual_nm) AS avg_torque_nm, max(engine_torque_actual_nm) AS max_torque_nm, min(engine_torque_actual_nm) AS min_torque_nm,
  avg(driver_wheel_torque_req_nm) AS avg_driver_torque_req_nm, avg(engine_rpm) AS avg_rpm, max(engine_rpm) AS max_rpm,
  avg(pedal_position_pct) AS avg_pedal_pct, avg(engine_coolant_temp_c) AS avg_coolant_temp_c,
  avg(catalyst_temp_c) AS avg_catalyst_temp_c, avg(fuel_level_scaled) AS avg_fuel_level,
  avg(battery_voltage_v) AS avg_battery_voltage_v, count(*) AS sample_count
FROM main.demo.silver_mf4_signals
GROUP BY session_id, floor(time_sec);

CREATE OR REPLACE TABLE main.demo.gold_mf4_torque_vs_rpm AS
SELECT session_id, cast(floor(engine_rpm / 100) * 100 AS INT) AS rpm_bucket,
  avg(engine_torque_actual_nm) AS avg_torque_nm, max(engine_torque_actual_nm) AS max_torque_nm,
  min(engine_torque_actual_nm) AS min_torque_nm, avg(pedal_position_pct) AS avg_pedal_pct, count(*) AS sample_count
FROM main.demo.silver_mf4_signals
WHERE engine_rpm >= 0
GROUP BY session_id, cast(floor(engine_rpm / 100) * 100 AS INT);

CREATE OR REPLACE TABLE main.demo.gold_mf4_temperature_1sec AS
SELECT session_id, time_sec, avg_coolant_temp_c AS engine_coolant_temp_c,
  avg_catalyst_temp_c AS catalyst_temp_c
FROM main.demo.gold_mf4_timeseries_1sec;

CREATE OR REPLACE TABLE main.demo.gold_mf4_fuel_1sec AS
SELECT session_id, time_sec, avg_fuel_level AS fuel_level, avg_torque_nm AS avg_torque,
  avg_rpm, avg_fuel_level - lag(avg_fuel_level) OVER (PARTITION BY session_id ORDER BY time_sec) AS fuel_level_change
FROM main.demo.gold_mf4_timeseries_1sec;

-- Default torque top-drop policy: local peak, then the lowest value in the next 5 s.
-- Make 5 seconds, 25 Nm and 10% pipeline parameters in production.
CREATE OR REPLACE TABLE main.demo.gold_mf4_top_drop_events AS
WITH source AS (
  SELECT session_id, time_sec, avg_torque_nm, avg_rpm, avg_pedal_pct,
    lag(avg_torque_nm) OVER (PARTITION BY session_id ORDER BY time_sec) AS prior_torque,
    lead(avg_torque_nm) OVER (PARTITION BY session_id ORDER BY time_sec) AS next_torque
  FROM main.demo.gold_mf4_timeseries_1sec
), peaks AS (
  SELECT * FROM source
  WHERE avg_torque_nm >= coalesce(prior_torque, avg_torque_nm)
    AND avg_torque_nm > coalesce(next_torque, avg_torque_nm)
), candidates AS (
  SELECT p.session_id, p.time_sec AS peak_time, p.avg_torque_nm AS peak_value,
    p.avg_rpm AS peak_rpm, p.avg_pedal_pct AS peak_pedal_pct,
    s.time_sec AS drop_time, s.avg_torque_nm AS drop_value,
    s.avg_rpm AS drop_rpm, s.avg_pedal_pct AS drop_pedal_pct,
    row_number() OVER (PARTITION BY p.session_id, p.time_sec ORDER BY s.avg_torque_nm, s.time_sec) AS rn
  FROM peaks p JOIN main.demo.gold_mf4_timeseries_1sec s
    ON p.session_id = s.session_id AND s.time_sec > p.time_sec AND s.time_sec <= p.time_sec + 5
)
SELECT session_id, 'torque' AS metric, peak_value, peak_time, drop_value, drop_time,
  peak_value - drop_value AS drop_amount,
  100.0 * (peak_value - drop_value) / nullif(peak_value, 0) AS drop_percentage,
  drop_time - peak_time AS drop_duration_sec,
  peak_rpm, drop_rpm, peak_pedal_pct, drop_pedal_pct
FROM candidates
WHERE rn = 1 AND peak_value - drop_value >= 25
  AND (peak_value - drop_value) / nullif(peak_value, 0) >= 0.10;
