# Reactor - Fabric Engine Next-Gen

## Structure
- `docs/` architecture, strategy, and pitch materials
- `backend/` Quarkus + GraalVM execution plane
- `frontend/` React + Vite control plane UI

## Key Specs
- GraphQL edge API + subscriptions
- gRPC-style service boundaries in architecture
- LangGraph + Ollama orchestration bridge
- GraalVM polyglot sandbox with no FS/network access
- SMPP retry logic with exponential backoff

## OpenAPI
- Static contract file: `backend/src/main/resources/openapi.yaml`
- Runtime OpenAPI endpoint: `http://localhost:8080/q/openapi`
- Swagger UI: `http://localhost:8080/q/swagger-ui`
- Async status endpoint implementation: `GET /api/v1/operations/tasks/{jobId}`

## Local Run
1. Backend
```bash
cd backend
gradle quarkusDev
```
2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Example Machine Provisioning Request
```bash
curl -X POST http://localhost:8080/api/v1/machines \
  -H "Content-Type: application/json" \
  -d '{
    "name":"quantum-simulation-node-01",
    "type":"quantum",
    "resources":{"cpuCores":64,"memoryGb":256}
  }'
```

## Example Hardware Patch Request
```bash
curl -X PATCH http://localhost:8080/api/v1/machines/2d95f1fc-342a-4ba9-a3ad-7dece6c013b1/hardware \
  -H "Content-Type: application/json" \
  -d '{
    "targetRamGb":1024,
    "scaleStorageBytes":2199023255552,
    "acceleratorClass":"NVIDIA_H100",
    "microcodeVersions":["mcode-2.1.9"],
    "coprocessorArrays":["fpga-x1"]
  }'
```
