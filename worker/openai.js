import { loadWikiPages, buildRelevantCorpus, retrievalQuestion, requestsExpandedDetail } from './index.js';
import { buildVisitorSystemPrompt, visitorIntent, shouldOfferContact } from './visitor-policy.js';
import { isKaineScopeQuestion, prefersEnglish, ensureCollaborationContact } from './chat-policy.js';
import { canonicalizeWikiLinks } from './wiki-excerpts.js';

export const MODEL = 'gpt-5.6-luna';
export const MAX_OUTPUT_TOKENS = 4096;
const MAX_BODY_BYTES = 32000;
const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  } });
}

function fail(code, status) { return json({ ok: false, code }, status); }

export function cleanOpenAIHistory(history) {
  return (Array.isArray(history) ? history : []).slice(-4)
    .filter(turn => turn && ['user', 'assistant'].includes(turn.role) && typeof turn.content === 'string')
    .map(turn => ({ role: turn.role, content: turn.content.trim().slice(0, 1200) }))
    .filter(turn => turn.content);
}

export function budgetLimit(env) {
  const configured = Number(env.DEMO_BUDGET_MICROUSD);
  return Number.isSafeInteger(configured) && configured > 0 ? Math.min(configured, 10000000) : 10000000;
}

// USD per million tokens == micro-USD per token. Use the highest input rate
// (including cache writes) as a conservative allowance; do not claim this is a bill.
export function allowanceCost(inputTokens, outputTokens) {
  return Math.ceil(Math.max(0, inputTokens) * 0.25 + Math.max(0, outputTokens) * 1.2);
}

export function reservationFor(payload) {
  // Byte count upper-bounds ordinary UTF-8 tokenization, with room for framing.
  return allowanceCost(encoder.encode(JSON.stringify(payload)).length + 1024, MAX_OUTPUT_TOKENS);
}

export async function reserveBudget(env, amount) {
  return env.DB.prepare(`UPDATE openai_demo_budget SET charged_microusd = charged_microusd + ?
    WHERE id = 1 AND closed = 0 AND charged_microusd + ? <= ? RETURNING charged_microusd`)
    .bind(amount, amount, budgetLimit(env)).first();
}

async function settleBudget(env, reservation, cost) {
  // Unknown usage is charged at its reservation. A failed settlement leaves that
  // conservative reservation in place rather than silently reopening the budget.
  const adjustment = cost - reservation;
  await env.DB.prepare('UPDATE openai_demo_budget SET charged_microusd = MAX(0, charged_microusd + ?) WHERE id = 1')
    .bind(adjustment).run();
}

