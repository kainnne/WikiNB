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
  wrangler,
  page,
  zhText,
  enText,
  sourcesText,
  wikiIndex,
  softwareProfile,
  projectOverview,
] = await Promise.all([
  readFile(new URL('../worker/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/gemini.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/zh-TW.json', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/en.json', import.meta.url), 'utf8'),
  readFile(new URL('../config/project-knowledge-sources.json', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/index.md', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/AboutMe/02-software-development.md', import.meta.url), 'utf8'),
  readFile(new URL('../wiki/Projects/project-overview.md', import.meta.url), 'utf8'),
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
assert.match(worker, /數位助理/);
assert.match(worker, /節省免費 API 額度是必要限制/);
assert.match(worker, /完整性優先於字數/);
assert.match(worker, /REPRESENTATIVE_PROJECT_SLUGS/);
assert.match(worker, /EXCLUDED_PUBLIC_SLUGS/);
assert.match(worker, /projects\/products\/musicmatch/);
assert.match(worker, /projects\/products\/ambient-ai/);
assert.match(worker, /projects\/machine-learning\/house-price-regression/);
assert.match(worker, /projects\/creative\/moonbase-contractor/);
assert.match(worker, /projects\/2026-08-03-zhuxi-reincarnation-renpy/);
assert.match(worker, /只介紹 LumaReader/);
assert.match(worker, /Kaine 主要專案與能力總覽/);
assert.match(worker, /WikiNB 與 GEO 目前沒有自動排程/);
assert.match(worker, /wiki-pages-v5/);
assert.match(worker, /function requestsExpandedDetail\(text\)/);
assert.match(worker, /我要\.\{0,4\}更詳細/);
assert.match(worker, /function retrievalQuestion\(message, history\)/);
assert.match(worker, /function systemPrompt\(corpus, expandedDetailRequested = false\)/);
assert.match(worker, /這裡無法提供長篇詳細回答；以下先整理必要重點/);
assert.match(worker, /最相關的 1–3 份 WikiNB 文件/);
assert.match(worker, /Instagram @kaine_z_/);
assert.match(worker, /Gmail chaos60649@gmail\.com/);
assert.match(worker, /systemPrompt\(corpus, expandedDetailRequested\)/);

const retiredSourceIds = new Set([
  'musicmatch',
  'house-price-regression',
  'ambient-ai',
  'moonbase-contractor',
]);
assert.equal(sources.sources.some((source) => retiredSourceIds.has(source.id)), false);
assert.match(wikiIndex, /目前最具代表性的單一專案是 \*\*LumaReader\*\*/);
assert.doesNotMatch(wikiIndex, /MusicMatch|house-price-regression|ambient-ai|moonbase|朱璽轉生/);
assert.match(softwareProfile, /若只需要選一個代表專案，首選是 \*\*LumaReader\*\*/);
assert.match(projectOverview, /\*\*CodexRules／agents CLI\*\*/);
assert.match(projectOverview, /\*\*LumaReader\*\*/);
assert.match(projectOverview, /\*\*音樂能力\*\*/);

assert.match(page, /maxlength="1200"/);
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

assert.equal(zh['gemini.connected'], '已連線');
assert.match(zh['gemini.welcomeMessage'], /Kaine 的數位助理/);
assert.equal(zh['gemini.example1'], '請簡短介紹 Kaine，以及他目前在做什麼。');
assert.equal(zh['gemini.example2'], '請挑選 Kaine 的一個代表專案簡述。');
assert.equal(zh['gemini.example3'], '根據 Kaine 的背景，提出一個可行的合作構想。');
assert.equal(zh['gemini.example4'], '請簡短條列 Kaine 目前公開的主要專案與能力。');
assert.equal(en['gemini.connected'], 'Connected');
assert.match(en['gemini.welcomeMessage'], /Kaine's digital assistant/);
assert.equal(en['gemini.example4'], "Briefly list Kaine's current public projects and capabilities.");
assert.equal('gemini.unlockHint' in zh, false);
assert.equal('gemini.unlockHint' in en, false);
assert.equal('gemini.home' in zh, false);
assert.equal('gemini.home' in en, false);
assert.equal('gemini.remaining' in zh, false);
assert.equal('gemini.remaining' in en, false);

console.log('OK: Gemini 數位助理維持免費額度節流與不顯示百分比');
