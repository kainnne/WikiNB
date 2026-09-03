import cors from 'cors';
import crypto from 'node:crypto';
import { execFile, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';
import { buildCodexChatPrompt } from './codex-prompt.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// GUI / 某些終端啟動時 PATH 可能不含 Homebrew，導致 spawn git/npm ENOENT
for (const dir of ['/opt/homebrew/bin', '/usr/local/bin']) {
  const parts = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  if (!parts.includes(dir) && fs.existsSync(dir)) {
    process.env.PATH = `${dir}${path.delimiter}${process.env.PATH || ''}`;
  }
}

function resolveBin(name) {
  for (const dir of ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin']) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  return name;
}

const GIT_BIN = resolveBin('git');
const NPM_BIN = resolveBin('npm');

const PORT = Number(process.env.PORT || 8787);
const PROJECT_ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');
const AUTH_USER = process.env.WIKINB_AUTH_USER || '';
const AUTH_PASS = process.env.WIKINB_AUTH_PASS || '';
const AUTH_EMAILS = (process.env.WIKINB_AUTH_EMAILS || 'chaos60649@gmail.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
const CORS_ORIGINS = (
  process.env.CORS_ORIGINS ||
  'http://localhost:4321,https://wikinb.kainnne.com,https://kainnne.github.io'
)
  .split(',')
  .map((o) => o.trim());
const DEV_LOG_CODE = process.env.DEV_LOG_CODE !== 'false';
const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const OTP_MAX_FAILS = 3;
const OTP_LOCK_MS = 10 * 60 * 1000;

const pendingCodes = new Map();
const sessions = new Map();

/** 驗證碼錯誤累計（重新寄送不會歸零；鎖定結束後才清零） */
const otpGuard = {
  failCount: 0,
  lockedUntil: 0,
};

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const requestsPrivateNetwork =
    req.headers['access-control-request-private-network'] === 'true';

  if (requestsPrivateNetwork && origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(null, CORS_ORIGINS.includes('*'));
    },
    credentials: true,
  }),
);

function randomCode() {
  return String(crypto.randomInt(100000, 999999));
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function credentialsOk(username, password) {
  if (!AUTH_USER || !AUTH_PASS) return false;
  return String(username ?? '') === AUTH_USER && String(password ?? '') === AUTH_PASS;
}

async function sendCodeEmail(code) {
  const subject = `Kainnne WikiNB 登入驗證碼：${code}`;
  const text = `你的 WikiNB 登入驗證碼是：${code}\n\n10 分鐘內有效。若不是你本人操作，請忽略此信。`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (DEV_LOG_CODE) {
      console.log('\n📧 [DEV] 驗證碼（未設定 SMTP，僅顯示於終端機）:', code);
      console.log('   將寄送至:', AUTH_EMAILS.join(', '), '\n');
    }
    return { dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: AUTH_EMAILS.join(','),
    subject,
    text,
  });

  return { dev: false };
}

/** 登入成功後的安全通知信（失敗不阻斷登入） */
async function sendLoginAlertEmail({ ip } = {}) {
  const when = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour12: false,
  });
  const subject = 'Kainnne WikiNB 登入通知';
  const text = [
    '你的 WikiNB 帳號剛剛成功登入。',
    '',
    `時間：${when}（台北時間）`,
    `來源 IP：${ip || 'unknown'}`,
    '',
    '若不是你本人操作，請立即檢查帳號安全。',
  ].join('\n');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (DEV_LOG_CODE) {
      console.log('\n📧 [DEV] 登入通知（未設定 SMTP）：');
      console.log(text, '\n');
    }
    return { dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: AUTH_EMAILS.join(','),
    subject,
    text,
  });

  return { dev: false };
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function refreshOtpLockState() {
  if (otpGuard.lockedUntil && otpGuard.lockedUntil <= Date.now()) {
    otpGuard.failCount = 0;
    otpGuard.lockedUntil = 0;
  }
}

function otpLockRemainingMs() {
  refreshOtpLockState();
  if (!otpGuard.lockedUntil) return 0;
  return Math.max(0, otpGuard.lockedUntil - Date.now());
}

function otpLockResponse(res) {
  const remainMs = otpLockRemainingMs();
  if (remainMs <= 0) return false;
  const mins = Math.max(1, Math.ceil(remainMs / 60000));
  res.status(429).json({
    error: `登入已暫停，請約 ${mins} 分鐘後再試（累積錯誤 ${otpGuard.failCount} 次）`,
    failCount: otpGuard.failCount,
    lockedUntil: otpGuard.lockedUntil,
    locked: true,
  });
  return true;
}

/** 驗證碼連續錯誤達上限：暫停登入並寄信 */
async function sendOtpLockAlertEmail({ ip, failCount } = {}) {
  const when = new Date().toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour12: false,
  });
  const subject = 'Kainnne WikiNB 安全警示：驗證碼錯誤次數過多';
  const text = [
    '有人連續輸錯 WikiNB 登入驗證碼，已暫時鎖定登入。',
    '',
    `累積錯誤：${failCount} 次`,
    `鎖定時長：10 分鐘`,
    `時間：${when}（台北時間）`,
    `來源 IP：${ip || 'unknown'}`,
    '',
    '若不是你本人操作，請檢查帳號安全。鎖定結束前無法再登入或寄送驗證碼。',
  ].join('\n');

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (DEV_LOG_CODE) {
      console.log('\n📧 [DEV] 驗證碼鎖定通知（未設定 SMTP）：');
      console.log(text, '\n');
    }
    return { dev: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: AUTH_EMAILS.join(','),
    subject,
    text,
  });

  return { dev: false };
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    res.status(401).json({ error: '未登入或 session 已過期' });
    return;
  }
  req.session = session;
  next();
}

app.get('/api/health', (_req, res) => {
  const wikiDir = path.join(PROJECT_ROOT, 'wiki');
  let wikiPages = 0;
  if (fs.existsSync(wikiDir)) {
    wikiPages = fs.readdirSync(wikiDir).filter((f) => isSiteWikiMarkdown(f)).length;
  }
  res.json({
    online: true,
    codex: 'ready',
    wikiPages,
    authEmails: AUTH_EMAILS.length,
  });
});

