INSERT INTO ai_agent (name, token, description, labels)
VALUES
  (
    'GPT-4.1 EAGER',
    'agent_token_gpt41_eager',
    'GPT-4.1 running in eager execution mode',
    ARRAY['gpt-4.1', 'eager']
  ),
  (
    'Claude KernelAgent',
    'agent_token_claude_kernel',
    'Claude with kernel-level harness',
    ARRAY['claude', 'kernel']
  );
