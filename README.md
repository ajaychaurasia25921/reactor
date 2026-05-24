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
mvn quarkus:dev
```
2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Example Fault API Request
```bash
curl -X POST http://localhost:8080/api/v1/events/fault \
  -H "Content-Type: application/json" \
  -d '{
    "source":"leaf-01",
    "severity":"CRITICAL",
    "cpuUsage":96.4,
    "observedAt":"2026-05-24T09:15:22Z",
    "payloadJson":"{\"interface\":\"eth1/2\",\"drops\":140}"
  }'
```
