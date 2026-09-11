import { DISCOVERY_TOPICS, drawDiscoveryTopics, discoveryQuestion } from '../worker/discovery-topics.js';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GEMINI_TOPICS, GEMINI_FOLLOWUPS, withPlainLanguagePreference, prepareVisitorRequest } from '../src/scripts/gemini-onboarding.js';
import { isKaineScopeQuestion } from '../worker/chat-policy.js';
import { visitorIntent, visitorGuidance, buildVisitorSystemPrompt, shouldOfferContact } from '../worker/visitor-policy.js';
import workerHandler from '../worker/index.js';

assert.equal(GEMINI_TOPICS[0], 'about');
assert.equal(GEMINI_TOPICS.includes('build'), false);

for (const [question, intent] of [
  ['請介紹 Kaine 的主要專長', 'introduction'],
  ['我想認識 Kaine', 'introduction'],
  ['Who is Kaine?', 'introduction'],
  ['我是人資，Kaine 可以怎麼協助？', 'collaboration'],
  ['人力資源', 'collaboration'],
  ['Kuse 怎麼用？', 'teaching'],
  ['How do I use Kuse?', 'teaching'],
  ['請 Kaine 協助團隊 AI 導入', 'collaboration'],
  ['How could Kaine work with an HR team?', 'collaboration'],
  ['LumaReader 有哪些技術？', 'project'],
  ['請介紹 Kaine 的代表專案', 'project'],
]) assert.equal(visitorIntent(question), intent, question);

assert.match(visitorGuidance('人資'), /合作情境/);
assert.equal(shouldOfferContact('請 Kaine 協助團隊 AI 導入'), true);
const contacted = [{ role: 'assistant', content: '可寄信 ryanzhu@kainnne.com' }];
assert.equal(shouldOfferContact('可以先做哪個部分？', contacted), false, 'Avoid repeating a contact footer on every follow-up');
assert.equal(shouldOfferContact('請提供聯絡方式', contacted), true);
assert.equal(shouldOfferContact('Kuse 怎麼用？'), false, 'An explicit lesson should receive its answer without a forced footer');
assert.equal(shouldOfferContact('Kaine 能提供什麼協助？', [{role: 'user', content: 'ryanzhu@kainnne.com'}]), true, 'A user mentioning an email is not a delivered invitation');
assert.doesNotMatch(visitorGuidance('請介紹 Kaine'), /LumaReader|GEO|ScopeCut/);
assert.match(buildVisitorSystemPrompt('測試來源', '人資'), /招募、薪酬或勞動法規的判斷仍由人資專業人員負責/);
assert.ok(buildVisitorSystemPrompt('', '人資').length < 2500, 'Keep the system rules compact');
assert.match(buildVisitorSystemPrompt('第一人稱筆記', '人資').split('第一人稱筆記')[1], /以第三人稱介紹 Kaine/, 'Reinforce identity after source text');

