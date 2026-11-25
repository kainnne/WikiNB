CREATE TABLE IF NOT EXISTS otp_requests (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_at INTEGER NOT NULL,
  ip TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS guest_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS guest_sessions_expires_idx
  ON guest_sessions(expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_usage (
  email TEXT NOT NULL,
  usage_day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (email, usage_day)
);

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
