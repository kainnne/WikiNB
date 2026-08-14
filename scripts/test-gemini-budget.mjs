/**
 * Static regression checks for the public Gemini assistant's free-tier budget.
 * These checks intentionally pin the UI and Worker limits that prevent a single
 * broad question from sending the full WikiNB corpus or requesting a long answer.
 *
 * Run: node scripts/test-gemini-budget.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [worker, wrangler, page, zhText, enText] = await Promise.all([
  readFile(new URL('../worker/index.js', import.meta.url), 'utf8'),
  readFile(new URL('../wrangler.jsonc', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/gemini.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/zh-TW.json', import.meta.url), 'utf8'),
  readFile(new URL('../src/locales/en.json', import.meta.url), 'utf8'),
]);

const zh = JSON.parse(zhText);
const en = JSON.parse(enText);

assert.match(worker, /function buildRelevantCorpus\(pages, question, maxChars = 6500\)/);
assert.match(worker, /selected\.length >= 4/);
assert.match(worker, /slice\(0, 1300\)/);
assert.match(worker, /\.slice\(-4\)/);
assert.doesNotMatch(worker, /maxOutputTokens:/);
assert.match(worker, /thinkingLevel: 'minimal'/);
assert.match(worker, /env\.GEMINI_MODEL \|\| 'gemini-3\.1-flash-lite'/);
assert.match(wrangler, /"GEMINI_MODEL": "gemini-3\.1-flash-lite"/);
assert.match(worker, /const retryable = \[500, 502, 503, 504\]/);
assert.match(worker, /數位助理/);
assert.match(worker, /節省免費 API 額度是必要限制/);
assert.match(worker, /完整性優先於字數/);

assert.match(page, /maxlength="1200"/);
assert.match(page, /\['gemini\.example1', 'gemini\.example2', 'gemini\.example3'\]/);
assert.match(
  page,
  /output\.appendChild\(line\);\s*appendMessage\(t\('gemini\.welcomeMessage'\), 'assistant'\)/,
);
assert.doesNotMatch(page, /gemini\.example4|gemini\.unlockHint|gemini\.home/);
assert.doesNotMatch(page, /gemini-quota|remainingPercent|gemini\.remaining/);

assert.equal(zh['gemini.connected'], '已連線');
assert.match(zh['gemini.welcomeMessage'], /Kaine 的數位助理/);
assert.equal(zh['gemini.example1'], '請簡短介紹 Kaine，以及他目前在做什麼。');
assert.equal(zh['gemini.example2'], '請挑選 Kaine 的一個代表專案簡述。');
assert.equal(zh['gemini.example3'], '根據 Kaine 的背景，提出一個可行的合作構想。');
assert.equal(en['gemini.connected'], 'Connected');
assert.match(en['gemini.welcomeMessage'], /Kaine's digital assistant/);
assert.equal('gemini.example4' in zh, false);
assert.equal('gemini.example4' in en, false);
assert.equal('gemini.unlockHint' in zh, false);
assert.equal('gemini.unlockHint' in en, false);
assert.equal('gemini.home' in zh, false);
assert.equal('gemini.home' in en, false);
assert.equal('gemini.remaining' in zh, false);
assert.equal('gemini.remaining' in en, false);

console.log('OK: Gemini 數位助理維持免費額度節流與不顯示百分比');
