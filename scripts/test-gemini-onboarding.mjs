import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GEMINI_TOPICS, GEMINI_FOLLOWUPS, withPlainLanguagePreference, prepareVisitorRequest } from '../src/scripts/gemini-onboarding.js';
import { isKaineScopeQuestion } from '../worker/chat-policy.js';
import { visitorIntent, visitorGuidance, buildVisitorSystemPrompt } from '../worker/visitor-policy.js';
import workerHandler from '../worker/index.js';

assert.equal(GEMINI_TOPICS[0], 'about');
assert.equal(GEMINI_TOPICS.includes('build'), false);

for (const [question, intent] of [
  ['請介紹 Kaine 的主要專長', 'introduction'],
  ['我想認識 Kaine', 'introduction'],
  ['Who is Kaine?', 'introduction'],
  ['我是人資，Kaine 可以怎麼協助？', 'collaboration'],
  ['人力資源', 'collaboration'],
  ['How could Kaine work with an HR team?', 'collaboration'],
  ['LumaReader 有哪些技術？', 'project'],
  ['請介紹 Kaine 的代表專案', 'project'],
]) assert.equal(visitorIntent(question), intent, question);

assert.match(visitorGuidance('人資'), /合作情境/);
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

// Exercise the actual Worker retrieval helpers without adding public test exports.
const workerSource = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8');
const testModule = workerSource
  .replace("'./chat-policy.js'", JSON.stringify(new URL('../worker/chat-policy.js', import.meta.url).href))
  .replace("'./visitor-policy.js'", JSON.stringify(new URL('../worker/visitor-policy.js', import.meta.url).href))
  + '\nexport { buildRelevantCorpus, retrievalQuestion };';
const { buildRelevantCorpus, retrievalQuestion } = await import(`data:text/javascript;base64,${Buffer.from(testModule).toString('base64')}`);
const pages = [
  ['AboutMe/work-with-kaine', '網站服務與工作室規劃'],
  ['Projects/Products/kainnne-lumareader', '閱讀器技術'],
  ['Projects/project-overview', 'AI 網站設計與教育訓練'],
  ['AboutMe/03-ai-and-data', 'AI 資料整理'],
  ['AboutMe/04-collaboration-and-workstyle', '工作流程改善'],
  ['Learning/kuse-ai-practical-course', 'AI 教育訓練'],
].map(([slug, bodyText]) => ({ slug, bodyText, title: slug, tags: [] }));
const introCorpus = buildRelevantCorpus(pages, '請介紹 Kaine 的專長');
assert.ok(introCorpus.indexOf('Projects/project-overview') < introCorpus.indexOf('AboutMe/03-ai-and-data'));
assert.equal(introCorpus.includes('AboutMe/work-with-kaine'), false, 'An introduction must not start from studio sales copy');
const hrCorpus = buildRelevantCorpus(pages, '人力資源');
assert.ok(hrCorpus.indexOf('AboutMe/03-ai-and-data') < hrCorpus.indexOf('Projects/Products/kainnne-lumareader'));
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
  assert.equal(modelRequests.length, 1, 'Do not add classification or rewriting calls');
  assert.equal(modelRequests[0].contents.at(-1).parts[0].text, '我是人資，Kaine 可以如何協助？');
  assert.ok(modelRequests[0].systemInstruction.parts[0].text.includes(visitorGuidance('人資')));
  assert.equal(modelRequests[0].generationConfig.thinkingConfig.thinkingLevel, 'minimal');
} finally {
  globalThis.fetch = originalFetch;
  if (originalCaches === undefined) delete globalThis.caches;
  else globalThis.caches = originalCaches;
}
console.log('OK: bilingual entry points and follow-ups fit the API; free input and scope boundaries are preserved');
