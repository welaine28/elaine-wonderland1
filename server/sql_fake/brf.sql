
INSERT INTO benchmark_result (
  run_id,
  ai_agent_id,
  timestamp,
  question_id,
  hardware,
  model,
  harness,
  generated_code,
  config,
  metadata,
  labels
)
VALUES (
  'run_2026_01_29_001',
  'd023fbe3-c69e-49b3-86d5-cfd5dfa344fa',
  now() - interval '5 minutes',
  'vector_sum',
  'A100-80GB',
  'gpt-4.1',
  'eager',
  'fake generated code',
  '{"batch_size":1024}'::jsonb,
  '{"duration_ms":42}'::jsonb,
  ARRAY['fake']
);

INSERT INTO benchmark_metric (
  result_id,
  timestamp,
  metric_name,
  metric_value,
  metric_unit,
  metadata,
  status,
  labels,
  extra_keys
)
SELECT
  r.result_id,
  r.timestamp,
  'score',
  '4200',
  'us',
  '{"method":"median"}'::jsonb,
  'active',
  ARRAY['latency'],
  ARRAY['fp32']
FROM benchmark_result r
WHERE r.run_id = 'run_2026_01_29_001'
  AND r.question_id = 'vector_sum'
  AND r.ai_agent_id = 'd023fbe3-c69e-49b3-86d5-cfd5dfa344fa'
ORDER BY r.created_at DESC
LIMIT 1;
