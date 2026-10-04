export function requestedLocale(search = '') {
  const value = new URLSearchParams(search).get('lang');
  if (value === 'en') return 'en';
  if (value === 'zh' || value === 'zh-TW') return 'zh-TW';
  return null;
}

export function resolveLocale(search, saved) {
  return requestedLocale(search) || (saved === 'en' ? 'en' : 'zh-TW');
}
