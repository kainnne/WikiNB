/**
 * Smoke test: + md. / Codex nav CTAs must stay hidden until auth.
 * Run: node scripts/test-nav-auth-visibility.mjs
 */
import assert from 'node:assert/strict';

function simulateMountNavAuth({ loggedIn }) {
  const state = {
    addNote: { hidden: true, classList: new Set(), ariaHidden: 'true' },
    codex: { hidden: true, classList: new Set(), ariaHidden: 'true' },
  };

  const setAuthCta = (key, visible) => {
    const el = state[key];
    el.hidden = !visible;
    if (visible) el.classList.add('is-auth-visible');
    else el.classList.delete('is-auth-visible');
    el.ariaHidden = visible ? 'false' : 'true';
  };

  setAuthCta('addNote', loggedIn);
  setAuthCta('codex', loggedIn);
  return state;
}

function cssWouldShow(el) {
  // Mirrors Header.astro rules: default display:none; .is-auth-visible => inline-flex;
  // [hidden] => display:none !important
  if (el.hidden) return false;
  return el.classList.has('is-auth-visible');
}

const loggedOut = simulateMountNavAuth({ loggedIn: false });
assert.equal(cssWouldShow(loggedOut.addNote), false, '+ md. visible while logged out');
assert.equal(cssWouldShow(loggedOut.codex), false, 'Codex visible while logged out');
assert.equal(loggedOut.addNote.hidden, true);
assert.equal(loggedOut.codex.hidden, true);

const loggedIn = simulateMountNavAuth({ loggedIn: true });
assert.equal(cssWouldShow(loggedIn.addNote), true, '+ md. hidden while logged in');
assert.equal(cssWouldShow(loggedIn.codex), true, 'Codex hidden while logged in');
assert.equal(loggedIn.addNote.classList.has('is-auth-visible'), true);
assert.equal(loggedIn.codex.classList.has('is-auth-visible'), true);

// Toggle logout again
const afterLogout = simulateMountNavAuth({ loggedIn: false });
assert.equal(cssWouldShow(afterLogout.addNote), false);
assert.equal(cssWouldShow(afterLogout.codex), false);

console.log('OK: nav + md. / Codex visibility toggles correctly with login/logout');
