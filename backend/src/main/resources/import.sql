CREATE TABLE IF NOT EXISTS fault_event (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  severity TEXT NOT NULL,
  cpu_usage DOUBLE PRECISION NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS remediation_run (
  id TEXT PRIMARY KEY,
  fault_id TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  state TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL
);
