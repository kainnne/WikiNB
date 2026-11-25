-- Per-request log for Kain³e AI (trace code, hashed visitor, provider, model, tokens, latency, status).
-- Also backs the site-wide daily token ceiling (AI_SITE_DAY_TOKENS).
CREATE TABLE IF NOT EXISTS ai_logs (
  trace TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  who TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  input INTEGER NOT NULL DEFAULT 0,
  output INTEGER NOT NULL DEFAULT 0,
  cached INTEGER NOT NULL DEFAULT 0,
  ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS ai_logs_time ON ai_logs(time);
