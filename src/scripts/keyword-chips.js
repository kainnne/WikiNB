/**
 * 關鍵字 chip 編輯器：最多 max 個、每詞 maxLen 字元；
 * 溢出時用 <> 一次挪一個；新增時必須確認或取消。
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
 * @param {{
 *   keywords?: string[],
 *   locked?: string[],
 *   max?: number,
 *   maxLen?: number,
 *   onChange?: (keywords: string[]) => void,
 * }} options
 */
export function mountKeywordEditor(root, options = {}) {
  if (!root) return null;

  const max = options.max ?? KEYWORD_MAX;
  const maxLen = options.maxLen ?? KEYWORD_MAX_LEN;
  let locked = normalizeKeywords(options.locked || [], { max, maxLen: 32 });
  let extras = normalizeKeywords(options.keywords || [], { max, maxLen }).filter(
    (k) => !locked.some((l) => l.toLowerCase() === k.toLowerCase()),
  );
  let offset = 0;
  let adding = false;

  const ensureCapacity = () => {
    const room = Math.max(0, max - locked.length);
    extras = extras.slice(0, room);
  };
  ensureCapacity();

  root.classList.add('kw-editor');
  root.innerHTML = `
    <div class="kw-toolbar">
      <button type="button" class="kw-nav kw-prev" aria-label="往前一個關鍵字" disabled>&lt;</button>
      <div class="kw-viewport">
        <div class="kw-track"></div>
      </div>
      <button type="button" class="kw-nav kw-next" aria-label="往後一個關鍵字" disabled>&gt;</button>
      <button type="button" class="kw-add btn-ghost">新增關鍵字</button>
    </div>
    <div class="kw-compose hidden">
      <input type="text" class="search-input kw-input py-2 text-sm" maxlength="${maxLen}" placeholder="最多 ${maxLen} 字" autocomplete="off" />
      <button type="button" class="kw-confirm btn-ghost text-sm">確認</button>
      <button type="button" class="kw-cancel btn-ghost text-sm">取消</button>
    </div>
    <p class="kw-hint hidden text-xs text-berry-600/70"></p>
  `;

  const track = root.querySelector('.kw-track');
  const viewport = root.querySelector('.kw-viewport');
  const prevBtn = root.querySelector('.kw-prev');
  const nextBtn = root.querySelector('.kw-next');
  const addBtn = root.querySelector('.kw-add');
  const compose = root.querySelector('.kw-compose');
  const input = root.querySelector('.kw-input');
  const confirmBtn = root.querySelector('.kw-confirm');
  const cancelBtn = root.querySelector('.kw-cancel');
  const hint = root.querySelector('.kw-hint');

  const allKeywords = () => [...locked, ...extras];

  const emit = () => options.onChange?.(allKeywords());

  const updateHint = () => {
    /* 不顯示操作引導文案 */
  };

  const visibleCount = () => {
    if (!viewport) return 1;
    const w = viewport.clientWidth || 200;
    // 約略：每個 chip ~88px
    return Math.max(1, Math.floor(w / 96));
  };

  const render = () => {
    ensureCapacity();
    const items = allKeywords();
    const canShow = visibleCount();
    const maxOffset = Math.max(0, items.length - canShow);
    offset = Math.min(offset, maxOffset);
    const slice = items.slice(offset, offset + canShow);

    if (track) {
      track.innerHTML = slice
        .map((kw) => {
          const isLocked = locked.some((l) => l.toLowerCase() === kw.toLowerCase());
          const safe = String(kw)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
          return `
            <span class="kw-chip${isLocked ? ' is-locked' : ''}" data-kw="${safe}">
              <span class="kw-chip-text">${safe}</span>
              ${isLocked ? '' : '<button type="button" class="kw-remove" aria-label="移除">×</button>'}
            </span>
          `;
        })
        .join('');

      track.querySelectorAll('.kw-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chip = btn.closest('.kw-chip');
          const kw = chip?.getAttribute('data-kw') || '';
          extras = extras.filter((x) => x.toLowerCase() !== kw.toLowerCase());
          emit();
          render();
        });
      });
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
    }
    updateHint();
  };

  const setAdding = (on) => {
    adding = on;
    compose?.classList.toggle('hidden', !on);
    addBtn?.classList.toggle('hidden', on);
    if (on) {
      if (input) {
        input.value = '';
        input.focus();
      }
    }
    render();
  };

  const confirmAdd = () => {
    const value = clipKeyword(input?.value || '', maxLen);
    if (!value) {
      setAdding(false);
      return;
    }
    if (allKeywords().length >= max) {
      setAdding(false);
      return;
    }
    if (!allKeywords().some((k) => k.toLowerCase() === value.toLowerCase())) {
      extras = [...extras, value];
      emit();
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
  cancelBtn?.addEventListener('click', () => setAdding(false));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAdding(false);
    }
  });
  input?.addEventListener('input', () => {
    const clipped = clipKeyword(input.value, maxLen);
    if (clipped !== input.value) input.value = clipped;
  });

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => render()) : null;
  if (viewport && ro) ro.observe(viewport);

  render();

  return {
    getKeywords: () => allKeywords(),
    getExtras: () => [...extras],
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
