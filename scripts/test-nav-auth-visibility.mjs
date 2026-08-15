/**
 * Smoke test: 「+ md.」與「Codex」這些登入專屬 CTA 必須真的等到 session token
 * 存在才出現。點「登入」連結本身不會建立 session，所以也不該讓它們現形。
 *
 * 這裡直接引用 src/scripts/bridge-client.js 的真實 setAuthVisibility /
 * setSession / clearSession / isLoggedIn，只把 sessionStorage 與 DOM 元素換成假的。
 *
 * Run: node scripts/test-nav-auth-visibility.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [homePage, header, geminiPage, loginPage, searchPage, wikiPage, notFoundPage, baseLayout, backdrop] = await Promise.all([
  readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/Header.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/gemini.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/login.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/search.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/wiki/[...slug].astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/404.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/PublicDreamBackdrop.astro', import.meta.url), 'utf8'),
]);

function createSessionStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

globalThis.sessionStorage = createSessionStorage();

const { setAuthVisibility, setSession, clearSession, isLoggedIn } = await import(
  '../src/scripts/bridge-client.js'
);

/** 最小的假元素：只實作 setAuthVisibility 用到的介面。 */
function createElement(classNames = []) {
  const classes = new Set(classNames);
  const attrs = new Map();
  return {
    hidden: true,
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      toggle: (c, on) => (on ? classes.add(c) : classes.delete(c)),
    },
    setAttribute: (k, v) => attrs.set(k, v),
    removeAttribute: (k) => attrs.delete(k),
    getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
  };
}

/**
 * 對照 Header.astro 的 .nav-chroma 與 HomeSearch.astro 的 .auth-grid / .auth-cta：
 * 預設 display:none，只有 .is-auth-visible 才有實際 display，
 * 而 [hidden] 一律 display:none !important。
 */
function cssWouldShow(el) {
  if (el.hidden) return false;
  return el.classList.contains('is-auth-visible');
}

/** 一個頁面載入時會被 gate 的所有登入專屬 UI。 */
function mountAuthCtas() {
  return {
    navAddNote: createElement(['nav-chroma']),
    navCodex: createElement(['nav-chroma']),
    homeGrid: createElement(['auth-grid']),
    homeAddNote: createElement(['btn-chroma', 'auth-cta']),
    homeCodex: createElement(['btn-chroma', 'auth-cta']),
  };
}

function syncCtas(ctas) {
  const loggedIn = isLoggedIn();
  for (const el of Object.values(ctas)) setAuthVisibility(el, loggedIn);
  return loggedIn;
}

function assertAllHidden(ctas, why) {
  for (const [name, el] of Object.entries(ctas)) {
    assert.equal(cssWouldShow(el), false, `${name} 在${why}時仍然看得到`);
    assert.equal(el.hidden, true, `${name} 在${why}時少了 hidden 屬性`);
    assert.equal(el.getAttribute('aria-hidden'), 'true');
  }
}

function assertAllVisible(ctas, why) {
  for (const [name, el] of Object.entries(ctas)) {
    assert.equal(cssWouldShow(el), true, `${name} 在${why}時沒有出現`);
    assert.equal(el.hidden, false);
    assert.equal(el.classList.contains('is-auth-visible'), true);
    assert.equal(el.getAttribute('aria-hidden'), 'false');
  }
}

// 1. 未登入：伺服端輸出就帶著 hidden，掛載後仍全部隱藏。
const ctas = mountAuthCtas();
assert.equal(isLoggedIn(), false, '一開始不該有 session');
assert.equal(syncCtas(ctas), false);
assertAllHidden(ctas, '未登入');

// 2. 只是逛到 /login（點「登入」連結）不會寫入 session，重新掛載後照樣隱藏。
const onLoginPage = mountAuthCtas();
assert.equal(syncCtas(onLoginPage), false, '點登入連結不該算已登入');
assertAllHidden(onLoginPage, '停在登入頁');

// 3. 驗證碼通過 → setSession 寫入 token，這時才顯示。
setSession({ token: 'test-token', expiresAt: Date.now() + 60_000 });
assert.equal(isLoggedIn(), true);
assert.equal(syncCtas(ctas), true);
assertAllVisible(ctas, '登入後');

// 4. 過期的 token 等同未登入。
setSession({ token: 'stale-token', expiresAt: Date.now() - 1 });
assert.equal(isLoggedIn(), false, '過期 session 不該算已登入');
assert.equal(syncCtas(ctas), false);
assertAllHidden(ctas, 'session 過期');

// 5. 登出 → clearSession → 再次隱藏。
setSession({ token: 'test-token', expiresAt: Date.now() + 60_000 });
syncCtas(ctas);
assertAllVisible(ctas, '重新登入後');
clearSession();
assert.equal(isLoggedIn(), false);
assert.equal(syncCtas(ctas), false);
assertAllHidden(ctas, '登出後');

