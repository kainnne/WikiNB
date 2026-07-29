const SESSION_KEY = 'wikinb_session';

function getBase() {
  return document.documentElement.dataset.base || import.meta.env.BASE_URL || '/';
}

export function getBridgeUrl() {
  const el = document.getElementById('bridge-config');
  if (el?.textContent) {
    try {
      const cfg = JSON.parse(el.textContent);
      const isLocal =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const prod = cfg.productionUrl;
      if (!isLocal && prod && !prod.includes('YOUR-MAC')) return prod;
      return cfg.url || 'http://localhost:8787';
    } catch {
      /* ignore */
    }
  }
  return import.meta.env.PUBLIC_BRIDGE_URL || 'http://localhost:8787';
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.expiresAt && data.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn() {
  return Boolean(getSession()?.token);
}

async function bridgeFetch(path, options = {}) {
  const base = getBridgeUrl();
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const parts = [data.error, data.detail].filter(Boolean);
    throw new Error(parts.join(' — ') || `HTTP ${res.status}`);
  }
  return data;
}

export async function checkHealth() {
  try {
    return await bridgeFetch('/api/health');
  } catch {
    return { online: false };
  }
}

export async function sendLoginCode(username, password) {
  return bridgeFetch('/api/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function verifyLoginCode(code) {
  return bridgeFetch('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function logout() {
  try {
    await bridgeFetch('/api/auth/logout', { method: 'POST', body: '{}' });
  } catch {
    /* ignore */
  }
  clearSession();
}

export async function syncWiki() {
  return bridgeFetch('/api/sync', { method: 'POST', body: '{}' });
}

export async function uploadWikiNote({
  filename,
  content,
  folder,
  title,
  keywords,
  autoSync = false,
}) {
  return bridgeFetch('/api/wiki/upload', {
    method: 'POST',
    body: JSON.stringify({ filename, content, folder, title, keywords, autoSync }),
  });
}

export async function listWikiFiles() {
  return bridgeFetch('/api/wiki/list');
}

export async function renameWikiFile({ oldSlug, newSlug, autoSync = false }) {
  return bridgeFetch('/api/wiki/rename', {
    method: 'POST',
    body: JSON.stringify({ oldSlug, newSlug, autoSync }),
  });
}

/** 更新筆記 frontmatter 標題／關鍵字（不改檔名） */
export async function updateWikiTitle({ slug, title, keywords, autoSync = false }) {
  return bridgeFetch('/api/wiki/update-title', {
    method: 'POST',
    body: JSON.stringify({ slug, title, keywords, autoSync }),
  });
}

/** 巢狀樹狀清單：{ ok, tree: [{ type:'dir'|'file', name, path, children?, slug?, title? }] } */
export async function listWikiTree() {
  return bridgeFetch('/api/wiki/tree');
}

/** 建立資料夾，path 可為巢狀，例如 `專案/2026`。 */
export async function createWikiFolder({ path, autoSync = false }) {
  return bridgeFetch('/api/wiki/mkdir', {
    method: 'POST',
    body: JSON.stringify({ path, autoSync }),
  });
}

/** 刪除筆記或資料夾，path 相對於 wiki/，例如 `專案/note.md`。 */
export async function deleteWikiFile({ path, autoSync = false }) {
  return bridgeFetch('/api/wiki/delete', {
    method: 'POST',
    body: JSON.stringify({ path, autoSync }),
  });
}

export async function codexChat(message, options = {}) {
  return bridgeFetch('/api/codex/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      model: options.model,
      reasoningEffort: options.reasoningEffort,
    }),
  });
}

export async function fetchCodexModels() {
  return bridgeFetch('/api/codex/models');
}

export async function stopCodex() {
  return bridgeFetch('/api/codex/stop', { method: 'POST', body: '{}' });
}

/**
 * Stream Codex output via SSE. onEvent receives { type, ... }.
 * options: { model, reasoningEffort, signal }
 */
export async function codexChatStream(message, onEvent = () => {}, options = {}) {
  const base = getBridgeUrl();
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  const res = await fetch(`${base}/api/codex/chat?stream=1`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      model: options.model,
      reasoningEffort: options.reasoningEffort,
      history: options.history || [],
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.detail || `HTTP ${res.status}`);
  }

  if (!res.body) throw new Error('瀏覽器不支援串流回應');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trim())
          .join('');
        if (!line) continue;
        try {
          const payload = JSON.parse(line);
          onEvent(payload);
          if (payload.type === 'done' || payload.type === 'error') {
            finalPayload = payload;
          }
        } catch {
          onEvent({ type: 'log', text: line });
        }
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { type: 'done', ok: true, stopped: true, answer: '（已停止）' };
    }
    throw err;
  }

  if (!finalPayload) {
    throw new Error('Codex 串流中斷，沒有收到完成事件');
  }
  if (finalPayload.type === 'error' && !finalPayload.answer) {
    throw new Error(finalPayload.error || finalPayload.detail || 'Codex 執行失敗');
  }
  return finalPayload;
}

/**
 * 顯示／隱藏「只有登入後才能出現」的元素。
 *
 * 同時設定 `hidden` 屬性與 `is-auth-visible` class：CSS 預設 `display: none`，
 * 只有 `.is-auth-visible` 才會給定實際 display，避免 Tailwind 的 `hidden`
 * 與 `grid` / `inline-flex` 這類 display utility 互相覆蓋。
 */
export function setAuthVisibility(el, visible) {
  if (!el) return;
  el.hidden = !visible;
  el.classList.toggle('is-auth-visible', visible);
  el.setAttribute('aria-hidden', visible ? 'false' : 'true');
  if (visible) el.removeAttribute('tabindex');
  else el.setAttribute('tabindex', '-1');
}

export function mountNavAuth() {
  const loginLink = document.getElementById('nav-login');
  const logoutBtn = document.getElementById('nav-logout');
  const addNoteLink = document.getElementById('nav-add-note');
  const codexLink = document.getElementById('nav-codex');
  const aboutLink = document.getElementById('nav-about');
  const githubLink = document.getElementById('nav-github');
  const wikiLink = document.getElementById('nav-wikinb');

  const update = () => {
    const loggedIn = isLoggedIn();
    if (loginLink) loginLink.classList.toggle('hidden', loggedIn);
    if (logoutBtn) logoutBtn.classList.toggle('hidden', !loggedIn);

    // + md. / Codex：只有 session token 存在時才顯示
    setAuthVisibility(addNoteLink, loggedIn);
    setAuthVisibility(codexLink, loggedIn);

    // 登入後進入工作模式：隱藏 About Me / GitHub
    if (aboutLink) aboutLink.classList.toggle('hidden', loggedIn);
    if (githubLink) githubLink.classList.toggle('hidden', loggedIn);

    // 登入後：WikiNB 切換成工作模式樣式
    wikiLink?.classList.toggle('is-logged', loggedIn);

    document.dispatchEvent(new CustomEvent('wikinb:auth-change', { detail: { loggedIn } }));
  };

  logoutBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    await logout();
    update();
    window.location.href = getBase();
  });

  update();
  return { update };
}