app.post('/api/auth/send-code', async (req, res) => {
  try {
    if (otpLockResponse(res)) return;

    const { username, password } = req.body || {};

    if (!AUTH_USER || !AUTH_PASS) {
      res.status(500).json({ error: 'Bridge 尚未設定 WIKINB_AUTH_USER / WIKINB_AUTH_PASS' });
      return;
    }

    if (!credentialsOk(username, password)) {
      res.status(401).json({ error: '帳號或密碼錯誤' });
      return;
    }

    const code = randomCode();
    // 只換新碼；不重設 otpGuard.failCount（重新寄送不歸零）
    pendingCodes.set('login', { code, expiresAt: Date.now() + CODE_TTL_MS });

    try {
      const sendResult = await sendCodeEmail(code);
      res.json({
        ok: true,
        message: sendResult.dev
          ? `帳密正確。未設定 SMTP，驗證碼已顯示於 Bridge 終端機（將寄至 ${AUTH_EMAILS.length} 個信箱）`
          : `帳密正確，驗證碼已寄送至 ${AUTH_EMAILS.length} 個信箱`,
        expiresIn: CODE_TTL_MS / 1000,
        failCount: otpGuard.failCount,
        dev: Boolean(sendResult.dev),
      });
    } catch (mailErr) {
      console.error('send-code SMTP error:', mailErr.message || mailErr);
      if (DEV_LOG_CODE) {
        console.log('\n📧 [FALLBACK] SMTP 失敗，驗證碼改顯示於終端機:', code);
        console.log('   目標信箱:', AUTH_EMAILS.join(', '), '\n');
        res.json({
          ok: true,
          message: '帳密正確，但 Gmail 寄信失敗。請查看 Bridge 終端機上的驗證碼（並檢查 SMTP_PASS 應用程式密碼）',
          expiresIn: CODE_TTL_MS / 1000,
          failCount: otpGuard.failCount,
          dev: true,
        });
        return;
      }
      pendingCodes.delete('login');
      res.status(500).json({ error: '寄送驗證碼失敗，請檢查 SMTP 設定（Gmail 應用程式密碼）' });
    }
  } catch (err) {
    console.error('send-code error:', err);
    res.status(500).json({ error: '寄送驗證碼失敗，請檢查 SMTP 設定' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  if (otpLockResponse(res)) return;

  const { code } = req.body || {};
  const pending = pendingCodes.get('login');

  if (!pending || pending.expiresAt < Date.now()) {
    res.status(400).json({ error: '驗證碼已過期，請重新寄送' });
    return;
  }

  if (String(code).trim() !== pending.code) {
    otpGuard.failCount += 1;
    const fails = otpGuard.failCount;
    const ip = clientIp(req);

    if (fails >= OTP_MAX_FAILS) {
      otpGuard.lockedUntil = Date.now() + OTP_LOCK_MS;
      sendOtpLockAlertEmail({ ip, failCount: fails }).catch((err) => {
        console.error('otp lock alert email failed:', err);
      });
      res.status(429).json({
        error: `累積錯誤 ${fails} 次，登入已暫停 10 分鐘，並已寄送通知信`,
        failCount: fails,
        lockedUntil: otpGuard.lockedUntil,
        locked: true,
      });
      return;
    }

    res.status(400).json({
      error: `驗證碼錯誤（累積錯誤 ${fails} 次，達 ${OTP_MAX_FAILS} 次將暫停登入 10 分鐘）`,
      failCount: fails,
    });
    return;
  }

  pendingCodes.delete('login');
  otpGuard.failCount = 0;
  otpGuard.lockedUntil = 0;
  const token = randomToken();
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS, createdAt: Date.now() });

  const ip = clientIp(req);
  sendLoginAlertEmail({ ip }).catch((err) => {
    console.error('login alert email failed:', err);
  });

  res.json({
    ok: true,
    token,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  sessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, (_req, res) => {
  res.json({ ok: true, authenticated: true });
});

const CODEX_MODELS = [
  { id: 'gpt-5.6-terra', label: 'gpt-5.6-terra（預設）' },
  { id: 'gpt-5.5', label: 'gpt-5.5' },
  { id: 'gpt-5.3-codex', label: 'gpt-5.3-codex' },
  { id: 'o3', label: 'o3' },
  { id: 'o4-mini', label: 'o4-mini' },
  { id: 'gpt-4.1', label: 'gpt-4.1' },
];

const CODEX_EFFORTS = [
  { id: 'low', label: '低（較快）' },
  { id: 'medium', label: '中（預設）' },
  { id: 'high', label: '高（較慢、較深）' },
];

function readCodexDefaultModel() {
  try {
    const cfgPath = path.join(process.env.HOME || '', '.codex', 'config.toml');
    if (!fs.existsSync(cfgPath)) return 'gpt-5.6-terra';
    const text = fs.readFileSync(cfgPath, 'utf8');
    const m = text.match(/^\s*model\s*=\s*"([^"]+)"/m);
    return m?.[1] || 'gpt-5.6-terra';
  } catch {
    return 'gpt-5.6-terra';
  }
}

function readCodexDefaultEffort() {
  try {
    const cfgPath = path.join(process.env.HOME || '', '.codex', 'config.toml');
    if (!fs.existsSync(cfgPath)) return 'medium';
    const text = fs.readFileSync(cfgPath, 'utf8');
    const m = text.match(/^\s*model_reasoning_effort\s*=\s*"([^"]+)"/m);
    return m?.[1] || 'medium';
  } catch {
    return 'medium';
  }
}

/** @type {Map<string, import('node:child_process').ChildProcess>} */
const activeCodexJobs = new Map();

app.get('/api/codex/models', authMiddleware, (_req, res) => {
  const defaultModel = readCodexDefaultModel();
  const defaultEffort = readCodexDefaultEffort();
  const models = [...CODEX_MODELS];
  if (!models.some((m) => m.id === defaultModel)) {
    models.unshift({
      id: defaultModel,
      label: `${defaultModel}（本機設定）`,
    });
  }
  res.json({
    ok: true,
    defaultModel,
    defaultEffort,
    models,
    efforts: CODEX_EFFORTS,
    tips: [
      '簡單 wiki 問答通常只需 15–60 秒；第一次啟動或面對複雜任務可能需要更久。',
    ],
  });
});

app.post('/api/codex/stop', authMiddleware, (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const child = activeCodexJobs.get(token);
  if (!child || child.killed) {
    res.json({ ok: true, stopped: false, message: '目前沒有執行中的 Codex' });
    return;
  }
  child.kill('SIGTERM');
  setTimeout(() => {
    if (!child.killed) child.kill('SIGKILL');
  }, 1500);
  res.json({ ok: true, stopped: true, message: '已送出停止訊號' });
});

app.post('/api/sync', authMiddleware, async (_req, res) => {
  try {
    const result = await runWikiSync();
    res.json(result);
  } catch (err) {
    console.error('sync error:', err);
    res.status(500).json({ error: '同步失敗', detail: String(err.message || err).slice(0, 600) });
  }
});

/** 僅本機 loopback：方便診斷同步，不需登入。預設關閉。 */
app.post('/api/dev/sync', async (req, res) => {
  if (process.env.ALLOW_LOCAL_SYNC_TEST !== 'true') {
    res.status(404).json({ error: 'not found' });
    return;
  }
  const ip = req.socket.remoteAddress || '';
  const local = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  if (!local) {
    res.status(403).json({ error: '僅允許本機呼叫' });
    return;
  }
  try {
    const result = await runWikiSync();
    res.json(result);
  } catch (err) {
    console.error('dev sync error:', err);
    res.status(500).json({ error: '同步失敗', detail: String(err.message || err).slice(0, 600) });
  }
});

function gitExecErrorDetail(err) {
  return String(err?.stderr || err?.stdout || err?.message || err || '')
    .trim()
    .slice(0, 500);
}

async function runWikiSync() {
  const autoPush = process.env.AUTO_GIT_PUSH === 'true';

  if (!autoPush) {
    try {
      await execFileAsync(NPM_BIN, ['run', 'build'], { cwd: PROJECT_ROOT, timeout: 120000 });
    } catch (err) {
      throw new Error(`本機 build 失敗：${gitExecErrorDetail(err)}`);
    }
    return {
      ok: true,
      message:
        'Wiki 已在本機重新建置（dist/）。若要自動推上 GitHub，請在 bridge/.env 設定 AUTO_GIT_PUSH=true',
      gitPush: false,
    };
  }

  // wiki 筆記 + public 靜態資源（圖片、舊 md 備份）一併 staging
  try {
    await execFileAsync(
      GIT_BIN,
      ['add', '-A', '--', 'wiki/', 'public/images/', 'public/old_md/'],
      { cwd: PROJECT_ROOT },
    );
  } catch (err) {
    throw new Error(`git add 失敗（${GIT_BIN}）：${gitExecErrorDetail(err)}`);
  }

  const commitEnv = { ...process.env };
  let committed = false;
  try {
    await execFileAsync(
      GIT_BIN,
      ['commit', '-m', 'sync: update wiki and public assets from Bridge'],
      {
        cwd: PROJECT_ROOT,
        env: commitEnv,
      },
    );
    committed = true;
  } catch (err) {
    const msg = gitExecErrorDetail(err);
    if (!/nothing to commit|no changes added|clean working tree/i.test(msg)) {
      console.error('git commit failed:', msg);
      throw new Error(`git commit 失敗：${msg}`);
    }
  }

  const pushEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
  const token = process.env.GITHUB_TOKEN?.trim();
  try {
    if (token) {
      // Prefer token when provided; otherwise use Mac 既有 git 憑證
      pushEnv.GIT_ASKPASS = 'echo';
      const remote = `https://x-access-token:${token}@github.com/kainnne/WikiNB.git`;
      await execFileAsync(GIT_BIN, ['push', remote, 'HEAD:main'], {
        cwd: PROJECT_ROOT,
        env: pushEnv,
        timeout: 300000,
      });
    } else {
      await execFileAsync(GIT_BIN, ['push', 'origin', 'HEAD'], {
        cwd: PROJECT_ROOT,
        env: pushEnv,
        timeout: 300000,
      });
    }
  } catch (err) {
    const detail = gitExecErrorDetail(err);
    throw new Error(
      `git push 失敗。請在 bridge/.env 設定有效的 GITHUB_TOKEN（repo 權限）後重啟 Bridge。細節：${detail}`,
    );
  }

  // 確認工作樹乾淨，避免「看似成功、檔案其實沒推上去」
  const { stdout: porcelain } = await execFileAsync(
    GIT_BIN,
    ['status', '--porcelain', '--', 'wiki/', 'public/images/', 'public/old_md/'],
    { cwd: PROJECT_ROOT },
  );
  const dirty = String(porcelain || '').trim();
  if (dirty) {
    throw new Error(`同步後仍有未提交變更：\n${dirty.slice(0, 400)}`);
  }

  return {
    ok: true,
    message: committed
      ? 'Wiki 與 public 資源已推送至 GitHub，Pages 重新部署通常約 2–5 分鐘（含大圖時可能更久）'
      : '沒有新的 wiki／public 變更可提交；遠端已是最新',
    gitPush: true,
    committed,
  };
}

function wikiRoot() {
  return path.join(PROJECT_ROOT, 'wiki');
}

/** 網站／瀏覽／管理會顯示的 wiki .md（排除 index、技術用 AGENTS） */
function isSiteWikiMarkdown(filename) {
  const base = path.basename(filename);
  if (!/\.md$/i.test(base)) return false;
  const stem = base.replace(/\.md$/i, '');
  const lower = stem.toLowerCase();
  return lower !== 'index' && lower !== 'agents';
}

const WIKI_META_PATH = () => path.join(wikiRoot(), '_meta.json');

function loadWikiMetaStore() {
  try {
    const p = WIKI_META_PATH();
    if (!fs.existsSync(p)) return {};
    const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

function saveWikiMetaStore(store) {
  fs.mkdirSync(wikiRoot(), { recursive: true });
  fs.writeFileSync(WIKI_META_PATH(), `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

function getWikiMetaEntry(slug) {
  const entry = loadWikiMetaStore()[slug];
  return entry && typeof entry === 'object' ? entry : {};
}

/** 寫入顯示標題／簡述／額外關鍵字到 wiki/_meta.json（不改 md 正文） */
function upsertWikiMetaEntry(slug, patch = {}) {
  const store = loadWikiMetaStore();
  const prev = store[slug] && typeof store[slug] === 'object' ? store[slug] : {};
  const next = { ...prev };
  if (patch.title !== undefined) next.title = String(patch.title || '').trim();
  if (patch.description !== undefined) next.description = String(patch.description || '').trim();
  if (patch.tags !== undefined) {
    next.tags = parseKeywordList(patch.tags);
  }
  if (!next.title && !next.description && !(next.tags && next.tags.length)) {
    delete store[slug];
  } else {
    store[slug] = next;
  }
  saveWikiMetaStore(store);
  return store[slug] || {};
}

function removeWikiMetaEntry(slug) {
  const store = loadWikiMetaStore();
  if (!(slug in store)) return;
  delete store[slug];
  saveWikiMetaStore(store);
}

function removeWikiMetaUnderPrefix(prefix) {
  const store = loadWikiMetaStore();
  const p = String(prefix || '').replace(/\/+$/, '');
  if (!p) return;
  let changed = false;
  for (const key of Object.keys(store)) {
    if (key === p || key.startsWith(`${p}/`)) {
      delete store[key];
      changed = true;
    }
  }
  if (changed) saveWikiMetaStore(store);
}

function moveWikiMetaEntry(oldSlug, newSlug) {
  const store = loadWikiMetaStore();
  if (!(oldSlug in store)) return;
  store[newSlug] = store[oldSlug];
  delete store[oldSlug];
  saveWikiMetaStore(store);
}

/** 允許巢狀路徑：folder/note；擋 traversal */
function normalizeWikiRelPath(input, { allowMdSuffix = true } = {}) {
  let raw = String(input || '').trim().replace(/\\/g, '/');
  if (allowMdSuffix) raw = raw.replace(/\.md$/i, '');
  if (!raw || raw === 'index' || raw === '.' || raw === '..') return null;
  const parts = raw.split('/').filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.some((p) => p === '.' || p === '..' || p === 'index')) return null;
  // 每段：中文、英文、數字、_、-
  if (!parts.every((p) => /^[\u4e00-\u9fffA-Za-z0-9_-]+$/.test(p))) return null;
  if (parts.join('/').length > 200) return null;
  return parts.join('/');
}

function resolveUnderWiki(relPath) {
  const root = wikiRoot();
  const abs = path.resolve(root, relPath);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}

function safeWikiFilename(name) {
  // 支援 folder/sub/note.md
  const normalized = String(name || 'note.md').replace(/\\/g, '/').trim();
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) return `note-${Date.now()}.md`;
  const safeParts = parts.map((part, idx) => {
    const isLast = idx === parts.length - 1;
    let base = part.replace(/[^\w.\-()\u4e00-\u9fff]+/g, '_');
    if (!base || base === '.' || base === '..') base = isLast ? `note-${Date.now()}` : 'folder';
    if (isLast && !base.toLowerCase().endsWith('.md')) base = `${base}.md`;
    if (!isLast && base.toLowerCase().endsWith('.md')) base = base.slice(0, -3);
    return base;
  });
  const joined = safeParts.join('/');
  if (safeParts[safeParts.length - 1] === 'index.md') {
    return null;
  }
  return joined;
}

function extractWikiTitle(content, fallbackSlug) {
  const m = String(content || '').match(/^---\s*\n[\s\S]*?\ntitle:\s*(.+)\n/m);
  if (m) {
    return m[1].trim().replace(/^["']|["']$/g, '');
  }
  const h1 = String(content || '').match(/^#\s+(.+)$/m);
  if (h1) return h1[1].replace(/\s+#+\s*$/, '').trim();
  const parts = String(fallbackSlug || '')
    .split('/')
    .filter(Boolean);
  return parts[parts.length - 1] || fallbackSlug || 'untitled';
}

function formatFolderKeyword(folderName) {
  const name = String(folderName || '').trim();
  if (!name) return '';
  if (/^[A-Z0-9]{2,6}$/.test(name)) return name;
  const spaced = name
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  const words = spaced.split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  return words
    .map((w, i) =>
      i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase(),
    )
    .join(' ');
}

function folderKeywordFromRelPath(folderPath) {
  const leaf = String(folderPath || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .pop();
  return formatFolderKeyword(leaf || '');
}

function yamlScalar(value) {
  const v = String(value ?? '');
  if (v === '') return '""';
  if (/[:#{}[\],&*?|>!%@`]/.test(v) || /^\s|\s$/.test(v) || /[\n"']/.test(v)) {
    return JSON.stringify(v);
  }
  return v;
}

function unquoteYaml(value) {
  const v = String(value ?? '').trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    try {
      return JSON.parse(v.startsWith("'") ? JSON.stringify(v.slice(1, -1)) : v);
    } catch {
      return v.slice(1, -1);
    }
  }
  return v;
}

function uniqueTags(tags) {
  const out = [];
  const seen = new Set();
  for (const raw of tags || []) {
    const t = String(raw || '').trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function splitWikiFrontmatter(raw) {
  const text = String(raw || '').replace(/^\uFEFF/, '');
  if (!text.startsWith('---')) return { data: {}, body: text };
  const end = text.search(/\r?\n---[ \t]*\r?\n/);
  if (end === -1) return { data: {}, body: text };
  const fmBlock = text.slice(3, end).replace(/^\r?\n/, '');
  const after = text.slice(end).replace(/^\r?\n---[ \t]*\r?\n?/, '');
  const data = {};
  const lines = fmBlock.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) {
      i += 1;
      continue;
    }
    const key = m[1];
    const rest = m[2].trim();
    if (rest === '' || rest === '|' || rest === '>') {
      const arr = [];
      let j = i + 1;
      while (j < lines.length && /^\s+-\s+/.test(lines[j])) {
        arr.push(unquoteYaml(lines[j].replace(/^\s+-\s+/, '').trim()));
        j += 1;
      }
      if (arr.length || key === 'tags' || key === 'relatedSkills') {
        data[key] = arr;
        i = j;
        continue;
      }
      data[key] = '';
      i += 1;
      continue;
    }
    if (rest === '[]') {
      data[key] = [];
      i += 1;
      continue;
    }
    data[key] = unquoteYaml(rest);
    i += 1;
  }
  return { data, body: after.replace(/^\r?\n/, '') };
}

function excerptFromBody(body, max = 120) {
  const plain = String(body || '')
    .replace(/^#+\s+.+$/m, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.slice(0, max);
}

function buildWikiFrontmatter(data) {
  const tags = uniqueTags(data.tags || []);
  const tagBlock =
    tags.length === 0 ? 'tags: []\n' : `tags:\n${tags.map((t) => `  - ${yamlScalar(t)}`).join('\n')}\n`;
  let out = '---\n';
  out += `title: ${yamlScalar(data.title || '')}\n`;
  out += `description: ${yamlScalar(data.description || '')}\n`;
  out += `type: ${yamlScalar(data.type || 'note')}\n`;
  out += `status: ${yamlScalar(data.status || 'active')}\n`;
  out += tagBlock;
  out += `date: ${yamlScalar(data.date || new Date().toISOString().slice(0, 10))}\n`;
  if (data.updated) out += `updated: ${yamlScalar(data.updated)}\n`;
  out += '---\n';
  return out;
}

/** 合併／覆寫 frontmatter，正文保留。 */
function upsertWikiFrontmatter(raw, patch = {}) {
  const { data, body } = splitWikiFrontmatter(raw);
  const today = new Date().toISOString().slice(0, 10);
  const mergedTags =
    patch.tags !== undefined
      ? uniqueTags(patch.tags)
      : uniqueTags(Array.isArray(data.tags) ? data.tags : []);
  const title =
    patch.title !== undefined
      ? String(patch.title || '').trim()
      : String(data.title || '').trim();
  const description =
    patch.description !== undefined
      ? String(patch.description || '').trim()
      : String(data.description || '').trim() || excerptFromBody(body);
  const merged = {
    title: title || extractWikiTitle(body, 'untitled'),
    description,
    type: patch.type || data.type || 'note',
    status: patch.status || data.status || 'active',
    tags: mergedTags,
    date: data.date || today,
    updated: patch.updated || (patch.title !== undefined || patch.tags !== undefined ? today : data.updated),
  };
  const bodyText = String(body || '').replace(/^\r?\n+/, '');
  return `${buildWikiFrontmatter(merged)}\n${bodyText}`;
}

function parseKeywordList(input) {
  if (Array.isArray(input)) {
    return uniqueTags(
      input.map((x) => String(x || '').trim()).filter(Boolean),
    ).slice(0, 10);
  }
  return uniqueTags(
    String(input || '')
      .split(/[,，、\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
  ).slice(0, 10);
}

function upsertWikiIndexLink(slug, label) {
  const indexPath = path.join(wikiRoot(), 'index.md');
  let text = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf8')
    : '# Kainnne 知識庫索引\n\n## 筆記\n\n';

  const today = new Date().toISOString().slice(0, 10);
  if (/> 最後更新：\d{4}-\d{2}-\d{2}/.test(text)) {
    text = text.replace(/> 最後更新：\d{4}-\d{2}-\d{2}/, `> 最後更新：${today}`);
  }

  const link = label ? `- [[${slug}]] — ${label}` : `- [[${slug}]]`;
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (text.includes(`[[${slug}]]`)) {
    text = text.replace(new RegExp(`^- \\[\\[${escaped}\\]\\][^\\n]*$`, 'm'), link);
    fs.writeFileSync(indexPath, text, 'utf8');
    return;
  }

  const sectionHeader = '## 筆記';
  const headerIdx = text.indexOf(sectionHeader);
  if (headerIdx === -1) {
    text += `\n${sectionHeader}\n\n${link}\n`;
    fs.writeFileSync(indexPath, text, 'utf8');
    return;
  }

  const afterHeader = headerIdx + sectionHeader.length;
  let sectionEnd = text.length;
  for (const h of ['## 學習中', '## 元資料']) {
    const i = text.indexOf(`\n${h}`, afterHeader);
    if (i !== -1 && i < sectionEnd) sectionEnd = i;
  }
  const before = text.slice(0, sectionEnd).replace(/\s*$/, '\n');
  const after = text.slice(sectionEnd).replace(/^\n*/, '\n');
  fs.writeFileSync(indexPath, `${before}\n${link}\n${after}`, 'utf8');
}

function removeWikiIndexLink(slug) {
  const indexPath = path.join(wikiRoot(), 'index.md');
  if (!fs.existsSync(indexPath)) return;
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let text = fs.readFileSync(indexPath, 'utf8');
  text = text.replace(new RegExp(`^- \\[\\[${escaped}\\]\\][^\\n]*\\n?`, 'gm'), '');
  const today = new Date().toISOString().slice(0, 10);
  if (/> 最後更新：\d{4}-\d{2}-\d{2}/.test(text)) {
    text = text.replace(/> 最後更新：\d{4}-\d{2}-\d{2}/, `> 最後更新：${today}`);
  }
  fs.writeFileSync(indexPath, text, 'utf8');
}

function collectWikiMdFiles(dir = wikiRoot(), prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectWikiMdFiles(abs, rel));
    } else if (isSiteWikiMarkdown(entry.name)) {
      out.push(rel);
    }
  }
  return out.sort();
}

function buildWikiTree(dir = wikiRoot(), prefix = '') {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.push({
        type: 'dir',
        name: entry.name,
        path: rel,
        children: buildWikiTree(abs, rel),
      });
    } else if (isSiteWikiMarkdown(entry.name)) {
      const slug = rel.replace(/\.md$/i, '');
      const content = fs.readFileSync(abs, 'utf8');
      const { data } = splitWikiFrontmatter(content);
      const meta = getWikiMetaEntry(slug);
      const folder = slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')) : '';
      const folderKeyword = folderKeywordFromRelPath(folder);
      const fmTags = Array.isArray(data.tags) ? data.tags : [];
      const metaTags = Array.isArray(meta.tags) ? meta.tags : [];
      const title =
        (typeof meta.title === 'string' && meta.title.trim()) ||
        extractWikiTitle(content, slug);
      const description =
        (typeof meta.description === 'string' && meta.description.trim()) ||
        (typeof data.description === 'string' && data.description.trim()) ||
        '';
      files.push({
        type: 'file',
        name: entry.name,
        path: rel,
        slug,
        title,
        description,
        tags: uniqueTags([folderKeyword, ...metaTags, ...fmTags]),
      });
    }
  }
  dirs.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  files.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  return [...dirs, ...files];
}

/** 儲存筆記到 wiki/：md 原文不動；標題／簡述／關鍵字寫入 _meta.json */
async function handleWikiUpload(req, res) {
  const { filename, content, folder, title, description, keywords, tags, autoSync } = req.body || {};
  if (!content || !String(content).trim()) {
    res.status(400).json({ error: '請提供筆記內容' });
    return;
  }

  const noteTitle = String(title || '').trim();
  if (!noteTitle) {
    res.status(400).json({ error: '請填寫顯示標題（title）' });
    return;
  }

  const noteDescription = String(description || '').trim();
  const fileLabel = String(filename || '').trim();
  if (!fileLabel) {
    res.status(400).json({ error: '請填寫檔案名稱' });
    return;
  }

  try {
    fs.mkdirSync(wikiRoot(), { recursive: true });

    let relName = fileLabel;
    const folderNorm = folder
      ? normalizeWikiRelPath(folder, { allowMdSuffix: false })
      : null;
    if (folder && !folderNorm) {
      res.status(400).json({ error: '目標資料夾路徑無效' });
      return;
    }
    if (!folderNorm) {
      res.status(400).json({ error: '請選擇資料夾（主關鍵字來自資料夾名稱）' });
      return;
    }
    // 若 filename 本身不含路徑，且有指定 folder，則拼成 folder/file.md
    if (!relName.includes('/') && !relName.includes('\\')) {
      relName = `${folderNorm}/${relName}`;
    }

    const safeName = safeWikiFilename(relName);
    if (!safeName) {
      res.status(400).json({ error: '請勿上傳 index.md，請用其他檔名' });
      return;
    }
    const targetPath = resolveUnderWiki(safeName);
    if (!targetPath) {
      res.status(400).json({ error: '檔名路徑無效' });
      return;
    }

    const folderKeyword = folderKeywordFromRelPath(folderNorm);
    const extraKeywords = parseKeywordList(keywords ?? tags);

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, String(content), 'utf8');

    const slug = safeName.replace(/\.md$/i, '');
    const meta = upsertWikiMetaEntry(slug, {
      title: noteTitle,
      description: noteDescription,
      tags: extraKeywords,
    });
    upsertWikiIndexLink(slug, noteTitle);

    let syncResult = null;
    if (autoSync) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      filename: safeName,
      slug,
      title: noteTitle,
      description: noteDescription,
      tags: uniqueTags([folderKeyword, ...(meta.tags || [])]),
      path: `wiki/${safeName}`,
      synced: Boolean(autoSync),
      sync: syncResult,
      message: autoSync
        ? `已存到 wiki/${safeName} 並推上 GitHub（Pages 約 2–5 分鐘更新，含大圖時可能更久）。`
        : `已存到 wiki/${safeName}。`,
    });
  } catch (err) {
    console.error('wiki upload error:', err);
    res.status(500).json({
      error: '儲存失敗',
      detail: String(err.message || err).slice(0, 400),
    });
  }
}

