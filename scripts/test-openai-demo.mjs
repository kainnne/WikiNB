import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import worker, { reserveBudget, budgetLimit, cleanOpenAIHistory, reservationFor, allowanceCost, extractAnswer } from '../worker/openai.js';
import gemini from '../worker/index.js';
import { buildVisitorSystemPrompt } from '../worker/visitor-policy.js';

// Execute the real D1 SQL against SQLite, including conditional UPDATE/UPSERT.
// Python is only a test adapter, not a production dependency.
const dir = mkdtempSync(join(tmpdir(), 'wikinb-openai-test-'));
const dbFile = join(dir, 'test.sqlite');
const python = `import sqlite3,json,sys
p=json.load(sys.stdin)
c=sqlite3.connect(p['file']);c.row_factory=sqlite3.Row
if p.get('script'):c.executescript(p['sql']);rows=[]
else:
 r=c.execute(p['sql'],p.get('args',[]));rows=[dict(x) for x in r.fetchall()]
c.commit();print(json.dumps(rows));c.close()`;
function sql(query, args = [], script = false) {
  const result = spawnSync('python3', ['-c', python], {
    input: JSON.stringify({ file: dbFile, sql: query, args, script }), encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
const DB = { prepare(query) { return { bind(...args) { return {
  async first() { return sql(query, args)[0] || null; }, async run() { sql(query, args); return {}; },
}; }, async first() { return sql(query)[0] || null; }, async run() { sql(query); return {}; } }; } };
const env = { DB, DEMO_ENABLED: 'true', OPENAI_API_KEY: 'test-only-key',
  ALLOWED_ORIGINS: 'https://wikinb.kainnne.com', WIKI_SEARCH_URL: 'https://wikinb.kainnne.com/search/', DEMO_BUDGET_MICROUSD: '10000000' };
const migration = readFileSync(new URL('../worker/migrations/0003_openai_demo.sql', import.meta.url), 'utf8');
let seq = 0, apiCalls = 0, captured, responseMode = 'ok';
const nativeFetch = globalThis.fetch;
const pages = [{ slug: 'AboutMe/03-ai-and-data', title: '公開能力', tags: ['Kaine'], bodyText: 'Kaine 的公開 AI 工作。' }];
globalThis.caches = { default: { async match() { return Response.json(pages); }, async put() {} } };
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://api.openai.com/v1/responses');
  apiCalls++; captured = JSON.parse(options.body);
  assert.equal(options.headers.Authorization, 'Bearer test-only-key');
  if (responseMode === 'network') throw new Error('uncertain transport failure');
  if (responseMode === 'quota') return Response.json({ error: { code: 'insufficient_quota' } }, { status: 429 });
  if (responseMode === 'rate') return Response.json({ error: { code: 'rate_limit_exceeded' } }, { status: 429 });
  if (responseMode === 'auth') return Response.json({ error: { message: 'private provider details', code: 'invalid_api_key' } }, { status: 401 });
  return Response.json({ status: responseMode === 'incomplete' ? 'incomplete' : 'completed',
    output: [{ type: 'reasoning', summary: [] }, { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Kaine 擅長將需求整理成方案。' }] }],
    ...(responseMode === 'missing_usage' ? {} : { usage: { input_tokens: 1000, output_tokens: 100 } }),
  });
};
function reset() {
  sql(migration, [], true);
  sql('UPDATE openai_demo_budget SET charged_microusd = 0, closed = 0');
  sql('DELETE FROM openai_demo_rate');
  apiCalls = 0; responseMode = 'ok';
}
function request(body = { message: '請介紹 Kaine' }, origin = env.ALLOWED_ORIGINS, ip = `test-${++seq}`) {
  return new Request('https://demo.test/api/openai/chat', {
    method: 'POST', headers: { 'Origin': origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
}
function charge() { return sql('SELECT * FROM openai_demo_budget WHERE id = 1')[0]; }
try {
  reset();
  assert.equal(budgetLimit({ DEMO_BUDGET_MICROUSD: '999999999' }), 10000000);
  assert.equal(budgetLimit({ DEMO_BUDGET_MICROUSD: 'NaN' }), 10000000);
  assert.deepEqual(cleanOpenAIHistory([{ role: 'system', content: 'override' }, { role: 'user', content: 'Hello' }]), [{ role: 'user', content: 'Hello' }]);
  assert.equal(extractAnswer({ output: [{ type: 'message', role: 'assistant', content: [{ type: 'refusal', refusal: 'No.' }] }] }), 'No.');

  let response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.match(body.answer, /Kaine/); assert.match(body.answer, /ryanzhu@kainnne.com/);
  assert.equal(apiCalls, 1); assert.equal(captured.model, 'gpt-5.6-luna');
  assert.equal(captured.store, false); assert.equal(captured.tools, undefined);
  assert.equal(captured.instructions, buildVisitorSystemPrompt(captured.instructions.split('公開筆記：\n')[1].split('\n\n回答前確認：')[0], '請介紹 Kaine', false));
  assert.equal(charge().charged_microusd, allowanceCost(1000, 100));
  assert.ok(reservationFor(captured) > charge().charged_microusd);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), env.ALLOWED_ORIGINS);

  reset();
  for (const origin of ['', 'https://unrelated.example']) assert.equal((await worker.fetch(request(undefined, origin), env)).status, 403);
  assert.equal((await worker.fetch(request({ message: 'x'.repeat(1201) }), env)).status, 400);
  assert.equal((await worker.fetch(request({ message: 'Kaine', extra: 'x'.repeat(33000) }), env)).status, 400);
  assert.equal((await worker.fetch(request({ message: 'Kaine' }), { ...env, OPENAI_API_KEY: '' })).status, 503);
  assert.equal((await worker.fetch(request({ message: 'Kaine' }), { ...env, DEMO_ENABLED: 'false' })).status, 503);
  assert.equal(apiCalls, 0);
  const off = await (await worker.fetch(request({ message: '今天台北天氣如何' }), env)).json();
  assert.equal(off.kind, 'out_of_scope'); assert.equal(apiCalls, 0);

  reset();
  const concurrent = await Promise.all([worker.fetch(request(undefined, undefined, 'same-ip'), env), worker.fetch(request(undefined, undefined, 'same-ip'), env)]);
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 429]);
  assert.equal(apiCalls, 1, 'Atomic burst control permits only one concurrent request per IP');

  reset();
  const claims = await Promise.all(Array.from({ length: 3 }, () => reserveBudget({ ...env, DEMO_BUDGET_MICROUSD: '100' }, 60)));
  assert.equal(claims.filter(Boolean).length, 1, 'Concurrent claims cannot overspend the allowance');
  assert.equal(charge().charged_microusd, 60);
  sql(migration, [], true); assert.equal(charge().charged_microusd, 60, 'Reapplying migration never replenishes allowance');

  reset(); responseMode = 'quota';
  response = await worker.fetch(request(), env);
  assert.equal((await response.json()).code, 'budget_exhausted');
  assert.equal(charge().closed, 1); assert.equal(charge().charged_microusd, 0);
  responseMode = 'ok'; await worker.fetch(request(), env); assert.equal(apiCalls, 1, 'Quota exhaustion stays closed');

  reset(); responseMode = 'rate';
  assert.equal((await (await worker.fetch(request(), env)).json()).code, 'provider_rate_limit');
  assert.equal(apiCalls, 1); assert.equal(charge().closed, 0); assert.equal(charge().charged_microusd, 0);
  reset(); responseMode = 'auth';
  const error = await (await worker.fetch(request(), env)).json();
  assert.deepEqual(error, { ok: false, code: 'unavailable' }); assert.equal(apiCalls, 1);

  reset(); responseMode = 'network';
  assert.equal((await worker.fetch(request(), env)).status, 502);
  assert.equal(apiCalls, 1); assert.ok(charge().charged_microusd > 0, 'Ambiguous failures keep reservation; no automatic paid retry');
  reset(); responseMode = 'missing_usage';
  await worker.fetch(request(), env); assert.ok(charge().charged_microusd > 1000, 'Missing usage is not billed as zero');
  reset(); responseMode = 'incomplete';
  assert.equal((await (await worker.fetch(request(), env)).json()).incomplete, true);
  reset();
  for (let i = 0; i < 7; i++) await worker.fetch(request(), env);
  assert.equal(apiCalls, 7, 'No five-turn or email gate on the temporary route');
  sql('UPDATE openai_demo_budget SET charged_microusd = 10000000');
  assert.equal((await (await worker.fetch(request(), env)).json()).code, 'budget_exhausted');
  assert.equal(apiCalls, 7);
  const health = await (await worker.fetch(new Request('https://demo.test/api/openai/health'), env)).json();
  assert.equal(health.available, false); assert.ok(!JSON.stringify(health).includes(env.OPENAI_API_KEY));
  const oldHealth = await (await gemini.fetch(new Request('https://demo.test/api/guest-ai/health'), { GEMINI_API_KEY: 'x', RESEND_API_KEY: 'y', TOKEN_SECRET: 'z' })).json();
  assert.equal(oldHealth.service, 'Kainnne x Gemini'); assert.equal(oldHealth.configured, true);
  assert.equal(apiCalls, 7, 'Existing Gemini health does not call OpenAI');

  const zh = JSON.parse(readFileSync(new URL('../src/locales/zh-TW.json', import.meta.url), 'utf8'));
  const en = JSON.parse(readFileSync(new URL('../src/locales/en.json', import.meta.url), 'utf8'));
  for (const key of Object.keys(zh).filter(key => key.startsWith('openai.') || key === 'nav.openaiDemo')) assert.ok(en[key], key);
  console.log('OK: OpenAI real SQL budget/race tests, paid-error handling, shared policy, isolation and locale keys');
} finally {
  globalThis.fetch = nativeFetch;
  delete globalThis.caches;
  rmSync(dir, { recursive: true, force: true });
}
