import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { buildRelevantCorpus } from '../worker/index.js';
import { DISCOVERY_TOPICS, drawDiscoveryTopics } from '../worker/discovery-topics.js';

const retired = [
  'KCIS/WikiNB-KCIS',
  'KCIS/kcis-ai-navigation',
  'Projects/Knowledge/wikinb-for-kcis',
  'Technical/wikinb-for-kcis/01_prototype_architecture_20260817',
];
for (const slug of retired) assert.equal(existsSync(`wiki/${slug}.md`), false, `No public route source: ${slug}`);
assert.ok(!DISCOVERY_TOPICS.some(topic => retired.includes(topic.slug)), 'Retired resources are absent from random entry choices');
assert.equal(drawDiscoveryTopics().length, 5, 'Discovery still offers five public topics');
const stalePages = retired.map(slug => ({ slug, title: 'KCIS', bodyText: 'RETIRED_SCHOOL_DETAIL', tags: ['KCIS'] }));
const publicProfiles = ['AboutMe/work-with-kaine', 'AboutMe/02-software-development', 'Projects/project-overview'].map(slug => ({ slug, bodyText: 'PUBLIC_EMPLOYMENT_BACKGROUND', tags: [] }));
for (const question of ['KCIS AI 導航有哪些功能？', '請介紹 Kaine 的主要專案', '康橋的教學知識庫']) {
  const corpus = buildRelevantCorpus([...stalePages, ...publicProfiles], question);
  assert.ok(!corpus.includes('RETIRED_SCHOOL_DETAIL'), `Stale data cannot reenter AI context: ${question}`);
  assert.ok(corpus.includes('PUBLIC_EMPLOYMENT_BACKGROUND'), 'Public career background remains eligible');
}
assert.match(readFileSync('wiki/AboutMe/work-with-kaine.md', 'utf8'), /我目前主要負責康橋國際學校的 AI 導入與教育訓練/);
console.log('OK: KCIS routes, random discovery and stale AI retrieval are hidden; employment remains');