app.post('/api/wiki/upload', authMiddleware, handleWikiUpload);
// 相容舊路徑名稱
app.post('/api/raw/upload', authMiddleware, handleWikiUpload);
app.post('/api/ingest', authMiddleware, handleWikiUpload);

function normalizeWikiSlug(input) {
  return normalizeWikiRelPath(input, { allowMdSuffix: true });
}

function rewriteWikiLinks(text, oldSlug, newSlug) {
  // [[old]] / [[old|label]]（含巢狀路徑）
  const re = new RegExp(
    `\\[\\[${oldSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\|[^\\]]*)?\\]\\]`,
    'g',
  );
  return text.replace(re, (_m, label) => `[[${newSlug}${label || ''}]]`);
}

app.get('/api/wiki/list', authMiddleware, (_req, res) => {
  try {
    const files = collectWikiMdFiles().map((rel) => {
      const slug = rel.replace(/\.md$/i, '');
      const content = fs.readFileSync(path.join(wikiRoot(), rel), 'utf8');
      return {
        filename: rel,
        slug,
        title: extractWikiTitle(content, slug),
      };
    });
    res.json({ ok: true, files });
  } catch (err) {
    console.error('wiki list error:', err);
    res.status(500).json({ error: '無法讀取 wiki 列表', detail: String(err.message || err).slice(0, 300) });
  }
});

