import assert from 'node:assert/strict';
import { AZURE_AI_901_START_PROMPT, isAzureStudySession } from '../src/scripts/study-presets.js';
import { buildCodexChatPrompt } from '../bridge/codex-prompt.js';

for (const message of ['我現在開始學 Azure AI-901', 'AI 901 U04，請出一題', 'Azure AI 語音辨識']) {
  assert.equal(isAzureStudySession(message), true, message);
}
const history = [{ role: 'user', content: AZURE_AI_901_START_PROMPT }];
for (const message of ['A', 'B、D', '下一題', '不懂這個差別', 'U04 從頭開始', 'U1 從頭開始', '這題為什麼不能選C', 'bank-MC02', 'RAG']) {
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
assert.match(study, /index\/units\.json/);
assert.match(study, /question_data_path/);
assert.doesNotMatch(study, /book-text\.md/);
const other = buildCodexChatPrompt({ ...common, message: '幫我比較 Moon 的角色設計' });
assert.ok(!other.includes(azureStudyRoot), 'Private study location is omitted for unrelated work');
assert.ok(!other.includes('Azure AI-901 學習模式'), 'Unrelated private collaboration keeps its existing persona');
console.log('OK: AI-901 starts, answer-only follow-ups, topic switching and private source isolation');

const { normalizeStudyUnit, findStudyUnits } = await import('../src/scripts/study-unit-routing.js');
for (const value of ['U1','u01','Ｕ１']) assert.equal(normalizeStudyUnit(value),'U01');
assert.equal(normalizeStudyUnit('U10'),'U10'); assert.equal(normalizeStudyUnit('U11'),'');
const fixtures = [{unit:'U01',name:'工作負載',summary:'分類情境',key_concepts:['AI 工作負載'],retrieval_keywords:['Foundry']},{unit:'U04',name:'Agent SDK',summary:'函式呼叫',key_concepts:['Agent'],retrieval_keywords:['MCP','SDK']},{unit:'U10',name:'綜合測驗',summary:'各領域題庫',key_concepts:['Agent'],retrieval_keywords:['Responsible AI']}];
assert.deepEqual(findStudyUnits(fixtures,'U1').map(u=>u.unit),['U01']);
assert.deepEqual(findStudyUnits(fixtures,'MCP').map(u=>u.unit),['U04']);
assert.equal(findStudyUnits(fixtures,'Agent SDK')[0].unit,'U04');
assert.equal(findStudyUnits(fixtures,'沒有相關內容').length,0);
