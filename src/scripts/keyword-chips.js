/**
 * 關鍵字 chip 編輯器：最多 max 個、每詞 maxLen 字元；
 * 資料夾主關鍵字不顯示（仍計入上限）。
 * simple：+md 用 — 只顯示輸入＋確認／取消，無「新增關鍵字」按鈕。
 */

export const KEYWORD_MAX = 10;
export const KEYWORD_MAX_LEN = 8;

export function charLen(text) {
  return Array.from(String(text ?? '')).length;
}

export function clipKeyword(text, maxLen = KEYWORD_MAX_LEN) {
  return Array.from(String(text ?? '').trim()).slice(0, maxLen).join('');
}

export function normalizeKeywords(list, { max = KEYWORD_MAX, maxLen = KEYWORD_MAX_LEN } = {}) {
  const out = [];
  const seen = new Set();
  for (const raw of list || []) {
    const t = clipKeyword(raw, maxLen);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
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
 * @param {number} [options.maxLen]
 * @param {boolean} [options.simple] +md：永遠顯示輸入列，無新增按鈕；關鍵字非必填
 * @param {boolean} [options.compact] 舊 compact（改用 simple）
 * @param {boolean} [options.composeOpen] 管理頁：預設展開輸入列
 * @param {(keywords: string[]) => void} [options.onChange]
 */
export function mountKeywordEditor(root, options = {}) {
  if (!root) return null;

  const max = options.max ?? KEYWORD_MAX;
  const maxLen = options.maxLen ?? KEYWORD_MAX_LEN;
  const simple = Boolean(options.simple || options.compact);
  const stickyCompose = Boolean(options.composeOpen) || simple;
  let locked = normalizeKeywords(options.locked || [], { max, maxLen: 32 });
  let extras = normalizeKeywords(options.keywords || [], { max, maxLen }).filter(
    (k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()),
  );
  let offset = 0;
  let adding = stickyCompose;

  const ensureCapacity = () => {
    const room = Math.max(0, max - locked.length);
    extras = extras.slice(0, room);
  };
  ensureCapacity();

  root.classList.add('kw-editor');
  if (simple) root.classList.add('kw-editor-simple');
  root.innerHTML = `
    <div class="kw-toolbar${simple ? ' hidden' : ''}">
      <button type="button" class="kw-nav kw-prev is-hidden" aria-label="往前一個關鍵字" disabled>&lt;</button>
      <div class="kw-viewport">
        <div class="kw-track"></div>
      </div>
      <button type="button" class="kw-nav kw-next is-hidden" aria-label="往後一個關鍵字" disabled>&gt;</button>
      <button type="button" class="kw-add btn-ghost">新增關鍵字</button>
    </div>
    <div class="kw-chips-simple${simple ? '' : ' hidden'}">
      <div class="kw-track kw-track-wrap"></div>
    </div>
    <div class="kw-compose${adding ? '' : ' hidden'}">
      <input
        type="text"
        class="search-input kw-input py-2 text-sm"
        maxlength="${maxLen}"
        autocomplete="off"
        placeholder="${simple ? '選填，輸入後按確認' : ''}"
      />
      <button type="button" class="kw-confirm btn-ghost text-sm">確認</button>
      <button type="button" class="kw-cancel btn-ghost text-sm">取消</button>
    </div>
  `;

  const toolbar = root.querySelector('.kw-toolbar');
  const track = root.querySelector(simple ? '.kw-chips-simple .kw-track' : '.kw-toolbar .kw-track');
  const viewport = root.querySelector('.kw-viewport');
  const prevBtn = root.querySelector('.kw-prev');
  const nextBtn = root.querySelector('.kw-next');
  const addBtn = root.querySelector('.kw-add');
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

  const chipHtml = (items) =>
    items
      .map((kw) => {
        const safe = String(kw)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/"/g, '&quot;');
        return `
            <span class="kw-chip" data-kw="${safe}">
              <span class="kw-chip-text">${safe}</span>
              <button type="button" class="kw-remove" aria-label="移除">×</button>
            </span>
          `;
      })
      .join('');

  const render = () => {
    ensureCapacity();
    const items = visibleKeywords();

    if (simple) {
      if (track) {
        track.innerHTML = chipHtml(items);
        bindRemove(track);
      }
      simpleChips?.classList.toggle('hidden', items.length === 0);
      compose?.classList.remove('hidden');
      if (confirmBtn) confirmBtn.disabled = allKeywords().length >= max;
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
    if (addBtn) {
      addBtn.disabled = adding || allKeywords().length >= max;
      addBtn.classList.toggle('hidden', adding);
    }
    compose?.classList.toggle('hidden', !adding);
    toolbar?.classList.toggle('kw-toolbar-solo', false);
  };

  const setAdding = (on) => {
    adding = on;
    if (on && input) {
      input.value = '';
      queueMicrotask(() => input.focus());
    }
    render();
  };

  const confirmAdd = () => {
    const value = clipKeyword(input?.value || '', maxLen);
    if (!value) {
      if (input) input.value = '';
      if (!stickyCompose) setAdding(false);
      return;
    }
    if (allKeywords().length >= max) {
      if (!stickyCompose) setAdding(false);
      return;
    }
    if (!allKeywords().some((k) => k.toLowerCase() === value.toLowerCase())) {
      extras = [...extras, value];
      emit();
    }
    if (input) input.value = '';
    if (stickyCompose) {
      render();
      input?.focus();
      return;
    }
    setAdding(false);
  };

  prevBtn?.addEventListener('click', () => {
    offset = Math.max(0, offset - 1);
    render();
  });
  nextBtn?.addEventListener('click', () => {
    offset += 1;
    render();
  });
  addBtn?.addEventListener('click', () => {
    if (allKeywords().length >= max) return;
    setAdding(true);
  });
  confirmBtn?.addEventListener('click', confirmAdd);
  cancelBtn?.addEventListener('click', () => {
    if (input) input.value = '';
    if (simple || stickyCompose) {
      input?.focus();
      return;
    }
    setAdding(false);
  });
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (input) input.value = '';
      if (!simple && !stickyCompose) setAdding(false);
    }
  });
  input?.addEventListener('input', () => {
    const clipped = clipKeyword(input.value, maxLen);
    if (clipped !== input.value) input.value = clipped;
  });

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => render()) : null;
  if (viewport && ro && !simple) ro.observe(viewport);

  render();

  return {
    getKeywords: () => allKeywords(),
    getExtras: () => [...extras],
    /** simple 模式下輸入中的草稿不算「必須確認」；永遠可直接送出 */
    isComposing: () => (simple ? false : adding),
    setLocked(nextLocked) {
      locked = normalizeKeywords(nextLocked || [], { max, maxLen: 32 });
      extras = extras.filter((k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()));
      ensureCapacity();
      emit();
      render();
    },
    setKeywords(next) {
      extras = normalizeKeywords(next || [], { max, maxLen }).filter(
        (k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()),
      );
      ensureCapacity();
      emit();
      render();
    },
    destroy() {
      ro?.disconnect();
      root.innerHTML = '';
    },
  };
}