for (const locale of ['zh-TW', 'en']) {
  const strings = JSON.parse(await readFile(new URL(`../src/locales/${locale}.json`, import.meta.url), 'utf8'));
  const preference = strings['gemini.plainPreference'];
  const questionKeys = new Set();
  for (const topic of GEMINI_TOPICS) {
    for (const part of ['title', 'description', 'question']) {
      assert.ok(strings[`gemini.entry.${topic}.${part}`], `${locale}: ${topic}.${part}`);
    }
    questionKeys.add(`gemini.entry.${topic}.question`);
    for (const choice of GEMINI_FOLLOWUPS[topic]) {
      const base = GEMINI_TOPICS.includes(choice) ? `gemini.entry.${choice}` : `gemini.next.${choice}`;
      assert.ok(strings[`${base}.${GEMINI_TOPICS.includes(choice) ? 'title' : 'label'}`]);
      questionKeys.add(`${base}.question`);
    }
  }
  for (const choice of ['examples', 'prepare']) questionKeys.add(`gemini.next.${choice}.question`);
  for (const key of questionKeys) {
    const question = strings[key];
    assert.ok(question, `${locale}: ${key}`);
    const request = withPlainLanguagePreference(question, preference, question);
    assert.ok(request.startsWith(question), 'Do not invent or replace the visitor’s question');
    assert.ok(request.includes(preference), 'Curated questions must fit with the response guidance');
    assert.ok(request.length <= 1200, 'Respect the deployed Worker’s input limit');
    assert.equal(isKaineScopeQuestion(question, []), true, 'Entry points must be within chat scope before guidance is added');
    const prepared = prepareVisitorRequest(question, preference, question, [], locale === 'en');
    assert.ok(prepared.includes(visitorGuidance(question, locale === 'en')), `Routing guidance fits: ${key}`);
    assert.ok(prepared.includes(preference), `Style preference fits: ${key}`);
  }
  const unrelated = locale === 'en' ? 'What is the weather today?' : '今天的天氣如何？';
  assert.equal(withPlainLanguagePreference(unrelated, preference), unrelated);
  assert.equal(prepareVisitorRequest(unrelated, preference, ''), unrelated, 'Do not turn unrelated free input into a Kaine question');
  assert.ok(prepareVisitorRequest(locale === 'en' ? 'Human resources' : '人力資源', preference, '', [], locale === 'en').includes(visitorGuidance('人力資源', locale === 'en')));
  assert.equal(withPlainLanguagePreference(unrelated, preference, strings['gemini.entry.about.question']), unrelated);
  const maximumInput = 'x'.repeat(1200);
  assert.equal(withPlainLanguagePreference(maximumInput, preference, maximumInput), maximumInput, 'Never clip user text to fit guidance');
}

// Retrieval helpers are shared with OpenAI; expose only the private token helper for tests.
const workerSource = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
const testModule = workerSource
  .replace("'./chat-policy.js'", JSON.stringify(new URL('../worker/chat-policy.js', import.meta.url).href))
  .replace("'./discovery-topics.js'", JSON.stringify(new URL('../worker/discovery-topics.js', import.meta.url).href))
  .replace("'./visitor-policy.js'", JSON.stringify(new URL('../worker/visitor-policy.js', import.meta.url).href))
  + '\nexport { issueGuestToken };';