app.get('/api/wiki/tree', authMiddleware, (_req, res) => {
  try {
    res.json({ ok: true, tree: buildWikiTree() });
  } catch (err) {
    console.error('wiki tree error:', err);
    res.status(500).json({ error: '無法讀取 wiki 樹', detail: String(err.message || err).slice(0, 300) });
  }
});

app.post('/api/wiki/mkdir', authMiddleware, async (req, res) => {
  const folder = normalizeWikiRelPath(req.body?.path || req.body?.folder || req.body?.name, {
    allowMdSuffix: false,
  });
  if (!folder) {
    res.status(400).json({
      error: '資料夾名稱無效。可用中文、英文、數字、_、-，可用 / 表示巢狀；不可空白。',
    });
    return;
  }
  const abs = resolveUnderWiki(folder);
  if (!abs) {
    res.status(400).json({ error: '資料夾路徑無效' });
    return;
  }
  try {
    let created = false;
    if (fs.existsSync(abs)) {
      const st = fs.statSync(abs);
      if (!st.isDirectory()) {
        res.status(409).json({ error: `已有同名檔案 wiki/${folder}` });
        return;
      }
    } else {
      fs.mkdirSync(abs, { recursive: true });
      fs.writeFileSync(path.join(abs, '.gitkeep'), '', 'utf8');
      created = true;
    }

    let syncResult = null;
    if (req.body?.autoSync) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      path: folder,
      created,
      synced: Boolean(req.body?.autoSync),
      sync: syncResult,
      message: req.body?.autoSync
        ? created
          ? `已建立 wiki/${folder}/ 並推上 GitHub。`
          : `資料夾已存在：wiki/${folder}（已嘗試同步）。`
        : created
          ? `已建立 wiki/${folder}/。`
          : `資料夾已存在：wiki/${folder}`,
    });
  } catch (err) {
    console.error('wiki mkdir error:', err);
    res.status(500).json({ error: '建立資料夾失敗', detail: String(err.message || err).slice(0, 400) });
  }
});

