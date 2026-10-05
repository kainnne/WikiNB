import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { requestedLocale, resolveLocale } from '../src/scripts/locale-preference.js';
assert.equal(resolveLocale('?lang=zh-TW','en'),'zh-TW');
assert.equal(resolveLocale('?lang=zh','en'),'zh-TW');
assert.equal(resolveLocale('?lang=en','zh-TW'),'en');
assert.equal(resolveLocale('','en'),'en');
assert.equal(resolveLocale('',null),'zh-TW');
assert.equal(requestedLocale('?lang=arbitrary'),null);
const i18n=readFileSync(new URL('../src/scripts/i18n.js',import.meta.url),'utf8');
assert.match(i18n,/history\.replaceState\(window\.history\.state/);
assert.doesNotMatch(i18n,/history\.pushState/);
const header=readFileSync(new URL('../src/components/Header.astro',import.meta.url),'utf8');
assert.match(header,/id="brand-link"\s+href=\{meUrl\}\s+data-main-home/);
for (const locale of ['zh-TW', 'en']) {
  const copy = JSON.parse(readFileSync(new URL(`../src/locales/${locale}.json`, import.meta.url), 'utf8'));
  assert.equal(copy['gemini.title'], 'Kain³e AI');
  assert.equal(copy['nav.guestAi'], 'Kain³e AI');
  assert.equal(copy['gemini.assistantLabel'], 'AI');
}
console.log('OK: explicit entry language overrides stored locale; home links preserve language without extra Back entries.');
