DROP TABLE IF EXISTS benchmark_metric;
DROP TABLE IF EXISTS benchmark_result;
DROP TABLE IF EXISTS ai_agent;

-- Optional but helpful: UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_agent (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  token        TEXT,
  description  TEXT,
  labels       TEXT[],
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmark_result (
  result_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        TEXT NOT NULL,
  ai_agent_id   UUID NOT NULL REFERENCES ai_agent(id),
  timestamp     TIMESTAMPTZ NOT NULL,
  question_id   TEXT NOT NULL,
  submission_id TEXT,
  hardware      TEXT,
  model         TEXT,
  harness       TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  error         TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  labels        TEXT[],
  benchmark_result TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
