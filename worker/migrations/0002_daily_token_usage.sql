ALTER TABLE daily_usage
ADD COLUMN token_count INTEGER NOT NULL DEFAULT 0;

-- Preserve today's existing usage approximately when moving from
-- question-count quota to token-based percentage quota.
UPDATE daily_usage
SET token_count = count * 6000
WHERE token_count = 0;
