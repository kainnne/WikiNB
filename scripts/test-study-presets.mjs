import assert from 'node:assert/strict';
import { AZURE_AI_901_START_PROMPT, isAzureStudySession } from '../src/scripts/study-presets.js';
import { buildCodexChatPrompt } from '../bridge/codex-prompt.js';

for (const message of ['我現在開始學 Azure AI-901', 'AI 901 U04，請出一題', 'Azure AI 語音辨識']) {
  assert.equal(isAzureStudySession(message), true, message);
}
const history = [{ role: 'user', content: AZURE_AI_901_START_PROMPT }];
for (const message of ['A', 'B、D', '下一題', '不懂這個差別', 'U04 從頭開始']) {
  assert.equal(isAzureStudySession(message, history), true, message);
}
assert.equal(isAzureStudySession('A'), false, 'A without an Azure session is not a study session');
assert.equal(isAzureStudySession('幫我比較 Moon 的角色設計', history), false, 'An explicit new topic leaves the study instructions behind');
const azureStudyRoot = '/tmp/private-study-fixture';
const common = { projectRoot: '/tmp/WikiNB', history, azureStudyRoot };
const study = buildCodexChatPrompt({ ...common, message: 'B、D' });
assert.ok(study.includes(azureStudyRoot), 'Private source is available for study follow-ups');
assert.match(study, /等待作答後再提供來源答案/);
assert.match(study, /不自動寫入或公開私人學習紀錄/);
const other = buildCodexChatPrompt({ ...common, message: '幫我比較 Moon 的角色設計' });
assert.ok(!other.includes(azureStudyRoot), 'Private study location is omitted for unrelated work');
assert.ok(!other.includes('Azure AI-901 學習模式'), 'Unrelated private collaboration keeps its existing persona');
console.log('OK: AI-901 starts, answer-only follow-ups, topic switching and private source isolation');