const { buildRelevantCorpus, retrievalQuestion, issueGuestToken } = await import(`data:text/javascript;base64,${Buffer.from(testModule).toString('base64')}`);
const firstDraw = drawDiscoveryTopics([], () => 0.4);
const secondDraw = drawDiscoveryTopics(firstDraw.map((topic) => topic.id), () => 0.7);
assert.equal(firstDraw.length, 5);
assert.equal(new Set(firstDraw.map((topic) => topic.id)).size, 5);
assert.ok(secondDraw.every((topic) => !firstDraw.some((old) => old.id === topic.id)));
for (const topic of DISCOVERY_TOPICS) {
  const source = await readFile(new URL(`../wiki/${topic.slug}.md`, import.meta.url), 'utf8');
  assert.ok(source.length > 0);
  for (const english of [false, true]) {
    const question = discoveryQuestion(topic, english);
    assert.ok(question.length <= 1200);
    assert.equal(visitorIntent(question), 'project');
    assert.equal(isKaineScopeQuestion(question), true);
  }
  const corpus = buildRelevantCorpus([
    { slug: 'Projects/Products/kainnne-lumareader', bodyText: 'Reading', tags: [] },
    { slug: topic.slug, bodyText: source, tags: [] },
  ], discoveryQuestion(topic));
  assert.ok(corpus.startsWith(`\n---\n筆記：${topic.slug}`), 'The selected discovery topic must be the first retrieved source');
}
const pages = [
  ['AboutMe/work-with-kaine', '網站服務與工作室規劃'],
  ['Projects/Products/kainnne-lumareader', '閱讀器技術'],
  ['Projects/project-overview', 'AI 網站設計與教育訓練'],
  ['AboutMe/03-ai-and-data', 'AI 資料整理'],
  ['AboutMe/04-collaboration-and-workstyle', '工作流程改善'],
  ['AboutMe/02-software-development', '網站與自動化實作'],
  ['Learning/kuse-ai-practical-course', 'AI 教育訓練'],
].map(([slug, bodyText]) => ({ slug, bodyText, title: slug, tags: [] }));
const introCorpus = buildRelevantCorpus(pages, '請介紹 Kaine 的專長');
assert.ok(introCorpus.indexOf('Projects/project-overview') < introCorpus.indexOf('AboutMe/03-ai-and-data'));
assert.equal(introCorpus.includes('AboutMe/work-with-kaine'), false, 'An introduction must not start from studio sales copy');
assert.equal(introCorpus.includes('Learning/kuse-ai-practical-course'), false, 'General introductions must not default to course material');
assert.ok(introCorpus.includes('AboutMe/02-software-development'));
const lessonCorpus = buildRelevantCorpus(pages, 'Kuse 怎麼用？');
assert.ok(lessonCorpus.indexOf('Learning/kuse-ai-practical-course') < lessonCorpus.indexOf('AboutMe/03-ai-and-data'), 'Explicit Kuse instructions prioritize course evidence');
const hrCorpus = buildRelevantCorpus(pages, '人力資源');
assert.ok(hrCorpus.includes('AboutMe/03-ai-and-data'));
assert.ok(hrCorpus.includes('AboutMe/02-software-development'));
assert.ok(!hrCorpus.includes('Projects/Products/kainnne-lumareader') || hrCorpus.indexOf('AboutMe/03-ai-and-data') < hrCorpus.indexOf('Projects/Products/kainnne-lumareader'));
assert.ok(hrCorpus.length <= 6500);
assert.ok((hrCorpus.match(/筆記：/g) || []).length <= 4);
const questionWithHistory = retrievalQuestion('人資呢？', [
  { role: 'user', content: 'Kaine 能如何幫我？' },
  { role: 'assistant', content: '不可靠的過去回答：Kaine 是人資專家' },
]);
assert.equal(questionWithHistory.includes('人資專家'), false, 'Do not retrieve based on the model’s unsupported prior claims');

