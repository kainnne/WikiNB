const GUEST_AI_SESSION_KEY = 'wikinb_guest_ai_session_v1';

function guestAiUrl() {
  const config = document.getElementById('bridge-config');
  if (config?.textContent) {
    try {
      const parsed = JSON.parse(config.textContent);
      if (parsed.guestAiUrl) return String(parsed.guestAiUrl).replace(/\/+$/, '');
    } catch {
      /* ignore invalid config */
    }
  }
  return '';
}

export function getGuestAiSession() {
  try {
    const raw = sessionStorage.getItem(GUEST_AI_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || Number(session.expiresAt || 0) <= Date.now()) {
      sessionStorage.removeItem(GUEST_AI_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setGuestAiSession(session) {
  sessionStorage.setItem(GUEST_AI_SESSION_KEY, JSON.stringify(session));
  document.dispatchEvent(new CustomEvent('wikinb:guest-ai-change', { detail: session }));
}

export function clearGuestAiSession() {
  sessionStorage.removeItem(GUEST_AI_SESSION_KEY);
  document.dispatchEvent(new CustomEvent('wikinb:guest-ai-change'));
}

async function guestAiFetch(path, options = {}, authenticated = false) {
  const base = guestAiUrl();
  if (!base) throw new Error('Kainnne x Gemini 尚未設定服務網址');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authenticated) {
    const session = getGuestAiSession();
    if (!session?.token) throw new Error('AI 訪客驗證已過期，請重新驗證');
    headers.Authorization = `Bearer ${session.token}`;
  }

  let response;
  try {
    response = await fetch(`${base}${path}`, { ...options, headers });
  } catch {
    throw new Error('目前無法連線 Kainnne x Gemini，請稍後再試');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearGuestAiSession();
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

export function requestGuestAiCode({ name, email }) {
  return guestAiFetch('/api/guest-ai/request-code', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function verifyGuestAiCode({ email, code }) {
  return guestAiFetch('/api/guest-ai/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export function fetchGuestAiMe() {
  return guestAiFetch('/api/guest-ai/me', { method: 'GET' }, true);
}

export function askGuestGemini({ message, history }) {
  return guestAiFetch(
    '/api/guest-ai/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    },
    true,
  );
}
