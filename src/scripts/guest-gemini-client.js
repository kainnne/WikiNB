const GUEST_AI_SESSION_KEY = 'wikinb_guest_ai_session_v1';

const GUEST_AI_MESSAGE_KEYS = new Map([
  ['驗證碼已寄到你的電子信箱', 'gemini.codeSent'],
  ['請輸入至少 2 個字的名稱', 'gemini.errorNameShort'],
  ['請輸入有效的電子信箱', 'gemini.errorEmailInvalid'],
  ['這個網路寄送驗證碼的次數太多，請稍後再試', 'gemini.errorIpRate'],
  ['這個信箱寄送驗證碼的次數太多，請稍後再試', 'gemini.errorEmailRate'],
  ['今日驗證服務已達上限，請明天再試', 'gemini.errorDailyVerificationLimit'],
  ['請等待 1 分鐘後再重新寄送', 'gemini.errorResendWait'],
  ['驗證信寄送失敗，請稍後再試', 'gemini.errorEmailSend'],
  ['請輸入 6 位數驗證碼', 'gemini.errorCodeRequired'],
  ['驗證碼已過期，請重新寄送', 'gemini.errorCodeExpired'],
  ['驗證碼錯誤次數過多，請重新寄送', 'gemini.errorCodeAttempts'],
  ['AI 訪客驗證已過期', 'gemini.errorSessionExpired'],
  ['AI 訪客驗證已過期，請重新驗證', 'gemini.errorSessionExpired'],
  ['Kainnne x Gemini 尚未設定服務網址', 'gemini.errorServiceUrl'],
  ['目前無法連線 Kainnne x Gemini，請稍後再試', 'gemini.errorConnection'],
  ['請輸入問題', 'gemini.errorQuestionRequired'],
  ['問題太長，請縮短到 1,200 字以內', 'gemini.errorQuestionLong'],
  ['請稍等幾秒再送出下一個問題', 'gemini.errorQuestionRate'],
  ['今天的訪客 AI 共享額度已達上限，請明天再來', 'gemini.errorDailyChatLimit'],
  ['這個網路的免登入提問次數已用完，請驗證信箱後繼續', 'gemini.anonymousLimit'],
  ['尚未達到續聊確認門檻', 'gemini.continueNotReady'],
  ['續聊通知正在寄送，請稍候再試', 'gemini.continuePending'],
  ['無法寄送續聊通知，請稍後再試', 'gemini.continueError'],
  ['Gemini API 設定目前無法使用，已停止這次請求', 'gemini.errorApiConfig'],
  ['Gemini 沒有產生回答，請換個方式再問一次', 'gemini.errorEmptyAnswer'],
]);

/**
 * Worker 回應使用固定、穩定的中文訊息；UI 在顯示時把它轉成語系 key。
 * 保留 vars，讓「剩餘嘗試次數」也能在切換語言後重新渲染。
 */
export function describeGuestAiMessage(message, fallbackKey = '') {
  const raw = String(message || '').trim();
  const key = GUEST_AI_MESSAGE_KEYS.get(raw);
  if (key) return { key, vars: {}, raw };

  const wrongCode = raw.match(/^驗證碼錯誤，還可嘗試 (\d+) 次$/);
  if (wrongCode) {
    return { key: 'gemini.errorCodeWrong', vars: { left: wrongCode[1] }, raw };
  }

  return fallbackKey ? { key: fallbackKey, vars: {}, raw } : { key: '', vars: {}, raw };
}

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

export function askGuestGeminiAnonymous({ message }) {
  return guestAiFetch('/api/guest-ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history: [], anonymous: true }),
  });
}

export function continueGuestGemini() {
  return guestAiFetch(
    '/api/guest-ai/continue',
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    true,
  );
}
