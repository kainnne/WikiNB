CREATE TABLE IF NOT EXISTS private_study_invites (
  code_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL, redeemed_by TEXT, revoked INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS private_study_units (
  unit_id TEXT PRIMARY KEY, title TEXT NOT NULL, data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS private_study_questions (
  question_id TEXT PRIMARY KEY, data TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS private_study_progress (
  identity TEXT NOT NULL, unit_id TEXT NOT NULL, question_index INTEGER NOT NULL DEFAULT 0,
  last_result TEXT, updated_at INTEGER NOT NULL,
  PRIMARY KEY(identity, unit_id)
);