app.post('/api/wiki/delete', authMiddleware, async (req, res) => {
  const rel = normalizeWikiRelPath(req.body?.path || req.body?.slug || req.body?.filename);
  if (!rel) {
    res.status(400).json({ error: '要刪除的路徑無效' });
    return;
  }
  const mdRel = rel.endsWith('.md') ? rel : `${rel}.md`;
  const slug = mdRel.replace(/\.md$/i, '');
  const abs = resolveUnderWiki(mdRel);
  if (!abs) {
    res.status(400).json({ error: '路徑無效' });
    return;
  }
  try {
    let deletedPath = mdRel;
    let kind = 'file';

    if (!fs.existsSync(abs)) {
      const dirAbs = resolveUnderWiki(rel);
      if (dirAbs && fs.existsSync(dirAbs) && fs.statSync(dirAbs).isDirectory()) {
        fs.rmSync(dirAbs, { recursive: true, force: true });
        deletedPath = rel;
        kind = 'dir';
        removeWikiMetaUnderPrefix(rel);
      } else {
        res.status(404).json({ error: `找不到 wiki/${mdRel}` });
        return;
      }
    } else {
      fs.unlinkSync(abs);
      removeWikiIndexLink(slug);
      removeWikiMetaEntry(slug);

      let dir = path.dirname(abs);
      const root = wikiRoot();
      while (dir.startsWith(root + path.sep) && dir !== root) {
        const left = fs.readdirSync(dir).filter((f) => f !== '.gitkeep' && !f.startsWith('.'));
        if (left.length > 0) break;
        fs.rmSync(dir, { recursive: true, force: true });
        dir = path.dirname(dir);
      }
    }

    let syncResult = null;
    if (req.body?.autoSync) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      slug: kind === 'file' ? slug : undefined,
      path: deletedPath,
      synced: Boolean(req.body?.autoSync),
      sync: syncResult,
      message: req.body?.autoSync
        ? kind === 'dir'
          ? `已刪除資料夾 wiki/${deletedPath}/ 並推上 GitHub。`
          : `已刪除 wiki/${deletedPath} 並推上 GitHub。`
        : kind === 'dir'
          ? `已刪除資料夾 wiki/${deletedPath}/。`
          : `已刪除 wiki/${deletedPath}。`,
    });
  } catch (err) {
    console.error('wiki delete error:', err);
    res.status(500).json({ error: '刪除失敗', detail: String(err.message || err).slice(0, 400) });
  }
});