// Test request handling with a cached fixture and a mocked model. These checks
// verify wiring and call count, not the quality of a live model's answer.
const originalFetch = globalThis.fetch;
const originalCaches = globalThis.caches;
const modelRequests = [];
const env = {
  GEMINI_API_KEY: 'test-only-key',
  DB: { prepare: () => ({ bind() { return this; }, first: async () => null, run: async () => ({ success: true }) }) },
};
try {
  globalThis.caches = { default: { match: async () => Response.json(pages) } };
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /^https:\/\/generativelanguage.googleapis.com\//);
    modelRequests.push(JSON.parse(options.body));
    return Response.json({ candidates: [{ content: { parts: [{ text: '測試回答' }] }, finishReason: 'STOP' }], usageMetadata: { totalTokenCount: 40 } });
  };
  const request = (message, originalMessage) => new Request('https://local.test/api/guest-ai/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, originalMessage, history: [], anonymous: true }),
  });
  const tooLong = await workerHandler.fetch(request('短問題', 'x'.repeat(1201)), env, {});
  assert.equal(tooLong.status, 400, 'Validate the original question length');
  const offTopic = await workerHandler.fetch(request('Kaine 的 AI 能力', '教我微積分'), env, {});
  assert.equal((await offTopic.json()).kind, 'out_of_scope');
  assert.equal(modelRequests.length, 0, 'Presentation guidance cannot bypass the scope gate or consume model calls');
  const hrResult = await workerHandler.fetch(request('LumaReader 架構與客戶端偏好', '我是人資，Kaine 可以如何協助？'), env, {});
  assert.equal(hrResult.status, 200);
  assert.match((await hrResult.json()).answer, /ryanzhu@kainnne\.com/, 'A first collaboration answer includes a contact route even when the model omits it');
  assert.equal(modelRequests.length, 1, 'Do not add classification or rewriting calls');
  assert.equal(modelRequests[0].contents.at(-1).parts[0].text, '我是人資，Kaine 可以如何協助？');
  assert.ok(modelRequests[0].systemInstruction.parts[0].text.includes(visitorGuidance('人資')));
  assert.equal(modelRequests[0].generationConfig.thinkingConfig.thinkingLevel, 'minimal');

  // Exercise real signed-session handling across the retired five-turn gate.
  let turns = 4;
  let tokens = 0;
  let burstBlocked = false;
  const verifiedEnv = {
    GEMINI_API_KEY: 'test-only-key', TOKEN_SECRET: 'test-only-signing-secret', DAILY_TOKEN_LIMIT: '1000',
    DB: { prepare(sql) { return {
      bind(...values) { this.values = values; return this; },
      async first() {
        assert.ok(!String(this.values?.[0]).startsWith('chat-continuation:'), 'No continuation approval records are read');
        if (sql.includes('FROM daily_usage')) return { count: turns, token_count: tokens };
        if (String(this.values?.[0]).startsWith('chat-turns:')) {
          if (sql.includes('RETURNING count')) return { count: ++turns };
          return { count: turns };
        }
        if (burstBlocked && String(this.values?.[0]).startsWith('chat:')) return { count: 1, window_start: Date.now() };
        return null;
      },
      async run() {
        if (sql.includes('INSERT INTO daily_usage')) tokens += Number(this.values[2] || 0);
        return { success: true };
      },
    }; } },
  };
  const token = await issueGuestToken({ email: 'visitor@example.com', name: 'Test visitor' }, verifiedEnv);
  const signedRequest = (path = 'chat', method = 'POST', bearer = token) => new Request(`https://local.test/api/guest-ai/${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    ...(method === 'POST' ? { body: JSON.stringify({ message: 'Kaine 可以協助哪些工作？', history: [] }) } : {}),
  });
  for (const prior of [4, 5, 11]) {
    turns = prior;
    const reply = await workerHandler.fetch(signedRequest(), verifiedEnv, {});
    assert.equal(reply.status, 200);
    const data = await reply.json();
    assert.equal(data.kind, 'answer');
    assert.equal(data.chatTurnsUsed, prior + 1);
    assert.equal(data.continuationRequired, false);
    assert.equal(data.conversationEnded, false);
    assert.equal(data.chatTurnLimit, null);
    assert.doesNotMatch(data.answer, /是否續聊|繼續聊天並通知/);
  }
  const callsBeforeChecks = modelRequests.length;
  const meResponse = await workerHandler.fetch(signedRequest('me', 'GET'), verifiedEnv, {});
  assert.equal((await meResponse.json()).continuationRequired, false, 'Reopening an older session cannot restore the gate');
  const legacyResponse = await workerHandler.fetch(signedRequest('continue'), verifiedEnv, {});
  const legacy = await legacyResponse.json();
  assert.equal(legacy.continuationRequired, false);
  assert.equal(legacy.notificationSent, false, 'Older tabs never send a continuation email');
  assert.equal((await workerHandler.fetch(signedRequest('continue', 'POST', 'invalid'), verifiedEnv, {})).status, 401);
  tokens = 1000;
  const exhausted = await workerHandler.fetch(signedRequest(), verifiedEnv, {});
  assert.equal(exhausted.status, 429);
  assert.match((await exhausted.json()).error, /共享額度已達上限/);
  tokens = 0; burstBlocked = true;
  assert.equal((await workerHandler.fetch(signedRequest(), verifiedEnv, {})).status, 429, 'Burst protection remains active');
  assert.equal((await workerHandler.fetch(signedRequest('chat', 'POST', 'invalid'), verifiedEnv, {})).status, 401);
  assert.equal(modelRequests.length, callsBeforeChecks, 'Quota, authentication and session refresh never call the model');

} finally {
  globalThis.fetch = originalFetch;
  if (originalCaches === undefined) delete globalThis.caches;
  else globalThis.caches = originalCaches;
}
console.log('OK: bilingual entry points and follow-ups fit the API; free input and scope boundaries are preserved');
