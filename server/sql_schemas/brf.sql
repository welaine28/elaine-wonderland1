
-- Insert 4 AI agents and 3 weekly benchmark results per agent (12 total)
-- All hardware is NVIDIA H100
-- benchmark_result = speedup
-- metadata contains model_score + baseline_score

WITH inserted_agents AS (
  INSERT INTO ai_agent (name, token, description, labels, status)
  VALUES
    ('claude4.5 KernelAgent', NULL, 'KernelAgent variant', ARRAY['kernel','agent','claude'], 'active'),
    ('gpt5 KernelAgent',      NULL, 'KernelAgent variant', ARRAY['kernel','agent','gpt'],    'active'),
    ('claude4.5 SecretAgent', NULL, 'SecretAgent variant', ARRAY['secret','agent','claude'], 'active'),
    ('gpt5 SecretAgent',      NULL, 'SecretAgent variant', ARRAY['secret','agent','gpt'],    'active')
  RETURNING id, name
),
agents AS (
  SELECT
    id AS ai_agent_id,
    name AS agent_name,
    CASE
      WHEN name ILIKE '%kernelagent%' THEN 'KernelAgent'
      ELSE 'SecretAgent'
    END AS agent_type,
    CASE
      WHEN name ILIKE 'claude%' THEN 'claude4.5'
      ELSE 'gpt5'
    END AS model_name
  FROM inserted_agents
),
rows_to_insert AS (
  SELECT
    a.ai_agent_id,
    a.agent_name,
    a.agent_type,
    a.model_name,
    g.week_idx,
    -- weekly timestamps: now, now-7d, now-14d
    (now() - (g.week_idx * interval '7 days')) AS ts,
    -- synthetic scores
    (
      CASE
        WHEN a.agent_type = 'KernelAgent' AND a.model_name = 'gpt5'      THEN 950
        WHEN a.agent_type = 'KernelAgent' AND a.model_name = 'claude4.5' THEN 2000
        when a.agent_type = 'SecretAgent' AND a.model_name = 'gpt5'      THEN 1200
        ELSE                                                                  900
      END
      +
      (20 + random() * 500)
    )::numeric AS model_score,
    800::numeric AS baseline_score
  FROM agents a
  CROSS JOIN (VALUES (0), (1), (2)) AS g(week_idx)
)

INSERT INTO benchmark_result (
  run_id,
  ai_agent_id,
  timestamp,
  question_id,
  submission_id,
  hardware,
  model,
  harness,
  metadata,
  error,
  status,
  labels,
  benchmark_result
)
SELECT
  ('run_' || r.week_idx)::text AS run_id,
  r.ai_agent_id,
  r.ts AS timestamp,
  'vectorsum' AS question_id,
  NULL AS submission_id,
  'NVIDIA H100' AS hardware,
  r.model_name AS model,
  r.agent_type AS harness,
  jsonb_build_object(
    'model_score',    r.model_score,
    'baseline_score', r.baseline_score
  ) AS metadata,
  NULL AS error,
  'active' AS status,
  ARRAY[
    lower(r.agent_type),
    lower(replace(r.model_name, '.', '')),
    'week_' || r.week_idx
  ]::text[] AS labels,
  -- speedup = model_score / baseline_score
  to_char((r.model_score / r.baseline_score), 'FM9990.000') AS benchmark_result
FROM rows_to_insert r
ORDER BY r.agent_name, r.week_idx;
