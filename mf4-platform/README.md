# MF4 analytics platform

## Decision

Use a **two-workload design**:

```text
MF4 volume -> Auto Loader bronze_mf4_files -> MF4 parser job -> silver_mf4_signals
                                                            -> session metadata
                                                            -> Gold Delta tables -> Databricks SQL Warehouse -> .NET API -> desktop app
```

The parser is a Databricks Job (a wheel task in production), not a `foreachBatch`
callback in a Lakeflow pipeline. `asammdf` is a native Python file parser and each
MF4 file must be materialised briefly on the executor. This isolates native-library
dependency and per-file failures, avoids bringing a microbatch to the driver, and
makes per-file retry/idempotency straightforward. A visualization only queries Gold
tables; it never starts a pipeline or parses an MF4.

## The current `asammdf` failure

`ModuleNotFoundError` means the environment executing `foreach_batch_sink` does not
contain the library. An interactive notebook's `%pip install` changes that notebook/
interactive compute session; it does **not** configure the managed pipeline's
environment. Do not rely on it.

Pin a compatible version in the workload definition instead. For a Lakeflow pipeline
use the Pipeline editor's **Environment -> Add dependency** with `asammdf==<tested>`;
preferably commit it in a Declarative Automation Bundle's pipeline `environment`
dependencies. For the parser job, install the same pinned requirement as a job task
library or, preferably, deploy a wheel whose `pyproject.toml` pins it. Test the exact
Databricks Runtime/environment version used in production, because `asammdf` includes
compiled dependencies. The dependency setting applies to all executors and is recreated
on every run.

The checked-in `databricks.yml` shows the job-wheel approach. Choose and validate a
specific `asammdf` version against the target DBR before release; it is intentionally
not an untested version claim.

## Tables and contracts

| Table | Grain | Purpose |
| --- | --- | --- |
| `bronze_mf4_files` | source file version | Immutable binary, source metadata, deterministic file id |
| `mf4_sessions` | session | Grid/status/error/audit record |
| `silver_mf4_signals` | session, time sample | Clean, canonical signal data |
| `gold_mf4_session_kpis` | session | KPI card |
| `gold_mf4_timeseries_1sec` | session, second | chart points |
| `gold_mf4_torque_vs_rpm` | session, RPM bucket | torque/RPM chart |
| `gold_mf4_temperature_1sec` | session, second | temperature chart |
| `gold_mf4_fuel_1sec` | session, second | fuel chart |
| `gold_mf4_top_drop_events` | session, event | peak-to-drop events |

`session_id` is derived from the normalized filename stem (for example
`test_2024_08_28.mf4` becomes `TEST_2024_08_28`) and is paired with a deterministic
`source_file_id` (SHA-256 of path, size and modification time). Enforce a unique
`(session_id, source_file_id)` model; reject or suffix duplicate session names rather
than silently mixing runs.

Bronze retains the original `content` binary. Silver rows carry `session_id`,
`source_file_id`, and `source_file`. This answers both lineage questions without
guessing from a chart request.

## Why not the original design

`df.select("path", "content").collect()` serializes every file and byte of the
microbatch to the driver. A single large MF4 can exhaust driver memory; several files
also eliminate parallelism. `foreachBatch` is acceptable only for a small proof of
concept with a strict max-file-size and one-file-at-a-time guard. It is a poor home for
the long-running, native, per-file parsing work.

Writing parser output to CSV under the Auto Loader input tree creates a feedback loop,
adds lossy schema/type handling and another ingestion checkpoint. Do not do it. Write
the parsed canonical rows directly to Delta. Temporary executor files are only an
ephemeral input required by the parser, never a system of record.

## Operational workflow

1. Auto Loader ingests only `*.mf4` to `bronze_mf4_files`, checkpointed outside the
   input directory.
2. A triggered parser job claims `DISCOVERED` files, records `PROCESSING`, parses each
   file on executors, and MERGEs Silver plus `mf4_sessions`.
