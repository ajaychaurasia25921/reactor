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