// 6. 訪客首頁有獨立首屏；搜尋表單仍保留給登入後工作模式。
assert.match(homePage, /id="guest-home-hero"/);
assert.match(homePage, /id="home-gemini-btn"/);
assert.doesNotMatch(homePage, /gemini-portal-v1|class="home-gemini-art"|content: '↗'/);
assert.match(homePage, /class="home-gemini-aura"/);
assert.match(homePage, /class="home-gemini-orbit home-gemini-orbit-a"/);
assert.match(homePage, /class="home-gemini-particles"/);
assert.match(homePage, /class="home-quick-guide"/);
assert.match(homePage, /How to use WikiNB/);
assert.match(homePage, /<details class="home-guide-master">/);
assert.match(homePage, /class="home-guide-master-toggle"/);
assert.match(homePage, /<details class="home-guide-item" name="wikinb-guide">/);
assert.match(homePage, />Q1<[\s\S]*>Q2<[\s\S]*>Q3</);
assert.doesNotMatch(homePage, /快速認識 WikiNB|FEATURED EXPERIENCE/);
assert.match(homePage, /class="home-side-art home-side-art-left"/);
assert.match(homePage, /class="home-side-art home-side-art-right"/);
assert.match(homePage, /Math\.random\(\)/);
assert.match(homePage, /card\.dataset\.cardTone = tones/);
assert.match(homePage, /id="member-home-hero"[^>]*hidden/);
assert.match(homePage, /<HomeSearch dualMode=\{true\} \/>/);
assert.match(homePage, /document\.body\.classList\.toggle\('home-guest', !loggedIn\)/);
assert.match(header, /#nav-wikinb[\s\S]*order: 1/);
assert.match(header, /#nav-gemini[\s\S]*order: 2/);
assert.match(header, /#btn-lang[\s\S]*order: 3/);
assert.match(header, /#nav-menu[\s\S]*order: 4/);
assert.match(header, /brandHomeLabel = visitorNav \? '\/ 首頁' : '© HOME'/);
assert.match(header, /class="brand-sigil"/);
assert.match(header, /justify-content: space-between/);
assert.match(header, /#nav-menu \{[\s\S]*flex: 1 1 0/);
assert.match(header, /loginLabel = visitorNav \? '私人登入' : '登入'/);
assert.match(header, /data-always-home=\{visitorNav \? 'true' : 'false'\}/);
assert.doesNotMatch(geminiPage, /guest-home-hero|home-atmosphere|home-gemini-btn/);

// 7. 公開搜尋、文章、登入、Gemini 與 404 共用訪客視覺。
assert.match(baseLayout, /visitorNav\?: boolean/);
assert.match(baseLayout, /favicon-32\.png/);
assert.match(baseLayout, /apple-touch-icon\.png/);
assert.doesNotMatch(baseLayout, /data:image\/svg\+xml/);
assert.match(baseLayout, /publicSection\?: 'wiki' \| 'gemini' \| 'login'/);
assert.match(baseLayout, /<Header visitorNav=\{visitorNav\} publicSection=\{publicSection\} \/>/);
assert.match(backdrop, /class="public-dream-backdrop"/);
assert.match(backdrop, /body\.public-wiki-page/);
for (const source of [searchPage, wikiPage, notFoundPage]) {
  assert.match(source, /<PublicDreamBackdrop \/>/);
  assert.match(source, /pageClass="public-wiki-page"/);
  assert.match(source, /visitorNav=\{true\}/);
}
for (const source of [loginPage, geminiPage]) {
  assert.match(source, /<PublicDreamBackdrop \/>/);
  assert.match(source, /pageClass="public-wiki-page/);
  assert.match(source, /visitorNav=\{true\}/);
}
assert.match(loginPage, /publicSection="login"/);
assert.match(loginPage, /<h1 id="owner-login-title">私人登入<\/h1>/);
assert.match(loginPage, /此入口僅供 Kaine 管理 WikiNB 使用/);
assert.match(loginPage, /訪客請前往 Gemini 助理/);
assert.match(header, /nav\.ownerLogin/);
assert.match(header, /data-guest-visible/);
assert.match(geminiPage, /publicSection="gemini"/);
assert.match(geminiPage, /class="gemini-product-lockup"/);
assert.match(geminiPage, /class="gemini-unlock-glow gemini-unlock-glow-a"/);
assert.match(geminiPage, /#gemini-unlock \.search-input/);
assert.match(geminiPage, /<section id="gemini-chat" class="gemini-window hidden">/);
assert.doesNotMatch(geminiPage, /id="gemini-chat"[^>]*public-wiki-page/);

console.log('OK: + md. / Codex CTAs 只在 session token 存在時顯示');