async function rateAllowed(request, env) {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${day}:${request.headers.get('CF-Connecting-IP') || 'unknown'}`;
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
  const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const now = Date.now();
  // Atomic upsert: concurrent requests cannot both pass a read-then-write race.
  return Boolean(await env.DB.prepare(`INSERT INTO openai_demo_rate (rate_key, last_at) VALUES (?, ?)
    ON CONFLICT(rate_key) DO UPDATE SET last_at = excluded.last_at
    WHERE openai_demo_rate.last_at <= ? RETURNING rate_key`).bind(key, now, now - 4000).first());
}

async function readBody(request) {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return null;
  if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  let total = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}

export function extractAnswer(data) {
  return (Array.isArray(data?.output) ? data.output : [])
    .filter(item => item.type === 'message' && item.role === 'assistant')
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(item => item.type === 'output_text' || item.type === 'refusal')
    .map(item => item.text || item.refusal || '').join('\n').trim();
}

async function chat(request, env) {
  const body = await readBody(request);
  if (!body || typeof body.message !== 'string') return fail('invalid_request', 400);
  const message = body.message.trim();
  if (!message || message.length > 1200) return fail('invalid_question', 400);
  const history = cleanOpenAIHistory(body.history);
  if (!await rateAllowed(request, env)) return fail('rate_limit', 429);
  const english = prefersEnglish(message, history);
  if (!isKaineScopeQuestion(message, history)) {
    return json({ ok: true, kind: 'out_of_scope', answer: english
      ? 'This chat introduces Kaine, his public work and possible collaboration. Please ask about one of those topics.'
      : '這裡可以介紹 Kaine、他的公開作品與合作方向，請以這些主題提問。' });
  }
  if (env.DEMO_ENABLED !== 'true' || !env.OPENAI_API_KEY) return fail('unavailable', 503);
  const budget = await env.DB.prepare('SELECT charged_microusd, closed FROM openai_demo_budget WHERE id = 1').first();
  if (!budget || budget.closed || budget.charged_microusd >= budgetLimit(env)) return fail('budget_exhausted', 429);

  let corpus;
  try {
    const pages = await loadWikiPages(env);
    corpus = buildRelevantCorpus(pages, retrievalQuestion(message, history), 6500, visitorIntent(message));
  } catch { return fail('knowledge_unavailable', 502); }
  const payload = {
    model: MODEL,
    instructions: buildVisitorSystemPrompt(corpus, message, requestsExpandedDetail(message)),
    input: [...history, { role: 'user', content: message }],
    reasoning: { effort: 'low' },
    max_output_tokens: MAX_OUTPUT_TOKENS,
    service_tier: 'default',
    store: false,
  };
  const reservation = reservationFor(payload);
  if (!await reserveBudget(env, reservation)) return fail('budget_exhausted', 429);

  // Never retry a paid request automatically: timeout does not prove it was unbilled.
  let response, data;
  try {
    response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000),
    });
    data = await response.json();
  } catch { return fail('upstream_unavailable', 502); }

  if (!response.ok) {
    if ([400, 401, 403, 404, 429].includes(response.status)) await settleBudget(env, reservation, 0);
    const quota = data?.error?.code === 'insufficient_quota' || data?.error?.type === 'insufficient_quota';
    if (quota) {
      await env.DB.prepare('UPDATE openai_demo_budget SET closed = 1 WHERE id = 1').run();
      return fail('budget_exhausted', 429);
    }
    if (response.status === 429) return fail('provider_rate_limit', 429);
    if ([400, 401, 403, 404].includes(response.status)) return fail('unavailable', 503);
    return fail('upstream_unavailable', 502);
  }
  const usage = data.usage;
  const validUsage = Number.isSafeInteger(usage?.input_tokens) && usage.input_tokens >= 0
    && Number.isSafeInteger(usage?.output_tokens) && usage.output_tokens >= 0;
  await settleBudget(env, reservation, validUsage ? allowanceCost(usage.input_tokens, usage.output_tokens) : reservation);
  if (data.status && !['completed', 'incomplete'].includes(data.status)) return fail('upstream_unavailable', 502);
  let answer = extractAnswer(data);
  if (!answer) return fail('empty_answer', 502);
  answer = canonicalizeWikiLinks(answer, corpus);
  if (shouldOfferContact(message, history)) answer = ensureCollaborationContact(answer, english);
  return json({ ok: true, kind: 'answer', answer, incomplete: data.status === 'incomplete' });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const permitted = allowed.includes(origin);
    const cors = permitted ? {
      'Access-Control-Allow-Origin': origin, Vary: 'Origin',
      'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    } : {};
    if (request.method === 'OPTIONS') return new Response(null, { status: permitted ? 204 : 403, headers: cors });
    const path = new URL(request.url).pathname;
    let response;
    try {
      if (request.method === 'GET' && path === '/api/openai/health') {
        const budget = await env.DB.prepare('SELECT charged_microusd, closed FROM openai_demo_budget WHERE id = 1').first();
        response = json({ ok: true, service: 'Kainnne x OpenAI', model: MODEL,
          available: env.DEMO_ENABLED === 'true' && Boolean(env.OPENAI_API_KEY) && Boolean(budget)
            && !budget.closed && budget.charged_microusd < budgetLimit(env),
        });
      } else if (request.method === 'POST' && path === '/api/openai/chat') {
        response = permitted ? await chat(request, env) : fail('forbidden', 403);
      } else response = fail('not_found', 404);
    } catch {
      // Never log request content, credentials or raw provider errors.
      response = fail('unavailable', 503);
    }
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(cors)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  },
};
