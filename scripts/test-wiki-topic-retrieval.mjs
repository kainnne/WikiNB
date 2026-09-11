import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { indexWikiSections } from '../src/lib/wiki-sections.js';
import { selectWikiExcerpt } from '../worker/wiki-excerpts.js';
import { buildRelevantCorpus, retrievalQuestion } from '../worker/index.js';
import { visitorIntent } from '../worker/visitor-policy.js';
import { DISCOVERY_TOPICS, drawDiscoveryTopics, discoveryQuestion, findDiscoveryTopic } from '../worker/discovery-topics.js';

const hub = 'Projects/Workflow/ai-interview-self-observation';
const snapshot = 'AboutMe/interview-thinking-snapshot-2026-09';
const pages = [hub, snapshot, 'Projects/project-overview', 'AboutMe/03-ai-and-data', 'AboutMe/02-software-development', 'AboutMe/04-collaboration-and-workstyle'].map(slug => {
  const { data, content } = matter(readFileSync(new URL(`../wiki/${slug}.md`, import.meta.url), 'utf8'));
  return { slug, ...data, ...indexWikiSections(content) };
});
for (const page of pages) {
  assert.ok(page.sections.length > 0);
  for (const section of page.sections) {
    assert.ok(section.start >= 0 && section.end > section.start && section.end <= page.bodyText.length);
    assert.ok(page.bodyText.slice(section.start, section.end).trim().length);
  }
}
const fenced = indexWikiSections('# Main\n\n## Real\n\n```md\n## Fake\n```\n\n### Child\n\nEvidence');
assert.equal(fenced.sections.length, 3, 'Code-fence headings are not sections');
assert.equal(fenced.sections.at(-1).heading, 'Main / Real / Child');
assert.equal(selectWikiExcerpt({bodyText:'Legacy text',sections:[]},['text'],1300),'Legacy text');
assert.equal(selectWikiExcerpt({bodyText:'Legacy text',sections:[{start:-1,end:999}]},['text'],1300),'Legacy text');

for (const query of ['請介紹 Kaine 的模擬面試專案', '我想了解你的模擬面試', '模拟面试', 'Tell me about Kaine’s mock interview']) {
  assert.equal(visitorIntent(query),'project');
  const corpus = buildRelevantCorpus(pages,query);
  assert.ok(corpus.startsWith(`\n---\n筆記：${hub}`),query);
  assert.ok(corpus.includes(`筆記：${snapshot}`),query);
  assert.equal((corpus.match(/筆記：/g)||[]).length,2,'Named topic uses its linked evidence, not unrelated profiles');
  assert.ok(corpus.length <= 6500);
}
for (const [query, evidence] of [
  ['模擬面試中，結果對 Kaine 有利，他怎麼處理不公平的比較？','你也沒有問其他兩位'],
  ['In Kaine’s mock interview, how did he handle an unfair comparison?','你也沒有問其他兩位'],
  ['模擬面試第一週的行動中，他假設了哪些團隊資源？','三件事太多了'],
  ['模擬面試中的口語表達有哪些限制？','我覺得」「就是」「如果'],
]) {
  const corpus=buildRelevantCorpus(pages,query);
  assert.ok(corpus.includes(evidence),query);
  assert.ok(corpus.length<=6500);
}
const prior=[{role:'user',content:'請介紹 Kaine 的模擬面試專案'},{role:'assistant',content:'虛構的客戶成果不要拿來當證據'}];
const followup=retrievalQuestion('那他怎麼看不公平的比較？',prior);
assert.ok(buildRelevantCorpus(pages,followup,6500,visitorIntent('那他怎麼看不公平的比較？')).includes('你也沒有問其他兩位'));
assert.ok(!followup.includes('虛構的客戶成果'));
const other=DISCOVERY_TOPICS.find(t=>t.id==='reader');
assert.equal(retrievalQuestion(discoveryQuestion(other),prior),discoveryQuestion(other),'An explicit new topic replaces old interview context');
assert.equal(findDiscoveryTopic(retrievalQuestion(discoveryQuestion(other),prior)).id,'reader');

let seed=42;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
let previous=[],seen=new Set();
for(let i=0;i<30;i++){
 const draw=drawDiscoveryTopics(previous,random);assert.equal(draw.length,5);assert.equal(new Set(draw.map(t=>t.id)).size,5);
 assert.ok(draw.every(t=>!previous.includes(t.id)));draw.forEach(t=>seen.add(t.id));previous=draw.map(t=>t.id);
}
assert.ok(seen.has('interview'),'The interview can appear in the existing five-card shuffle');
assert.equal(seen.size,DISCOVERY_TOPICS.length);
console.log('OK: topic routing, nested heading ranges, late evidence, follow-up context, topic switching and interview discovery');
