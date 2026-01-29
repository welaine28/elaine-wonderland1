DROP TABLE IF EXISTS benchmark_metric;
DROP TABLE IF EXISTS benchmark_result;
DROP TABLE IF EXISTS ai_agent;

-- Optional but helpful: UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ai_agent (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,
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
  generated_code TEXT,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  error         TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  labels        TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- benchmark_metric ----
CREATE TABLE IF NOT EXISTS benchmark_metric (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id    UUID NOT NULL REFERENCES benchmark_result(result_id) ON DELETE CASCADE,
  timestamp    TIMESTAMPTZ NOT NULL,
  metric_name  TEXT NOT NULL,
  metric_value TEXT NOT NULL,
  metric_unit  TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'active',
  extra_keys   TEXT[],
  labels       TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
