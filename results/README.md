# k6 Test Results

Test results will be automatically saved here in JSON format.

## File naming convention:
- `smoke-test-YYYYMMDD-HHMMSS.json`
- `load-test-YYYYMMDD-HHMMSS.json`
- `stress-test-YYYYMMDD-HHMMSS.json`
- `spike-test-YYYYMMDD-HHMMSS.json`

## Analyzing Results

You can analyze results using:

### 1. k6 built-in summary
The summary is displayed in terminal after each test run.

### 2. JSON analysis with jq
```bash
# Get HTTP request duration stats
jq '.metrics.http_req_duration' results/smoke-test-*.json

# Get error rate
jq '.metrics.http_req_failed' results/smoke-test-*.json

# Get throughput
jq '.metrics.http_reqs' results/smoke-test-*.json
```

### 3. k6 Cloud (for visual reports)
Upload results to k6 Cloud for better visualization:
```bash
k6 cloud k6-tests/load-test.js
```

### 4. Grafana + InfluxDB
For real-time monitoring, export to InfluxDB:
```bash
k6 run --out influxdb=http://localhost:8086/k6 k6-tests/load-test.js
```

## Keep Results Organized

- Archive old results regularly
- Compare results over time to track performance trends
- Document any significant changes in performance
