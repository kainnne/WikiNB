/**
 * 關鍵字 chip 編輯器：最多 max 個；
 * 資料夾主關鍵字不顯示（仍計入上限）。
 * 輸入列恆顯示：新增關鍵字、取消清空；無「新增關鍵字」獨立按鈕。
 * 單一字詞不限制字元長度（英文友善）。
 */
import { t, translateKeyword } from './i18n.js';

export const KEYWORD_MAX = 10;

export function charLen(text) {
  return Array.from(String(text ?? '')).length;
}

/** trim only — no per-keyword character cap */
export function clipKeyword(text) {
  return String(text ?? '').trim();
}

export function normalizeKeywords(list, { max = KEYWORD_MAX } = {}) {
  const out = [];
  const seen = new Set();
  for (const raw of list || []) {
    const value = clipKeyword(raw);
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * @param {HTMLElement} root
 * @param {object} options
 * @param {string[]} [options.keywords]
 * @param {string[]} [options.locked]
 * @param {number} [options.max]
 * @param {boolean} [options.simple] +md：chip 放在輸入列上方
 * @param {boolean} [options.compact] 相容舊參數（等同 simple）
 * @param {boolean} [options.composeOpen] 相容舊參數（已一律展開）
 * @param {(keywords: string[]) => void} [options.onChange]
 */
export function mountKeywordEditor(root, options = {}) {
  if (!root) return null;

  const max = options.max ?? KEYWORD_MAX;
  const simple = Boolean(options.simple || options.compact);
  let locked = normalizeKeywords(options.locked || [], { max });
  let extras = normalizeKeywords(options.keywords || [], { max }).filter(
    (k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()),
  );
  let offset = 0;

  const ensureCapacity = () => {
    const room = Math.max(0, max - locked.length);
    extras = extras.slice(0, room);
  };
  ensureCapacity();

  root.classList.add('kw-editor');
  if (simple) root.classList.add('kw-editor-simple');
  root.innerHTML = simple
    ? `
    <div class="kw-compose">
      <input
        type="text"
        class="search-input kw-input py-2 text-sm"
        autocomplete="off"
        data-i18n-placeholder="keywords.placeholder"
        placeholder="${t('keywords.placeholder')}"
      />
      <button type="button" class="kw-confirm btn-ghost text-sm" data-i18n="keywords.add">${t('keywords.add')}</button>
      <button type="button" class="kw-cancel btn-ghost text-sm" data-i18n="keywords.cancel">${t('keywords.cancel')}</button>
    </div>
    <div class="kw-chips-simple hidden">
      <div class="kw-track kw-track-wrap"></div>
    </div>
  `
    : `
    <div class="kw-toolbar">
      <button type="button" class="kw-nav kw-prev is-hidden" disabled>&lt;</button>
      <div class="kw-viewport">
        <div class="kw-track"></div>
      </div>
      <button type="button" class="kw-nav kw-next is-hidden" disabled>&gt;</button>
    </div>
    <div class="kw-compose">
      <input
        type="text"
        class="search-input kw-input py-2 text-sm"
        autocomplete="off"
        data-i18n-placeholder="keywords.placeholder"
        placeholder="${t('keywords.placeholder')}"
      />
      <button type="button" class="kw-confirm btn-ghost text-sm" data-i18n="keywords.add">${t('keywords.add')}</button>
      <button type="button" class="kw-cancel btn-ghost text-sm" data-i18n="keywords.cancel">${t('keywords.cancel')}</button>
    </div>
  `;

  const track = root.querySelector(simple ? '.kw-chips-simple .kw-track' : '.kw-toolbar .kw-track');
  const viewport = root.querySelector('.kw-viewport');
  const prevBtn = root.querySelector('.kw-prev');
  const nextBtn = root.querySelector('.kw-next');
  const compose = root.querySelector('.kw-compose');
  const input = root.querySelector('.kw-input');
  const confirmBtn = root.querySelector('.kw-confirm');
  const cancelBtn = root.querySelector('.kw-cancel');
  const simpleChips = root.querySelector('.kw-chips-simple');

  const allKeywords = () => [...locked, ...extras];
  const visibleKeywords = () => [...extras];
  const emit = () => options.onChange?.(allKeywords());

  const visibleCount = () => {
    if (!viewport) return 1;
    const w = viewport.clientWidth || 200;
    return Math.max(1, Math.floor(w / 96));
  };

  const bindRemove = (container) => {
    container?.querySelectorAll('.kw-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chip = btn.closest('.kw-chip');
        const kw = chip?.getAttribute('data-kw') || '';
        extras = extras.filter((x) => x.toLowerCase() !== kw.toLowerCase());
        emit();
        render();
      });
    });
  };

  const escapeAttr = (text) =>
    String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');

  const chipHtml = (items) =>
    items
      .map((kw) => {
        const safe = escapeAttr(kw);
        const label = escapeAttr(translateKeyword(kw));
        return `
            <span class="kw-chip" data-kw="${safe}">
              <span class="kw-chip-text" data-keyword="${safe}">${label}</span>
              <button type="button" class="kw-remove" aria-label="${escapeAttr(t('keywords.remove'))}">×</button>
            </span>
          `;
      })
      .join('');

  const render = () => {
    ensureCapacity();
    const items = visibleKeywords();
    compose?.classList.remove('hidden');
    if (confirmBtn) confirmBtn.disabled = allKeywords().length >= max;

    if (simple) {
      if (track) {
        track.innerHTML = chipHtml(items);
        bindRemove(track);
      }
      simpleChips?.classList.toggle('hidden', items.length === 0);
      return;
    }

    const canShow = visibleCount();
    const maxOffset = Math.max(0, items.length - canShow);
    offset = Math.min(offset, maxOffset);
    const slice = items.slice(offset, offset + canShow);

    if (track) {
      track.innerHTML = chipHtml(slice);
      bindRemove(track);
    }

    const needNav = items.length > canShow;
    if (prevBtn) {
      prevBtn.disabled = !needNav || offset <= 0;
      prevBtn.classList.toggle('is-hidden', !needNav);
    }
    if (nextBtn) {
      nextBtn.disabled = !needNav || offset >= maxOffset;
      nextBtn.classList.toggle('is-hidden', !needNav);
    }
  };

  const confirmAdd = () => {
    const value = clipKeyword(input?.value || '');
    if (!value) {
      if (input) input.value = '';
      return;
    }
    if (allKeywords().length >= max) return;
    if (!allKeywords().some((k) => k.toLowerCase() === value.toLowerCase())) {
      extras = [...extras, value];
      emit();
    }
    if (input) input.value = '';
    render();
    input?.focus();
  };

  prevBtn?.addEventListener('click', () => {
    offset = Math.max(0, offset - 1);
    render();
  });
  nextBtn?.addEventListener('click', () => {
    offset += 1;
    render();
  });
  confirmBtn?.addEventListener('click', confirmAdd);
  cancelBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    input?.focus();
  });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (input) input.value = '';
    }
  });

  const onLocale = () => {
    if (confirmBtn) confirmBtn.textContent = t('keywords.add');
    if (cancelBtn) cancelBtn.textContent = t('keywords.cancel');
    if (input) input.placeholder = t('keywords.placeholder');
    render();
  };
  document.addEventListener('wikinb:locale-change', onLocale);

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => render()) : null;
  if (viewport && ro && !simple) ro.observe(viewport);

  render();

  return {
    getKeywords: () => allKeywords(),
    getExtras: () => [...extras],
    isComposing: () => false,
    setLocked(nextLocked) {
      locked = normalizeKeywords(nextLocked || [], { max });
      extras = extras.filter((k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()));
      ensureCapacity();
      emit();
      render();
    },
    setKeywords(next) {
      extras = normalizeKeywords(next || [], { max }).filter(
        (k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()),
      );
      ensureCapacity();
      emit();
      render();
    },
    destroy() {
      document.removeEventListener('wikinb:locale-change', onLocale);
      ro?.disconnect();
      root.innerHTML = '';
    },
  };
}