app.post('/api/wiki/rename', authMiddleware, async (req, res) => {
  const oldSlug = normalizeWikiSlug(req.body?.oldSlug || req.body?.from);
  const newSlug = normalizeWikiSlug(req.body?.newSlug || req.body?.to);

  if (!oldSlug) {
    res.status(400).json({ error: '原檔名無效' });
    return;
  }
  if (!newSlug) {
    res.status(400).json({
      error: '新檔名無效。可用中文、英文、數字、_ 與 -，可用 / 表示資料夾；不可空白或其他符號。',
    });
    return;
  }
  if (oldSlug === newSlug) {
    res.status(400).json({ error: '新檔名與舊檔名相同' });
    return;
  }
  if (!isSiteWikiMarkdown(`${oldSlug}.md`) || !isSiteWikiMarkdown(`${newSlug}.md`)) {
    res.status(400).json({ error: '此檔案不可重新命名' });
    return;
  }

  const fromPath = resolveUnderWiki(`${oldSlug}.md`);
  const toPath = resolveUnderWiki(`${newSlug}.md`);
  if (!fromPath || !toPath) {
    res.status(400).json({ error: '路徑無效' });
    return;
  }

  if (!fs.existsSync(fromPath)) {
    res.status(404).json({ error: `找不到 wiki/${oldSlug}.md` });
    return;
  }
  if (fs.existsSync(toPath)) {
    res.status(409).json({ error: `已存在 wiki/${newSlug}.md，請換一個名字` });
    return;
  }

  try {
    fs.mkdirSync(path.dirname(toPath), { recursive: true });
    fs.renameSync(fromPath, toPath);
    moveWikiMetaEntry(oldSlug, newSlug);

    const wikiFiles = collectWikiMdFiles();
    const allToRewrite = [...wikiFiles, 'index.md'];
    for (const file of allToRewrite) {
      const fp = path.join(wikiRoot(), file);
      if (!fs.existsSync(fp)) continue;
      const before = fs.readFileSync(fp, 'utf8');
      const after = rewriteWikiLinks(before, oldSlug, newSlug);
      if (after !== before) fs.writeFileSync(fp, after, 'utf8');
    }

    let dir = path.dirname(fromPath);
    const root = wikiRoot();
    while (dir.startsWith(root + path.sep) && dir !== root) {
      const left = fs.readdirSync(dir).filter((f) => f !== '.gitkeep' && !f.startsWith('.'));
      if (left.length > 0) break;
      fs.rmSync(dir, { recursive: true, force: true });
      dir = path.dirname(dir);
    }

    let syncResult = null;
    if (req.body?.autoSync) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      oldSlug,
      newSlug,
      filename: `${newSlug}.md`,
      synced: Boolean(req.body?.autoSync),
      sync: syncResult,
      message: req.body?.autoSync
        ? `已將 ${oldSlug}.md 重新命名為 ${newSlug}.md 並推上 GitHub。`
        : `已將 ${oldSlug}.md 重新命名為 ${newSlug}.md。`,
    });
  } catch (err) {
    console.error('wiki rename error:', err);
    res.status(500).json({ error: '重新命名失敗', detail: String(err.message || err).slice(0, 400) });
  }
});

