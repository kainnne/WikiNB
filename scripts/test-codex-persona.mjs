import assert from 'node:assert/strict';
import { buildCodexChatPrompt } from '../bridge/codex-prompt.js';

const prompt = buildCodexChatPrompt({
  message: '幫我想想 Moon 下一步可以怎麼發展？',
  history: [
    { role: 'user', content: '我們先談角色定位。' },
    { role: 'assistant', content: '可以，我會先讀現有設定。' },
  ],
  projectRoot: '/tmp/WikiNB',
  wikiFiles: ['AboutMe/work-with-kaine.md', 'Projects/moon.md'],
});

assert.match(prompt, /Kaine 的私人 AI 專案搭檔/);
assert.match(prompt, /只供 Kaine 本人使用/);
assert.match(prompt, /不要扮演公開客服或小迷妹/);
assert.match(prompt, /UI／UX 與客製化內容呈現/);
assert.match(prompt, /Kainnne Studio、MusicMatch 與集合式網站/);
assert.match(prompt, /Wiki 是重要脈絡，不是回答範圍的上限/);
assert.match(prompt, /分析、聯想、比較、批判、腦力激盪、教學/);
assert.match(prompt, /read-only sandbox/);
assert.match(prompt, /不得聲稱已修改、刪除、提交、推送、部署/);
assert.match(prompt, /不設固定字數、段落或清單數量/);
assert.match(prompt, /Kaine 的最新訊息：\n幫我想想 Moon 下一步可以怎麼發展？/);
assert.match(prompt, /使用者：我們先談角色定位。/);
assert.match(prompt, /助手：可以，我會先讀現有設定。/);

assert.doesNotMatch(prompt, /只回答 Wiki|與主要任務無關|節省.*額度/);

console.log('✓ Kainnne × Codex 私人角色、自由度與唯讀邊界測試通過');
