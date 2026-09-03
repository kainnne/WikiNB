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
  worker,
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

const zh = JSON.parse(zhText);
const en = JSON.parse(enText);
const sources = JSON.parse(sourcesText);

assert.match(worker, /function buildRelevantCorpus\(pages, question, maxChars = 6500\)/);
assert.match(worker, /selected\.length >= 4/);
assert.match(worker, /\? 4000 : 1300/);
assert.match(worker, /\.slice\(-4\)/);
assert.doesNotMatch(worker, /maxOutputTokens:/);
assert.match(worker, /thinkingLevel: 'minimal'/);
assert.match(worker, /env\.GEMINI_MODEL \|\| 'gemini-3\.1-flash-lite'/);
assert.match(wrangler, /"GEMINI_MODEL": "gemini-3\.1-flash-lite"/);
assert.match(worker, /const retryable = \[500, 502, 503, 504\]/);
assert.match(worker, /你是 Kaine 的 AI 小迷妹/);
assert.match(worker, /不要冒充 Kaine、不要用第一人稱代替 Kaine 發言/);
assert.match(worker, /只決定語氣與觀看角度，不縮小原本的回答能力/);
assert.match(worker, /欣賞 Kaine 不等於無條件吹捧/);
assert.match(worker, /const PUBLIC_SAFE_STYLE/);
assert.doesNotMatch(worker, /KAINE_PERSONA_PROMPT|personaPrompt/);
assert.match(worker, /節省免費 API 額度是必要限制/);
assert.match(worker, /完整性優先於字數/);
assert.match(worker, /REPRESENTATIVE_PROJECT_SLUGS/);
assert.match(worker, /BROAD_PROFILE_PRIORITY_SLUGS/);
assert.match(worker, /COLLABORATION_SLUG = 'AboutMe\/work-with-kaine'/);
assert.match(worker, /function asksForCollaboration\(question\)/);
assert.match(worker, /BROAD_PROFILE_PRIORITY_SLUGS = \[\s*COLLABORATION_SLUG/);
assert.match(worker, /不得以「先釐清你的專案目標」或類似合作流程作為開場/);
assert.match(worker, /逐步建立可規模化的曝光與行銷系統/);
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
assert.match(worker, /wiki-pages-v7/);
assert.match(worker, /function requestsExpandedDetail\(text\)/);
assert.match(worker, /我要\.\{0,4\}更詳細/);
assert.match(worker, /function retrievalQuestion\(message, history\)/);
assert.match(worker, /function systemPrompt\(corpus, expandedDetailRequested = false\)/);
assert.match(worker, /這裡無法提供長篇詳細回答；以下先整理必要重點/);
assert.match(worker, /最相關的 1–3 份 WikiNB 文件/);
assert.match(worker, /Instagram @kaine_z_/);
assert.match(worker, /Email ryanzhu@kainnne\.com/);
assert.match(worker, /https:\/\/api\.resend\.com\/emails/);
assert.match(worker, /env\.RESEND_API_KEY/);
assert.match(wrangler, /"EMAIL_FROM": "Kainnne × Gemini <login@auth\.kainnne\.com>"/);
assert.doesNotMatch(worker, /cloudflare-smtp|env\.SMTP_/);
assert.doesNotMatch(wrangler, /SMTP_|chaos60649@gmail\.com/);
assert.match(worker, /systemPrompt\(corpus, expandedDetailRequested\)/);
assert.match(worker, /reserveChatTurn\(env, session\.email, turnLimit\)/);
assert.match(worker, /incrementChatTurn\(env, session\.email\)/);
assert.match(worker, /chat-continuation:/);
assert.match(worker, /Kainnne x Gemini 訪客要求續聊/);
assert.match(worker, /通知信不包含訪客的聊天內容/);
assert.match(worker, /url\.pathname === '\/api\/guest-ai\/continue'/);
assert.match(worker, /ON CONFLICT\(rate_key\) DO UPDATE SET count = rate_limits\.count \+ 1/);
assert.match(worker, /kind: 'out_of_scope'/);
assert.match(worker, /conversationEnded/);
assert.match(worker, /ANONYMOUS_USAGE_IDENTITY = '__anonymous_shared__'/);
assert.match(worker, /body\.anonymous === true/);
assert.match(worker, /ANONYMOUS_NETWORK_DAILY_LIMIT/);
assert.match(worker, /ANONYMOUS_GLOBAL_DAILY_LIMIT/);
assert.match(worker, /requiresVerification: anonymous/);
assert.match(chatPolicy, /DEFAULT_MAX_CHAT_TURNS = 5/);
assert.match(chatPolicy, /isKaineScopeQuestion/);
assert.match(chatPolicy, /outOfScopeMessage/);
assert.match(chatPolicy, /PROJECT_DISCUSSION/);
assert.match(chatPolicy, /OPEN_ENDED_EXTENSION/);
assert.match(worker, /不要因為問題沒有命中特定專案名稱或固定關鍵字就拒答/);
assert.match(wrangler, /"MAX_CHAT_TURNS": "5"/);

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
assert.match(workWithKaine, /我現在最優先的合作方向/);
assert.match(workWithKaine, /把你的專業做成一個好看、好懂、好分享/);
assert.match(workWithKaine, /正式 MVP 仍在規劃與驗證階段/);
assert.match(workWithKaine, /ryanzhu@kainnne\.com/);

assert.match(page, /maxlength="1200"/);
assert.match(page, /let submittedTurns = 0/);
assert.match(page, /let continuationRequired = false/);
assert.match(page, /const ANONYMOUS_QUESTION_LIMIT = 5/);
assert.match(page, /let anonymousQuestionsUsed = 0/);
assert.match(page, /if \(running \|\| continuationRequired\) return/);
assert.match(
  page,
  /if \(!verified && anonymousQuestionsUsed >= ANONYMOUS_QUESTION_LIMIT\)[\s\S]*?openUnlock\(message\)/,
);
assert.match(page, /if \(!verified\) anonymousQuestionsUsed \+= 1/);
assert.match(page, /function openAnonymousChat\(\)/);
assert.match(page, /openChat\(session, \{ preserveConversation: shouldResume \}\)/);
assert.match(page, /requestAnimationFrame\(\(\) => chatForm\?\.requestSubmit\(\)\)/);
assert.match(page, /result\.kind === 'answer'/);
assert.match(page, /gemini\.continuePlaceholder/);
assert.match(page, /appendContinuationActions/);
assert.match(page, /continueGuestGemini\(\)/);
assert.match(
  page,
  /\['gemini\.example1', 'gemini\.example2', 'gemini\.example3', 'gemini\.example4'\]/,
);
assert.match(
  page,
  /output\.appendChild\(line\);\s*appendMessage\(t\('gemini\.welcomeMessage'\), 'assistant'\)/,
);
assert.doesNotMatch(page, /gemini\.unlockHint|gemini\.home/);
assert.doesNotMatch(page, /gemini-quota|remainingPercent|gemini\.remaining/);
assert.match(guestClient, /\['請等待 1 分鐘後再重新寄送', 'gemini\.errorResendWait'\]/);
assert.match(guestClient, /'\/api\/guest-ai\/continue'/);
assert.match(guestClient, /function askGuestGeminiAnonymous/);
assert.match(guestClient, /anonymous: true/);
assert.match(guestClient, /function describeGuestAiMessage/);
assert.match(page, /describeGuestAiMessage\(text, fallbackKey\)/);
assert.match(page, /renderMessageState\(authMessage, authMessageState\)/);
assert.equal(zh['gemini.errorResendWait'], '請等待 1 分鐘後再重新寄送');
assert.equal(en['gemini.errorResendWait'], 'Please wait 1 minute before requesting another code.');

assert.equal('gemini.connected' in zh, false);
assert.equal(
  zh['gemini.welcomeMessage'],
  'Hello！我是 Kaine 的 AI 小迷妹！我很樂意跟你分享他的作品、專長，還有 Kaine 最近的計劃目標！\n\n你想先從哪裡開始？',
);
assert.equal(zh['gemini.unlockTitle'], '解鎖訪客 AI');
assert.equal('gemini.anonymousIdentity' in zh, false);
assert.doesNotMatch(zh['gemini.welcomeMessage'], /第一個問題|第一題|免驗證/);
assert.doesNotMatch(zh['gemini.welcomeMessage'], /數位助理|分身/);
assert.match(zh['gemini.limitMessage'], /前 5 則訊息/);
assert.match(zh['gemini.limitMessage'], /寄一封通知信給 Kaine/);
assert.equal(zh['gemini.continueAndNotify'], '繼續聊天並通知 Kaine');
assert.equal(zh['gemini.example1'], '我想請 Kaine 協助我完成一個專案。');
assert.equal(zh['gemini.example2'], '我有合作構想，Kaine 可以提供哪些協助？');
assert.equal(zh['gemini.example3'], '請簡單介紹 Kaine 與他的專長。');
assert.equal(zh['gemini.example4'], '哪個專案最能代表 Kaine 的能力？');
assert.equal('gemini.connected' in en, false);
assert.equal(
  en['gemini.welcomeMessage'],
  "Hello! I'm Kaine's AI fangirl! I'd love to tell you about his work, expertise, and Kaine's latest plans and goals!\n\nWhere would you like to start?",
);
assert.equal(en['gemini.unlockTitle'], 'Unlock guest AI');
assert.equal('gemini.anonymousIdentity' in en, false);
assert.doesNotMatch(en['gemini.welcomeMessage'], /first question|no sign-in|without verification/i);
assert.doesNotMatch(en['gemini.welcomeMessage'], /digital assistant|digital twin/i);
assert.match(en['gemini.limitMessage'], /first 5 messages/i);
assert.match(en['gemini.limitMessage'], /email Kaine/i);
assert.equal(en['gemini.continueAndNotify'], 'Continue and notify Kaine');
assert.equal(en['gemini.example1'], "I'd like Kaine's help bringing a project to life.");
assert.equal(en['gemini.example2'], 'I have a collaboration idea. How could Kaine help?');
assert.equal(en['gemini.example3'], 'Please briefly introduce Kaine and his areas of expertise.');
assert.equal(en['gemini.example4'], "Which project best represents Kaine's abilities?");
assert.equal('gemini.unlockHint' in zh, false);
assert.equal('gemini.unlockHint' in en, false);
assert.equal('gemini.home' in zh, false);
assert.equal('gemini.home' in en, false);
assert.equal('gemini.remaining' in zh, false);
assert.equal('gemini.remaining' in en, false);

console.log('OK: Kaine 限定聊天維持免費額度節流與不顯示百分比');