function oldMdBackupRoot() {
  return path.join(PROJECT_ROOT, 'public', 'old_md');
}

function formatBackupStamp(date = new Date()) {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}${mo}${d}_${h}${mi}`;
}

function uniqueOldMdBackupName(stem) {
  const safeStem = String(stem || 'note')
    .replace(/[^\w.\-()\u4e00-\u9fff]+/g, '_')
    .replace(/\.md$/i, '') || 'note';
  const root = oldMdBackupRoot();
  fs.mkdirSync(root, { recursive: true });
  const stamp = formatBackupStamp();
  let name = `${stamp}_${safeStem}.md`;
  let n = 2;
  while (fs.existsSync(path.join(root, name))) {
    name = `${stamp}_${safeStem}_${n}.md`;
    n += 1;
  }
  return name;
}

/** 以新 md 內容覆蓋現有筆記；舊檔備份到 public/old_md/YYYYMMDD_HHmm_stem.md */
app.post('/api/wiki/replace', authMiddleware, async (req, res) => {
  const slug = normalizeWikiSlug(req.body?.slug || req.body?.path);
  const content = String(req.body?.content ?? '');
  if (!slug || !isSiteWikiMarkdown(`${slug}.md`)) {
    res.status(400).json({ error: '筆記路徑無效' });
    return;
  }
  if (!content.trim()) {
    res.status(400).json({ error: '檔案內容是空的' });
    return;
  }

  const abs = resolveUnderWiki(`${slug}.md`);
  if (!abs) {
    res.status(400).json({ error: '路徑無效' });
    return;
  }
  if (!fs.existsSync(abs)) {
    res.status(404).json({ error: `找不到 wiki/${slug}.md` });
    return;
  }

  try {
    const stem = path.basename(slug);
    const backupName = uniqueOldMdBackupName(stem);
    const backupPath = path.join(oldMdBackupRoot(), backupName);
    const previous = fs.readFileSync(abs, 'utf8');
    fs.writeFileSync(backupPath, previous, 'utf8');
    fs.writeFileSync(abs, content, 'utf8');

    let syncResult = null;
    if (req.body?.autoSync !== false) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      slug,
      backup: `public/old_md/${backupName}`,
      synced: req.body?.autoSync !== false,
      sync: syncResult,
      message:
        req.body?.autoSync !== false
          ? `已覆蓋 wiki/${slug}.md，舊檔備份為 public/old_md/${backupName}，並推上 GitHub。`
          : `已覆蓋 wiki/${slug}.md，舊檔備份為 public/old_md/${backupName}。`,
    });
  } catch (err) {
    console.error('wiki replace error:', err);
    res.status(500).json({ error: '覆蓋失敗', detail: String(err.message || err).slice(0, 400) });
  }
});

/** 更新顯示標題／簡述／關鍵字（寫入 _meta.json，不改 md） */
app.post('/api/wiki/update-title', authMiddleware, async (req, res) => {
  const slug = normalizeWikiSlug(req.body?.slug);
  const title = String(req.body?.title || '').trim();
  const hasDescription = req.body?.description !== undefined;
  const description = hasDescription ? String(req.body?.description || '').trim() : undefined;
  const hasKeywords = req.body?.keywords !== undefined || req.body?.tags !== undefined;
  if (!slug) {
    res.status(400).json({ error: '筆記路徑無效' });
    return;
  }
  if (!title) {
    res.status(400).json({ error: '請填寫標題' });
    return;
  }

  const filePath = resolveUnderWiki(`${slug}.md`);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ error: `找不到 wiki/${slug}.md` });
    return;
  }

  try {
    const folder = slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')) : '';
    const folderKeyword = folderKeywordFromRelPath(folder);
    const prev = getWikiMetaEntry(slug);
    const extras = hasKeywords
      ? parseKeywordList(req.body?.keywords ?? req.body?.tags)
      : Array.isArray(prev.tags)
        ? prev.tags
        : [];

    const meta = upsertWikiMetaEntry(slug, {
      title,
      description: hasDescription ? description : prev.description || '',
      tags: extras,
    });
    upsertWikiIndexLink(slug, title);

    const nextTags = uniqueTags([folderKeyword, ...(meta.tags || [])]).slice(0, 10);

    let syncResult = null;
    if (req.body?.autoSync) {
      syncResult = await runWikiSync();
    }

    res.json({
      ok: true,
      slug,
      title,
      description: meta.description || '',
      tags: nextTags,
      synced: Boolean(req.body?.autoSync),
      sync: syncResult,
      message: req.body?.autoSync
        ? `已更新標題／簡述／關鍵字並推上 GitHub。`
        : `已更新標題／簡述／關鍵字。`,
    });
  } catch (err) {
    console.error('wiki update-title error:', err);
    res.status(500).json({ error: '更新失敗', detail: String(err.message || err).slice(0, 400) });
  }
});

app.post('/api/codex/chat', authMiddleware, async (req, res) => {
  const { message, model, reasoningEffort, history } = req.body || {};
  if (!message?.trim()) {
    res.status(400).json({ error: '請輸入訊息' });
    return;
  }

  const chosenModel = String(model || readCodexDefaultModel()).trim();
  const chosenEffort = String(reasoningEffort || readCodexDefaultEffort()).trim();
  const allowedEffort = new Set(CODEX_EFFORTS.map((e) => e.id));
  const effort = allowedEffort.has(chosenEffort) ? chosenEffort : 'medium';

  const prompt = buildCodexChatPrompt({
    message,
    history,
    projectRoot: PROJECT_ROOT,
    wikiFiles: collectWikiMdFiles(),
  });

  const authHeader = req.headers.authorization || '';
  const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const codexArgs = [
    'exec',
    '--json',
    '--color',
    'never',
    '--sandbox',
    'read-only',
    '--ephemeral',
    '-m',
    chosenModel,
    '-c',
    `model_reasoning_effort="${effort}"`,
    '-',
  ];

  const wantStream =
    String(req.query.stream || '') === '1' ||
    (req.headers.accept || '').includes('text/event-stream');

  if (!wantStream) {
    try {
      const { stdout, stderr } = await execFileAsync(
        'codex',
        [
          'exec',
          '--color',
          'never',
          '--sandbox',
          'read-only',
          '--ephemeral',
          '-m',
          chosenModel,
          '-c',
          `model_reasoning_effort="${effort}"`,
          '-',
        ],
        {
          cwd: PROJECT_ROOT,
          timeout: 180000,
          maxBuffer: 10 * 1024 * 1024,
          input: prompt,
        },
      );
      const answer = stdout?.trim() || stderr?.trim() || '（Codex 未回傳內容）';
      res.json({ ok: true, answer, model: chosenModel, reasoningEffort: effort });
    } catch (err) {
      console.error('codex error:', err);
      const msg = err.stderr || err.message || String(err);
      res.status(500).json({
        error: 'Codex 執行失敗。請確認 Mac 上已安裝 Codex CLI 並以 ChatGPT 帳號登入。',
        detail: msg.slice(0, 500),
      });
    }
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (payload) => {
    if (res.writableEnded) return;
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  send({
    type: 'status',
    message: `正在啟動 Codex（${chosenModel} · ${effort}）…`,
    model: chosenModel,
    reasoningEffort: effort,
  });

  const startedAt = Date.now();
  const tick = setInterval(() => {
    send({ type: 'tick', elapsedMs: Date.now() - startedAt });
  }, 1000);

  let buffer = '';
  let fullLog = '';
  let answerParts = [];
  let stoppedByUser = false;

  const child = spawn('codex', codexArgs, {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (sessionToken) activeCodexJobs.set(sessionToken, child);

  child.stdin.write(prompt);
  child.stdin.end();

  const handleChunk = (chunk, source) => {
    const text = chunk.toString('utf8');
    fullLog += text;
    buffer += text;

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let parsed = null;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        send({ type: 'log', source, text: trimmed });
        continue;
      }

      const extracted = extractCodexText(parsed);
      if (extracted) {
        answerParts.push(extracted);
        send({ type: 'delta', text: extracted });
      }

      send({
        type: 'event',
        eventType: parsed.type || parsed.msg?.type || 'unknown',
        summary: summarizeCodexEvent(parsed),
        raw: trimmed.length > 4000 ? `${trimmed.slice(0, 4000)}…` : trimmed,
      });
    }
  };

  child.stdout.on('data', (c) => handleChunk(c, 'stdout'));
  child.stderr.on('data', (c) => handleChunk(c, 'stderr'));

  const killTimer = setTimeout(() => {
    send({ type: 'status', message: '超過 3 分鐘，正在停止 Codex…' });
    child.kill('SIGTERM');
  }, 180000);

  const cleanupJob = () => {
    clearInterval(tick);
    clearTimeout(killTimer);
    if (sessionToken && activeCodexJobs.get(sessionToken) === child) {
      activeCodexJobs.delete(sessionToken);
    }
  };

  // 注意：不要用 req.on('close')——body 讀完就會觸發，會誤殺剛啟動的 Codex
  res.on('close', () => {
    if (res.writableEnded) return;
    stoppedByUser = true;
    cleanupJob();
    if (!child.killed) {
      child.kill('SIGTERM');
      setTimeout(() => {
        if (!child.killed) child.kill('SIGKILL');
      }, 1500);
    }
  });

  child.on('error', (err) => {
    cleanupJob();
    send({
      type: 'error',
      error: '無法啟動 Codex CLI',
      detail: String(err.message || err),
    });
    if (!res.writableEnded) res.end();
  });

  child.on('close', (code) => {
    cleanupJob();

    if (buffer.trim()) {
      handleChunk(Buffer.from(`${buffer}\n`), 'stdout');
      buffer = '';
    }

    const answer =
      answerParts.join('\n').trim() ||
      fullLog.trim() ||
      (stoppedByUser
        ? '（已停止）'
        : code === 0
          ? '（Codex 未回傳可顯示的文字）'
          : `Codex 結束，代碼 ${code}`);

    if (res.writableEnded) return;

    if (stoppedByUser) {
      send({
        type: 'done',
        ok: true,
        stopped: true,
        answer,
        fullLog,
        exitCode: code ?? 0,
        elapsedMs: Date.now() - startedAt,
        model: chosenModel,
        reasoningEffort: effort,
      });
    } else if (code && code !== 0 && !answerParts.length) {
      send({
        type: 'error',
        error: 'Codex 執行失敗',
        detail: fullLog.slice(-800) || `exit ${code}`,
        answer,
        elapsedMs: Date.now() - startedAt,
        model: chosenModel,
        reasoningEffort: effort,
      });
    } else {
      send({
        type: 'done',
        ok: true,
        answer,
        fullLog,
        exitCode: code ?? 0,
        elapsedMs: Date.now() - startedAt,
        model: chosenModel,
        reasoningEffort: effort,
      });
    }
    res.end();
  });
});

function extractCodexText(ev) {
  if (!ev || typeof ev !== 'object') return '';

  const candidates = [];
  const push = (v) => {
    if (typeof v === 'string' && v.trim()) candidates.push(v.trim());
  };

  push(ev.text);
  push(ev.message);
  push(ev.content);
  push(ev.delta);
  push(ev.msg?.message);
  push(ev.msg?.text);
  push(ev.item?.text);
  push(ev.item?.content);
  push(ev.item?.message);

  if (Array.isArray(ev.content)) {
    for (const part of ev.content) {
      if (typeof part === 'string') push(part);
      else if (part?.text) push(part.text);
    }
  }

  const type = String(ev.type || ev.msg?.type || '');
  const itemType = String(ev.item?.type || '');
  const interesting =
    /agent_message|output_text|message\.delta|response\.output|assistant/i.test(type) ||
    /agent_message|message/i.test(itemType);

  if (interesting) return candidates[0] || '';
  // item.completed with agent message body
  if (type.includes('item.') && itemType.includes('agent_message')) {
    return candidates[0] || '';
  }
  return '';
}

function summarizeCodexEvent(ev) {
  const t = ev.type || ev.msg?.type || ev.item?.type || 'event';
  if (/reasoning|thinking|thinking_delta/i.test(t)) return '思考中';
  if (/agent_message|message/i.test(t)) return '產生回覆';
  if (/tool|command|exec/i.test(t)) return '執行工具';
  if (/error/i.test(t)) return '錯誤';
  if (/task_complete|turn_complete|done/i.test(t)) return '完成';
  return t;
}

app.listen(PORT, () => {
  console.log(`\n🌸 WikiNB Bridge running on http://localhost:${PORT}`);
  console.log(`   Project: ${PROJECT_ROOT}`);
  console.log(`   Auth user: ${AUTH_USER ? 'set' : 'MISSING'}`);
  console.log(`   Auth emails: ${AUTH_EMAILS.join(', ')}`);
  console.log(`   SMTP: ${process.env.SMTP_USER && process.env.SMTP_PASS ? 'configured' : 'DEV (codes in terminal)'}`);
  console.log(`   AUTO_GIT_PUSH: ${process.env.AUTO_GIT_PUSH === 'true'}`);
  console.log(`   GITHUB_TOKEN: ${process.env.GITHUB_TOKEN?.trim() ? 'set' : 'missing (用本機 git 憑證)'}`);
  console.log(`   git: ${GIT_BIN}`);
  console.log(`   CORS: ${CORS_ORIGINS.join(', ')}\n`);
});
