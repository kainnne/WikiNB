import zhTW from '../locales/zh-TW.json';
import en from '../locales/en.json';

const STORAGE_KEY = 'wikinb-locale-v1';
const DEFAULT_LOCALE = 'zh-TW';
const dictionaries = {
  'zh-TW': zhTW,
  en,
};

export function getLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh-TW') return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function t(key, vars = {}, locale = getLocale()) {
  const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  let text = dict[key] ?? dictionaries['zh-TW'][key] ?? dictionaries.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = String(text).replaceAll(`{${k}}`, String(v));
  }
  return text;
}

/** 筆記關鍵字顯示用（儲存值不變） */
export function translateKeyword(kw, locale = getLocale()) {
  const raw = String(kw ?? '').trim();
  if (!raw) return '';
  const key = `keyword.${raw}`;
  const translated = t(key, {}, locale);
  return translated === key ? raw : translated;
}

function applyAttr(el, attr, value) {
  if (attr === 'text') {
    el.textContent = value;
  } else if (attr === 'html') {
    el.innerHTML = value;
  } else if (attr === 'placeholder') {
    el.setAttribute('placeholder', value);
  } else if (attr === 'title') {
    el.setAttribute('title', value);
  } else if (attr === 'aria-label') {
    el.setAttribute('aria-label', value);
  }
}

export function applyI18n(root = document) {
  const locale = getLocale();
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hant';
  document.documentElement.dataset.locale = locale;

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    if (el.hasAttribute('data-i18n-n')) return;
    if (el.hasAttribute('data-i18n-date')) {
      applyAttr(el, 'text', t(key, { date: el.getAttribute('data-i18n-date') || '' }, locale));
      return;
    }
    applyAttr(el, 'text', t(key, {}, locale));
  });

  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (!key) return;
    applyAttr(el, 'html', t(key, {}, locale));
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (!key) return;
    applyAttr(el, 'placeholder', t(key, {}, locale));
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (!key) return;
    applyAttr(el, 'title', t(key, {}, locale));
  });

  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (!key) return;
    applyAttr(el, 'aria-label', t(key, {}, locale));
  });

  root.querySelectorAll('[data-keyword]').forEach((el) => {
    const kw = el.getAttribute('data-keyword') || '';
    el.textContent = translateKeyword(kw, locale);
  });

  const langBtn = document.getElementById('btn-lang');
  if (langBtn) {
    langBtn.textContent = t('nav.lang', {}, locale);
    langBtn.setAttribute('title', t('nav.langTitle', {}, locale));
  }
}

export function setLocale(locale) {
  const next = locale === 'en' ? 'en' : 'zh-TW';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  applyI18n();
  document.dispatchEvent(new CustomEvent('wikinb:locale-change', { detail: { locale: next } }));
}

export function toggleLocale() {
  setLocale(getLocale() === 'en' ? 'zh-TW' : 'en');
}

export function mountI18n() {
  applyI18n();
  document.getElementById('btn-lang')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLocale();
  });
}
