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
assert.match(page, /appendMessage\(t\('gemini\.welcomeMessage'\), 'assistant'\)/);
assert.doesNotMatch(page, /gemini-quota|remainingPercent|gemini\.remaining/);

assert.match(zh['gemini.connected'], /數位助理/);
assert.match(zh['gemini.welcomeMessage'], /免費 API 額度/);
assert.match(en['gemini.connected'], /digital assistant/i);
assert.match(en['gemini.welcomeMessage'], /free Gemini API quota/i);
assert.equal('gemini.remaining' in zh, false);
assert.equal('gemini.remaining' in en, false);

console.log('OK: Gemini 數位助理維持免費額度節流與不顯示百分比');
