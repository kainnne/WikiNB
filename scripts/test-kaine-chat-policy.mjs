import assert from 'node:assert/strict';

import {
  appendContinuationPrompt,
  continuationPromptMessage,
  isKaineScopeQuestion,
  maxChatTurns,
  outOfScopeMessage,
  prefersEnglish,
} from '../worker/chat-policy.js';

assert.equal(isKaineScopeQuestion('請介紹 Kaine 的代表專案'), true);
assert.equal(isKaineScopeQuestion('你的 WikiNB 是怎麼做的？'), true);
assert.equal(isKaineScopeQuestion('你會什麼？'), true);
assert.equal(isKaineScopeQuestion('Who are you?'), true);
assert.equal(isKaineScopeQuestion('LumaReader 用了哪些技術？'), true);
assert.equal(isKaineScopeQuestion('康橋 AI 導入與教育訓練有哪些成果？'), true);
assert.equal(isKaineScopeQuestion('Kuse 課程教了什麼？'), true);
assert.equal(isKaineScopeQuestion('我想請 Kaine 協助我完成一個專案'), true);
assert.equal(isKaineScopeQuestion('我有合作構想，Kaine 可以提供哪些協助？'), true);
assert.equal(isKaineScopeQuestion('這個專案還能增加哪些額外功能？'), true);
assert.equal(isKaineScopeQuestion('你覺得這套系統有什麼改進方向？'), true);
assert.equal(isKaineScopeQuestion('How could this project be extended?'), true);
assert.equal(isKaineScopeQuestion('教我微積分'), false);
assert.equal(isKaineScopeQuestion('幫我寫英文作業'), false);
assert.equal(isKaineScopeQuestion('幫我規劃台北三日遊'), false);
assert.equal(isKaineScopeQuestion('今天台北天氣如何？'), false);
assert.equal(
  isKaineScopeQuestion('那資料流怎麼走？', [
    { role: 'user', content: 'WikiNB 用了哪些技術？' },
    { role: 'assistant', content: '它由 Astro、Worker 與 Bridge 組成。' },
  ]),
  true,
);
assert.equal(
  isKaineScopeQuestion('那簡單教就好', [
    { role: 'user', content: '教我微積分' },
    { role: 'assistant', content: outOfScopeMessage(false) },
  ]),
  false,
);
assert.equal(
  isKaineScopeQuestion('那教我微積分', [
    { role: 'user', content: '請介紹 Kaine 的代表專案' },
    { role: 'assistant', content: '我會先介紹 LumaReader。' },
  ]),
  false,
);

assert.equal(prefersEnglish('Tell me about Kaine'), true);
assert.equal(prefersEnglish('請介紹 Kaine'), false);
assert.equal(maxChatTurns({ MAX_CHAT_TURNS: '5' }), 5);
assert.equal(maxChatTurns({ MAX_CHAT_TURNS: '99' }), 5);
assert.equal(maxChatTurns({ MAX_CHAT_TURNS: '1' }), 4);
assert.equal(
  outOfScopeMessage(false),
  '為了節省 Kaine 的免費 Gemini API 額度，我可能無法回答與主要任務無關的請求 🙏',
);
assert.equal(
  outOfScopeMessage(true),
  "To help conserve Kaine's free Gemini API quota, I may not be able to answer requests unrelated to this chat's main purpose. 🙏",
);
assert.match(continuationPromptMessage(5, false), /前 5 則訊息/);
assert.match(continuationPromptMessage(5, false), /寄一封通知信給 Kaine/);
assert.match(continuationPromptMessage(5, true), /first 5 messages/i);
assert.match(continuationPromptMessage(5, true), /email Kaine/i);
assert.match(appendContinuationPrompt('回答', 5, false), /^回答[\s\S]*前 5 則訊息/);

console.log('OK: Kaine 限定聊天範圍與 5 則續聊確認政策');
