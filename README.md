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

