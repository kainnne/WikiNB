// Exercise the real search renderer and event lifecycle with a small DOM fixture.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/scripts/wiki-search.js', import.meta.url), 'utf8');
const moduleSource = source.replace("import { t, translateKeyword } from './i18n.js';", `
const t = (key, vars = {}) => key + JSON.stringify(vars);
const translateKeyword = (keyword) => keyword;
`);
const { createWikiSearch } = await import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
function element(classes = []) {
  const attrs = new Map();
  const tokens = new Set(classes);
  return {
    hidden: false, innerHTML: '', textContent: '', value: '', events: {},
    classList: {
      add: (...values) => values.forEach((value) => tokens.add(value)),
      remove: (...values) => values.forEach((value) => tokens.delete(value)),
      contains: (value) => tokens.has(value),
      toggle: (value, on) => on ? tokens.add(value) : tokens.delete(value),
    },
    setAttribute: (key, value) => attrs.set(key, String(value)),
    getAttribute: (key) => attrs.get(key) ?? null,
    hasAttribute: (key) => attrs.has(key),
    addEventListener(type, handler) { this.events[type] = handler; },
    querySelectorAll: () => [],
  };
}
const input = element();
const form = element();
const resultsEl = element();
const emptyEl = element(['hidden']);
const metaEl = element();
const statusEl = element();
const retryEl = element();
const content = element();
const panel = element(['hidden']); panel.hidden = true;
panel.querySelector = (selector) => selector === '.wiki-content' ? content : null;
const expandBtn = element();
const chevron = { style: {} };
const item = element();
item.setAttribute('data-slug', 'Work/automation');
item.querySelector = (selector) => ({ '.wiki-panel': panel, '.wiki-expand': expandBtn, '.wiki-chevron': chevron }[selector]);
item.closest = () => resultsEl;
item.scrollIntoView = () => {};
expandBtn.closest = () => item;
resultsEl.querySelectorAll = (selector) => selector === '.wiki-expand' ? [expandBtn] : selector === '.wiki-item' ? [item] : [];
globalThis.document = { documentElement: { dataset: { base: '/' } }, addEventListener() {} };
const historyState = { retained: true };
const windowEvents = {};
globalThis.window = {
  location: { href: 'https://wiki.test/search/', search: '', origin: 'https://wiki.test' },
  history: { state: historyState, replaceState(state, title, url) {
    assert.equal(state, historyState, 'Preserve browser history state');
    window.location.href = String(url);
  } },
  addEventListener: (type, handler) => { windowEvents[type] = handler; },
};
const preview = '<p>PREVIEW_ONLY_CONTENT ' + 'body '.repeat(50000) + '</p>';
const { mount } = createWikiSearch([
  { slug: 'Work/automation', title: 'Automation', bodyText: 'automation', tags: [], html: preview },
]);
const { runSearch } = mount({ input, form, resultsEl, emptyEl, metaEl, statusEl, retryEl, syncUrl: true });
runSearch();
assert.match(resultsEl.innerHTML, /Automation/);
assert.ok(!resultsEl.innerHTML.includes('PREVIEW_ONLY_CONTENT'), 'Collapsed previews must not allocate large hidden DOM trees');
assert.equal(statusEl.hidden, true);
assert.equal(resultsEl.getAttribute('aria-busy'), 'false');
expandBtn.events.click({ stopPropagation() {} });
assert.equal(content.innerHTML, preview, 'Open the exact original note preview on demand');
assert.equal(panel.hidden, false);
expandBtn.events.click({ stopPropagation() {} });
assert.equal(panel.hidden, true, 'Second click closes the preview');

input.value = 'not found';
input.events.input();
assert.equal(emptyEl.classList.contains('hidden'), false);
assert.match(emptyEl.textContent, /search.emptyQuery/);
assert.equal(resultsEl.classList.contains('hidden'), true);
input.value = 'automation'; // Safari restored value without an input event.
windowEvents.pageshow({ persisted: true });
assert.equal(resultsEl.classList.contains('hidden'), false);
assert.match(metaEl.textContent, /search.metaFound/);
const restoredHtml = resultsEl.innerHTML;
windowEvents.pageshow({ persisted: true });
assert.equal(resultsEl.innerHTML, restoredHtml, 'Normal bfcache restore keeps the existing result');
resultsEl.innerHTML = '';
windowEvents.pageshow({ persisted: true });
assert.match(resultsEl.innerHTML, /Automation/, 'Recover an unexpectedly empty restored result');

const originalError = console.error;
const queryAll = resultsEl.querySelectorAll;
try {
  console.error = () => {};
  resultsEl.querySelectorAll = () => { throw new Error('simulated render interruption'); };
  runSearch();
  assert.equal(statusEl.hidden, false);
  assert.match(statusEl.textContent, /search.loadError/);
  assert.equal(retryEl.hidden, false);
  resultsEl.querySelectorAll = queryAll;
  form.events.submit({ preventDefault() {} });
  assert.equal(statusEl.hidden, true);
  assert.equal(retryEl.hidden, true);
} finally { console.error = originalError; }
console.log('OK: previews load only when expanded; search, empty states, restored inputs and render recovery work');
