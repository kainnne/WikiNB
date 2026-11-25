// Model access for Kain³e AI.
// The kainnne.com OpenAI key (Worker secret OPENAI_API_KEY) is the main path. Gemini stays as the fallback in
// index.js, so the tuned prompts in visitor-policy.js / chat-policy.js are shared by both and never change here.
// Every request gets a trace code and a row in D1 ai_logs (hashed visitor, model, tokens, latency, status).

export const OPENAI_MODEL_DEFAULT = 'gpt-5.4-mini';
export const OPENAI_MAX_OUTPUT = 1600;
export const SITE_DAY_TOKENS_DEFAULT = 1500000;

export function traceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'KAI-' + Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function openaiTurns(history) {
  return (Array.isArray(history) ? history : []).slice(-4)
    .filter((turn) => turn && typeof turn.content === 'string' && turn.content.trim())
    .map((turn) => ({ role: turn.role === 'assistant' ? 'assistant' : 'user', content: turn.content.trim().slice(0, 1200) }));
}

export function extractOpenAIText(data) {
  return (Array.isArray(data?.output) ? data.output : [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text || '').join('').trim();
}

// One call, never retried automatically: a timeout does not prove the request was unbilled.
export async function openaiAnswer(env, { instructions, history = [], message, maxOutput = OPENAI_MAX_OUTPUT, cacheKey = 'kaine-ai' }) {
  const model = env.OPENAI_MODEL || OPENAI_MODEL_DEFAULT;
  const usage = { input: 0, output: 0, cached: 0 };
  let response, data;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        instructions,
        input: [...openaiTurns(history), { role: 'user', content: message }],
        reasoning: { effort: 'low' },
        max_output_tokens: maxOutput,
        store: false,
        prompt_cache_key: cacheKey,
      }),
      signal: AbortSignal.timeout(45000),
    });
    data = await response.json().catch(() => ({}));
  } catch {
    return { ok: false, model, usage, status: 'network' };
  }
  usage.input = Number(data?.usage?.input_tokens || 0);
  usage.output = Number(data?.usage?.output_tokens || 0);
  usage.cached = Number(data?.usage?.input_tokens_details?.cached_tokens || 0);
  if (!response.ok) return { ok: false, model, usage, status: `http_${response.status}`, detail: String(data?.error?.code || '') };
  const answer = extractOpenAIText(data);
  if (!answer) return { ok: false, model, usage, status: 'empty' };
  return { ok: true, model, usage, answer, incomplete: data.status === 'incomplete', status: 'ok' };
}

export async function logAi(env, row) {
  try {
    await env.DB.prepare(`INSERT INTO ai_logs (trace, time, who, provider, model, input, output, cached, ms, status, detail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(row.trace, new Date().toISOString(), row.who || '', row.provider || '', row.model || '',
        row.input || 0, row.output || 0, row.cached || 0, row.ms || 0, row.status || '', String(row.detail || '').slice(0, 200))
      .run();
  } catch { /* logging must never break an answer */ }
}

// Site-wide daily ceiling across every visitor, counted from ai_logs since midnight in Taipei.
export async function siteTokensToday(env) {
  const taipei = new Date(Date.now() + 8 * 3600000);
  const taipeiMidnight = new Date(Date.UTC(taipei.getUTCFullYear(), taipei.getUTCMonth(), taipei.getUTCDate()) - 8 * 3600000);
  try {
    const row = await env.DB.prepare('SELECT COALESCE(SUM(input + output), 0) AS n FROM ai_logs WHERE time >= ?')
      .bind(taipeiMidnight.toISOString()).first();
    return Number(row?.n || 0);
  } catch { return 0; }
}

export function siteDayLimit(env) {
  const value = Number(env.AI_SITE_DAY_TOKENS);
  return Number.isFinite(value) && value > 0 ? value : SITE_DAY_TOKENS_DEFAULT;
}