3. The Gold job refreshes only changed sessions; all aggregations group by
   `session_id`.
4. A SQL Warehouse serves parameterized queries from Gold. The API returns bounded,
   downsampled series. Start without a cache; add Redis only after measuring repeated
   query latency.

For a prototype, one triggered parser job and a simple Auto Loader pipeline are enough.
For small production, use the same two workloads with a shared job cluster, quality
checks, retries, and a SQL Warehouse. For large production, use queue/manifest-driven
file partitioning, wheel-based parser tasks with bounded concurrency, durable per-file
claims, and independent Gold refresh/serving workloads. Architecture 1 is cheapest to
demonstrate but least reliable; Architecture 2 is the recommended small-production
baseline; Architecture 3 is the scalable, maintainable production design.

## Top-drop definition

Top drop is configurable, not a fixed chart label. For each metric (initially torque),
on a session's 1-second series:

1. identify a local peak over `lookback_sec`;
2. find the minimum during the following `max_drop_window_sec`;
3. keep it only when `drop_amount >= min_drop` and
   `drop_amount / peak_value >= min_drop_pct`;
4. de-duplicate overlapping events, keeping the largest drop.

Store metric, peak/drop values and times, amount, percentage, duration, RPM and pedal
at peak/drop. The desktop can therefore change thresholds without a new parsing
pipeline; it invokes a parameterized event query/materialized view refresh.

## API and desktop behavior

The API endpoints are:

```text
GET /api/sessions
GET /api/sessions/{sessionId}
GET /api/sessions/{sessionId}/kpis
GET /api/sessions/{sessionId}/visualizations/torque-rpm
GET /api/sessions/{sessionId}/visualizations/timeseries?from=&to=
GET /api/sessions/{sessionId}/visualizations/temperature
GET /api/sessions/{sessionId}/visualizations/fuel
GET /api/sessions/{sessionId}/visualizations/top-drop
```

Example response:

```json
{
  "sessionId": "TEST_2024_08_28",
  "visualization": "torque-rpm",
  "data": [{"rpm": 1000, "avgTorqueNm": 120.0, "maxTorqueNm": 132.5, "sampleCount": 86}]
}
```

The session grid reads `/api/sessions`. Its right-click menu passes only the selected
`sessionId` to one of the endpoints above and renders the returned points. It must not
have Databricks or storage credentials.

The .NET API authenticates desktop users (Microsoft Entra ID), authorizes session access,
and uses its own managed identity or secretless workload identity/service principal to
reach Databricks SQL. Keep credentials in Key Vault/configuration references, never in
the desktop client. Return RFC 7807 problem responses: 404 unknown session, 422 invalid
query range, 503 warehouse unavailable, and correlation ids for 5xx responses.

## Reliability, quality and tests

The parser records `FAILED` plus a sanitized error for corrupt files, missing required
metadata, or parser errors, then continues. Missing optional channels are represented by
null columns/availability metadata, not a failed session. Use source file id plus Delta
MERGE for idempotency; do not mark `READY` until Silver and Gold for the file commit.

Test valid/empty/corrupt/large MF4 files and missing channels; null, negative and
duplicate timestamps; known KPI, RPM bucket and top-drop fixtures; API auth/404/422;
and desktop empty/loading/timeout/menu flows. Monitor discovered/succeeded/failed files,
per-session start/end/error, parser duration/rows-per-second, Gold refresh duration and
SQL/API latency/error rate. Publish the pipeline event log to Unity Catalog and alert on
failures.

See `databricks/` for starter code and SQL. Databricks' pipeline environment and
version-controlled bundle guidance is documented in [the pipeline editor guide](https://docs.databricks.com/aws/en/ldp/multi-file-editor), [bundle library dependencies](https://docs.databricks.com/gcp/en/dev-tools/bundles/library-dependencies), and [pipeline environment versions](https://docs.databricks.com/aws/en/ldp/developer/environment-versions).
