# .NET 8 API implementation boundary

Expose only the contracts below. Implement `ISessionAnalyticsRepository` with the
Databricks SQL Statement Execution API/official SQL connector and parameter binding;
the controller must never concatenate `sessionId` into SQL. Authenticate callers with
Entra ID and authorize each session before invoking the repository.

```csharp
app.MapGet("/api/sessions", (ISessionAnalyticsRepository r, CancellationToken ct) => r.ListAsync(ct));
app.MapGet("/api/sessions/{sessionId}/kpis", (string sessionId, ISessionAnalyticsRepository r, CancellationToken ct) => r.KpisAsync(sessionId, ct));
app.MapGet("/api/sessions/{sessionId}/visualizations/torque-rpm", (string sessionId, ISessionAnalyticsRepository r, CancellationToken ct) => r.TorqueRpmAsync(sessionId, ct));
app.MapGet("/api/sessions/{sessionId}/visualizations/temperature", (string sessionId, ISessionAnalyticsRepository r, CancellationToken ct) => r.TemperatureAsync(sessionId, ct));
app.MapGet("/api/sessions/{sessionId}/visualizations/fuel", (string sessionId, ISessionAnalyticsRepository r, CancellationToken ct) => r.FuelAsync(sessionId, ct));
app.MapGet("/api/sessions/{sessionId}/visualizations/top-drop", (string sessionId, ISessionAnalyticsRepository r, CancellationToken ct) => r.TopDropAsync(sessionId, ct));
```

The repository query for torque/RPM is parameterized conceptually as:

```sql
SELECT rpm_bucket, avg_torque_nm, max_torque_nm, min_torque_nm, sample_count
FROM main.demo.gold_mf4_torque_vs_rpm
WHERE session_id = :session_id
ORDER BY rpm_bucket
```

Use a service principal/workload identity that has `SELECT` only on the serving tables;
store its identity configuration in Key Vault or the host's managed-identity
configuration. Do not ship it in the desktop app.
