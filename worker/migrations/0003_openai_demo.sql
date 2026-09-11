-- Separate launch allowance and burst control. Existing Gemini tables are untouched.
CREATE TABLE IF NOT EXISTS openai_demo_budget (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  charged_microusd INTEGER NOT NULL DEFAULT 0 CHECK (charged_microusd >= 0),
  closed INTEGER NOT NULL DEFAULT 0 CHECK (closed IN (0, 1))
);
INSERT OR IGNORE INTO openai_demo_budget (id, charged_microusd, closed) VALUES (1, 0, 0);

CREATE TABLE IF NOT EXISTS openai_demo_rate (
  rate_key TEXT PRIMARY KEY,
  last_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS openai_demo_rate_expiry ON openai_demo_rate(last_at);
