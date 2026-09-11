/**
 * Static regression checks for the public Gemini assistant's free-tier budget.
 * These checks intentionally pin the UI and Worker limits that prevent a single
 * broad question from sending the full WikiNB corpus or requesting a long answer.
 *
 * Run: node scripts/test-gemini-budget.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  workerSource,
  chatPolicy,
  wrangler,
  page,
  guestClient,
  zhText,
  enText,
  sourcesText,
  wikiIndex,
  softwareProfile,
  projectOverview,
  workWithKaine,
] = await Promise.all([
  readFile(new URL('../worker/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../worker/chat-policy.js', import.meta.url), 'utf8'),
  readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/gemini.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/scripts/guest-gemini-client.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/zh-TW.json', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/en.json', import.meta.url), 'utf8'),
  readFile(new URL('../config/project-knowledge-sources.json', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/index.md', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/AboutMe/02-software-development.md', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/Projects/project-overview.md', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/AboutMe/work-with-kaine.md', import.meta.url), 'utf8'),
]);

const worker = workerSource + '\n' + await readFile(new URL('../worker/visitor-policy.js', import.meta.url), 'utf8');
const zh = JSON.parse(zhText);
const en = JSON.parse(enText);
const sources = JSON.parse(sourcesText);

assert.match(worker, /function buildRelevantCorpus\(pages, question, maxChars = 6500, intent = visitorIntent\(question\)\)/);
assert.match(worker, /selected\.length >= 4/);
assert.match(worker, /\? 4000 : 1300/);
assert.match(worker, /\.slice\(-4\)/);
assert.doesNotMatch(worker, /maxOutputTokens:/);
assert.match(worker, /thinkingLevel: 'minimal'/);
assert.match(worker, /env\.GEMINI_MODEL \|\| 'gemini-3\.1-flash-lite'/);
assert.match(wrangler, /"GEMINI_MODEL": "gemini-3\.1-flash-lite"/);
assert.match(worker, /const retryable = \[500, 502, 503, 504\]/);
assert.match(worker, /你是介紹 Kaine 的 AI 助理/);
assert.doesNotMatch(worker + zhText + enText, /小迷妹|fangirl/i);
assert.match(worker, /不要冒充 Kaine、不要用第一人稱代替 Kaine 發言/);
assert.match(worker, /可分析可行的合作方法，但所有建議須連回 Kaine 的已知能力/);
assert.match(worker, /語氣自然、客觀且專業/);
assert.match(worker, /const PUBLIC_SAFE_STYLE/);
assert.doesNotMatch(worker, /KAINE_PERSONA_PROMPT|personaPrompt/);
assert.match(worker, /節省免費 API 額度是必要限制/);
assert.match(worker, /完整性優先於字數/);
assert.match(worker, /REPRESENTATIVE_PROJECT_SLUGS/);
assert.match(worker, /BROAD_PROFILE_PRIORITY_SLUGS/);
assert.match(worker, /COLLABORATION_SLUG = 'AboutMe\/work-with-kaine'/);
assert.match(worker, /function asksForCollaboration\(question\)/);
assert.match(chatPolicy, /function ensureCollaborationContact\(answer, english = false\)/);
assert.match(worker, /ensureCollaborationContact,/);
assert.doesNotMatch(worker, /conciseCollaborationRequested|本次泛用合作詢問格式/);
assert.match(worker, /ryanzhu@kainnne\.com/);
assert.match(worker, /'KCIS\/WikiNB-KCIS'/);
assert.match(worker, /'Learning\/kuse-ai-practical-course'/);
assert.match(worker, /EXCLUDED_PUBLIC_SLUGS/);
assert.match(worker, /projects\/products\/musicmatch/);
assert.match(worker, /projects\/products\/ambient-ai/);
assert.match(worker, /projects\/machine-learning\/house-price-regression/);
assert.match(worker, /projects\/creative\/moonbase-contractor/);
assert.match(worker, /projects\/2026-08-03-zhuxi-reincarnation-renpy/);
assert.match(worker, /只介紹 LumaReader/);
assert.match(worker, /Kaine 主要專案與能力總覽/);
assert.match(worker, /WikiNB 與 GEO 目前沒有自動排程/);
assert.match(worker, /wiki-pages-v9/);
assert.match(worker, /function requestsExpandedDetail\(text\)/);
assert.match(worker, /我要\.\{0,4\}更詳細/);
assert.match(worker, /function retrievalQuestion\(message, history\)/);
assert.match(worker, /function systemPrompt\(corpus, expandedDetailRequested = false, message = ''\)/);
assert.match(worker, /最相關的 1–3 份 WikiNB 文件/);
assert.match(worker, /https:\/\/api\.resend\.com\/emails/);
assert.match(worker, /env\.RESEND_API_KEY/);
assert.match(wrangler, /"EMAIL_FROM": "Kainnne × Gemini <login@auth\.kainnne\.com>"/);
assert.doesNotMatch(worker, /cloudflare-smtp|env\.SMTP_/);
assert.doesNotMatch(wrangler, /SMTP_|chaos60649@gmail\.com/);
assert.match(worker, /systemPrompt\(corpus, expandedDetailRequested, message\)/);
assert.match(worker, /incrementChatTurn\(env, session\.email\)/);
assert.match(worker, /url\.pathname === '\/api\/guest-ai\/continue'/);
assert.match(worker, /ON CONFLICT\(rate_key\) DO UPDATE SET count = rate_limits\.count \+ 1/);
assert.match(worker, /kind: 'out_of_scope'/);
assert.match(worker, /conversationEnded/);
assert.match(worker, /ANONYMOUS_USAGE_IDENTITY = '__anonymous_shared__'/);
assert.match(worker, /body\.anonymous === true/);
assert.match(worker, /const history = Array\.isArray\(body\.history\) \? body\.history : \[\]/);
assert.match(worker, /ANONYMOUS_NETWORK_DAILY_LIMIT/);
assert.match(worker, /ANONYMOUS_GLOBAL_DAILY_LIMIT/);
assert.match(worker, /requiresVerification: anonymous/);
assert.match(chatPolicy, /isKaineScopeQuestion/);
assert.match(chatPolicy, /outOfScopeMessage/);
assert.match(chatPolicy, /PROJECT_DISCUSSION/);
assert.match(chatPolicy, /OPEN_ENDED_EXTENSION/);
assert.match(chatPolicy, /模糊問題交給 Gemini 依公開 WikiNB 與系統規則判斷/);
assert.match(guestClient, /askGuestGeminiAnonymous\(\{ message, history, originalMessage = message \}\)/);
assert.match(guestClient, /JSON\.stringify\(\{ message, history, originalMessage, anonymous: true \}\)/);
assert.match(page, /askGuestGeminiAnonymous\(\{ message: requestMessage, history, originalMessage: message \}\)/);
assert.match(worker, /不要因為問題沒有命中特定專案名稱或固定關鍵字就拒答/);

const retiredSourceIds = new Set([
  'musicmatch',
  'house-price-regression',
  'ambient-ai',
  'moonbase-contractor',
]);
assert.equal(sources.sources.some((source) => retiredSourceIds.has(source.id)), false);
assert.match(wikiIndex, /康橋 AI 導入、教育訓練與可操作的數位產品/);
assert.match(wikiIndex, /若只需要選一個代表產品，仍以 \*\*LumaReader\*\* 為優先/);
assert.doesNotMatch(wikiIndex, /MusicMatch|house-price-regression|ambient-ai|moonbase|朱璽轉生/);
assert.match(softwareProfile, /若只需要選一個代表專案，首選是 \*\*LumaReader\*\*/);
assert.match(projectOverview, /\*\*康橋 AI 導入\*\*/);
assert.match(projectOverview, /\*\*Kuse AI 教育訓練\*\*/);
assert.match(projectOverview, /## 完整產品能力/);
assert.match(projectOverview, /\*\*CodexRules／agents CLI\*\*/);
assert.match(projectOverview, /\*\*LumaReader\*\*/);
assert.match(projectOverview, /\*\*音樂能力\*\*/);
assert.match(wikiIndex, /\[\[AboutMe\/work-with-kaine\]\]/);
assert.match(workWithKaine, /Kainnne Studio/);
assert.match(workWithKaine, /MusicMatch/);
assert.match(workWithKaine, /我現在最優先提供的合作服務/);
assert.match(workWithKaine, /想向誰呈現、想宣傳什麼/);
assert.match(workWithKaine, /客製一個適合的呈現形式/);
assert.match(workWithKaine, /UI／UX、內容整理與網站實作是完成這項服務的方法/);
assert.match(workWithKaine, /正式 MVP 仍在規劃與驗證階段/);
assert.match(workWithKaine, /ryanzhu@kainnne\.com/);

assert.match(page, /maxlength="1200"/);
assert.match(page, /const ANONYMOUS_QUESTION_LIMIT = 5/);
assert.match(page, /let anonymousQuestionsUsed = 0/);
assert.match(
  page,
  /if \(!verified && anonymousQuestionsUsed >= ANONYMOUS_QUESTION_LIMIT\)[\s\S]*?openUnlock\(message\)/,
);
assert.match(page, /if \(!verified\) anonymousQuestionsUsed \+= 1/);
assert.match(page, /function openAnonymousChat\(\)/);
assert.match(page, /openChat\(session, \{ preserveConversation: shouldResume \}\)/);
assert.match(page, /requestAnimationFrame\(\(\) => chatForm\?\.requestSubmit\(\)\)/);
assert.match(page, /result\.kind === 'answer'/);
assert.match(page, /randomize \? discoveryTopics : GEMINI_TOPICS/);
assert.match(page, /submitChoice\(`gemini\.entry\.\$\{topic\}\.question`\)/);
assert.match(page, /prepareVisitorRequest\(message, t\('gemini\.plainPreference'\), selectedQuestion, history, getLocale\(\) === 'en'\)/);
assert.doesNotMatch(page, /gemini\.unlockHint|gemini\.home/);
assert.doesNotMatch(page, /gemini-quota|remainingPercent|gemini\.remaining/);
assert.match(guestClient, /\['請等待 1 分鐘後再重新寄送', 'gemini\.errorResendWait'\]/);
assert.doesNotMatch(guestClient, /'\/api\/guest-ai\/continue'/);
assert.match(guestClient, /function askGuestGeminiAnonymous/);
assert.match(guestClient, /anonymous: true/);
assert.match(guestClient, /function describeGuestAiMessage/);
assert.match(page, /describeGuestAiMessage\(text, fallbackKey\)/);
assert.match(page, /renderMessageState\(authMessage, authMessageState\)/);
assert.equal(zh['gemini.errorResendWait'], '請等待 1 分鐘後再重新寄送');
assert.equal(en['gemini.errorResendWait'], 'Please wait 1 minute before requesting another code.');

assert.equal('gemini.connected' in zh, false);
assert.match(zh['gemini.welcomeMessage'], /Kaine/);
assert.equal(zh['gemini.unlockTitle'], '解鎖訪客 AI');
assert.equal('gemini.anonymousIdentity' in zh, false);
assert.doesNotMatch(zh['gemini.welcomeMessage'], /第一個問題|第一題|免驗證/);
assert.doesNotMatch(zh['gemini.welcomeMessage'], /數位助理|分身/);
assert.equal('gemini.connected' in en, false);
assert.match(en['gemini.welcomeMessage'], /Kaine/);
assert.equal(en['gemini.unlockTitle'], 'Unlock guest AI');
assert.equal('gemini.anonymousIdentity' in en, false);
assert.doesNotMatch(en['gemini.welcomeMessage'], /first question|no sign-in|without verification/i);
assert.doesNotMatch(en['gemini.welcomeMessage'], /digital assistant|digital twin/i);
assert.equal('gemini.unlockHint' in zh, false);
assert.equal('gemini.unlockHint' in en, false);
assert.equal('gemini.home' in zh, false);
assert.equal('gemini.home' in en, false);
assert.equal('gemini.remaining' in zh, false);
assert.equal('gemini.remaining' in en, false);

console.log('OK: Kaine 限定聊天維持免費額度節流與不顯示百分比');

assert.doesNotMatch(worker, /reserveChatTurn|chat-continuation:|訪客要求續聊|appendContinuationPrompt/);
assert.doesNotMatch(page, /continuationRequired|continueGuestGemini|gemini-scroll-latest|gemini-contact|gemini-unlock-contact/);
assert.doesNotMatch(wrangler, /MAX_CHAT_TURNS/);
