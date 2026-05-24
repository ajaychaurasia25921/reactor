# Fabric Engine Next-Gen HLD & LLD

## HLD

### Architecture Goals
- Unified control-plane for compute, virtualization, security, file transport, and quantum workloads.
- Dual ingress: GraphQL for client reactivity and gRPC for internal high-throughput service mesh.
- Quarkus 3.x + GraalVM native runtime targets: cold start <50ms, memory <100MB.
- Sustained event pipeline >= 5,000 events/sec.

### Core Topology
```mermaid
flowchart LR
  subgraph Clients
    UI[NOC/Cloud Console]
    APIUsers[Automation Clients]
  end

  subgraph Edge
    GQL[GraphQL Gateway]
    REST[REST OpenAPI Gateway]
    WS[GraphQL Subscriptions]
  end

  subgraph ControlPlane
    ORCH[Orchestration Service]
    JOBS[Async Job Queue]
    REM[Remediation Engine]
    FILE[File Transport Plane]
    L7[L7 Sockets Plane]
    VIRT[Virtualization Plane]
    TRACE[Packet Tracing]
    SEC[Security Plane]
  end

  subgraph InternalMesh
    GRPC[gRPC Service Bus]
    AI[LangGraph + Ollama]
    SMS[SMPP Gateway]
    DB[(PostgreSQL R2DBC)]
  end

  UI --> GQL
  UI --> WS
  APIUsers --> REST
  GQL --> ORCH
  REST --> ORCH
  ORCH --> JOBS
  JOBS --> GRPC
  GRPC --> FILE
  GRPC --> L7
  GRPC --> VIRT
  GRPC --> TRACE
  GRPC --> SEC
  GRPC --> REM
  REM --> AI
  REM --> SMS
  ORCH --> DB
  JOBS --> DB
  REM --> DB
```

### Throughput/Scaling Model
- Utilization: `rho = lambda / (k * mu)`
- Stability: `rho < 1`
- Worker floor: `k >= ceil(lambda / (h * mu))`, `h` = target headroom.
- For `lambda=5000`, `mu=250`, `h=0.7` => `k=29` workers.

## LLD

### Request Lifecycle (`POST /machines`)
```mermaid
sequenceDiagram
  participant C as Client
  participant R as MachineResource
  participant S as MachineOrchestrationService
  participant Q as JobWorkerService
  participant A as LangGraphOllamaBridge
  participant X as PolyglotSandboxService
  participant M as SmppDispatchClient
  participant D as JobRepository/PostgreSQL

  C->>R: POST /api/v1/machines
  R->>S: validate + schedule
  S->>D: insert(job=ENQUEUED)
  S->>Q: enqueue(jobId, machineRequest)
  S-->>C: 201 AsyncJobResponse

  Q->>D: update(job=PROCESSING)
  Q->>A: evaluate(machine state/fault)
  A-->>Q: remediation script
  Q->>X: execute(script, sandboxed)
  alt remediation failed
    Q->>M: send SMS alert with backoff
  end
  Q->>D: update(job=FINALIZED|FAILED)
```

### Internal Components
- `MachineResource`: contract boundary for `/machines` + `/machines/{machineId}/hardware`.
- `MachineOrchestrationService`: request validation, idempotency, job creation.
- `JobWorkerService`: async execution worker and status transition management.
- `LangGraphOllamaBridge`: localized reasoning state-machine bridge.
- `PolyglotSandboxService`: no-host, no-IO GraalVM script execution.
- `SmppDispatchClient`: resilient operational alerting with exponential backoff.
- `JobRepository`: reactive storage and query API.

### Data Objects
- `MachineProvisionRequest`
- `HardwareUpdateRequest`
- `AsyncJobResponse`
- `AlertTrigger`
- `ExecutionResult`

