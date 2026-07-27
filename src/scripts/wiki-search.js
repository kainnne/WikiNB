/**
 * Shared client-side wiki browse + search.
 *
 * 預設呈現「資料夾優先」的巢狀樹（資料夾 → 子資料夾 → 筆記）；
 * 一旦有搜尋關鍵字，就只留下命中的筆記並自動展開它們的上層資料夾。
 *
 * searchIndex 由 src/lib/wiki.ts 的 getSearchIndex() 產生。
 * options.folderTree 可傳入 getWikiFolderTree() 的結果；沒有時會由 slug 自行推導。
 */
export function createWikiSearch(searchIndex, options = {}) {
  const escapeHtml = (text) =>
    String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const escapeAttr = (text) => escapeHtml(text).replace(/'/g, '&#39;');

  const encodeSlugPath = (slug) =>
    String(slug)
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');

  const domId = (slug) => String(slug).replace(/[^\p{L}\p{N}_-]+/gu, '_');

  const getBase = () => document.documentElement.dataset.base || '/';

  const pageBySlug = new Map(searchIndex.map((page) => [page.slug, page]));

  /** 沒有從伺服端拿到樹時，用 slug 自行組一棵（資料夾在前，檔案沿用索引順序）。 */
  const buildTreeFromIndex = () => {
    const makeDir = (name, dirPath) => ({
      node: { type: 'dir', name, path: dirPath, children: [] },
      dirs: new Map(),
      files: [],
    });
    const root = makeDir('', '');

    for (const page of searchIndex) {
      const segments = String(page.slug).split('/').filter(Boolean);
      const fileName = segments.pop();
      if (!fileName) continue;

      let cursor = root;
      const walked = [];
      for (const segment of segments) {
        walked.push(segment);
        let next = cursor.dirs.get(segment);
        if (!next) {
          next = makeDir(segment, walked.join('/'));
          cursor.dirs.set(segment, next);
        }
        cursor = next;
      }
      cursor.files.push({
        type: 'file',
        name: `${fileName}.md`,
        path: `${page.slug}.md`,
        slug: page.slug,
        title: page.title,
      });
    }

    const collator = new Intl.Collator('zh-Hant', { numeric: true, sensitivity: 'base' });
    const flatten = (dir) => {
      const dirs = [...dir.dirs.values()].sort((a, b) => collator.compare(a.node.name, b.node.name));
      for (const child of dirs) child.node.children = flatten(child);
      return [...dirs.map((d) => d.node), ...dir.files];
    };
    return flatten(root);
  };

  const folderTree =
    Array.isArray(options.folderTree) && options.folderTree.length
      ? options.folderTree
      : buildTreeFromIndex();

  /** 使用者手動展開的資料夾路徑；重新渲染後仍保留。 */
  const expandedDirs = new Set();

  const matchesQuery = (page, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      page.slug,
      page.folder,
      page.title,
      page.description,
      (page.tags || []).join(' '),
      page.bodyText,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  };

  const filterPages = (query) => {
    const q = query.trim();
    if (!q) return searchIndex;
    return searchIndex.filter((page) => matchesQuery(page, q));
  };

  /** 只留下含命中筆記的資料夾。 */
  const filterTree = (nodes, matchedSlugs) => {
    const out = [];
    for (const node of nodes) {
      if (node.type === 'dir') {
        const children = filterTree(node.children || [], matchedSlugs);
        if (children.length) out.push({ ...node, children });
      } else if (matchedSlugs.has(node.slug)) {
        out.push(node);
      }
    }
    return out;
  };

  const countNotes = (nodes) =>
    nodes.reduce(
      (sum, node) => sum + (node.type === 'dir' ? countNotes(node.children || []) : 1),
      0,
    );

  const countDirs = (nodes) =>
    nodes.reduce(
      (sum, node) => (node.type === 'dir' ? sum + 1 + countDirs(node.children || []) : sum),
      0,
    );

  const renderFile = (node) => {
    const page = pageBySlug.get(node.slug);
    if (!page) return '';

    const id = domId(page.slug);
    const href = `${getBase()}wiki/${encodeSlugPath(page.slug)}`;
    const label = page.slug.includes('/') ? page.slug.split('/').pop() : page.slug;
    const tags = (page.tags || [])
      .slice(0, 3)
      .map((t) => `<span class="tag-badge">${escapeHtml(t)}</span>`)
      .join('');
    const learningBadge =
      page.type === 'learning'
        ? '<span class="tag-badge bg-lavender-300/30 text-berry-700">學習中</span>'
        : '';

    return `
      <article class="wiki-item" data-slug="${escapeAttr(page.slug)}">
        <div class="flex items-start gap-2 px-4 py-5 md:gap-3 md:px-6">
          <button
            type="button"
            class="wiki-expand mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-pink-200/80 bg-white/50 text-pink-500 transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
            aria-expanded="false"
            aria-controls="content-${escapeAttr(id)}"
            aria-label="展開：${escapeAttr(page.title)}"
          >
            <span class="wiki-chevron text-sm transition-transform">▸</span>
          </button>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <time class="text-xs font-semibold text-pink-500">${escapeHtml(page.date)}</time>
              ${learningBadge}
              ${tags}
            </div>
            <a href="${escapeAttr(href)}" class="wiki-title-link block font-display text-lg font-bold text-berry-800 transition-colors hover:text-pink-600 md:text-xl">
              ${escapeHtml(label)}
            </a>
            <p class="mt-1 line-clamp-2 text-sm text-berry-700/75">${escapeHtml(page.description)}</p>
          </div>
        </div>
        <div id="content-${escapeAttr(id)}" class="wiki-panel hidden border-t border-pink-100/60 bg-white/30 px-4 pb-6 pt-2 md:px-6" hidden>
          <div class="wiki-content pl-11 md:pl-12">${page.html}</div>
          <div class="mt-6 pl-11 md:pl-12">
            <a href="${escapeAttr(href)}" class="text-sm font-semibold text-pink-600 hover:text-pink-700">專頁檢視 →</a>
          </div>
        </div>
      </article>
    `;
  };

  const renderDir = (node, forceExpand) => {
    const open = forceExpand || expandedDirs.has(node.path);
    const id = `folder-${domId(node.path)}`;
    const notes = countNotes(node.children || []);

    return `
      <div class="wiki-node" data-dir="${escapeAttr(node.path)}">
        <button
          type="button"
          class="folder-row"
          data-dir-toggle="${escapeAttr(node.path)}"
          aria-expanded="${open ? 'true' : 'false'}"
          aria-controls="${escapeAttr(id)}"
        >
          <span class="folder-chevron${open ? ' is-open' : ''}">▸</span>
          <span class="folder-name">${escapeHtml(node.name)}</span>
          <span class="folder-count">${notes} 篇</span>
        </button>
        <div id="${escapeAttr(id)}" class="wiki-tree folder-children${open ? '' : ' hidden'}"${open ? '' : ' hidden'}>
          ${renderNodes(node.children || [], forceExpand)}
        </div>
      </div>
    `;
  };

  const renderNodes = (nodes, forceExpand) =>
    nodes
      .map((node) => (node.type === 'dir' ? renderDir(node, forceExpand) : renderFile(node)))
      .join('');

  /** 根層：資料夾先出現，根目錄的 .md 排在後面並加上分組標籤。 */
  const renderRoot = (nodes, forceExpand) => {
    const dirs = nodes.filter((n) => n.type === 'dir');
    const files = nodes.filter((n) => n.type !== 'dir');

    let html = dirs.map((node) => renderDir(node, forceExpand)).join('');
    if (files.length) {
      if (dirs.length) html += '<div class="root-group-label">根目錄</div>';
      html += files.map(renderFile).join('');
    }
    return html;
  };

  const closeItem = (item) => {
    const panel = item.querySelector('.wiki-panel');
    const expandBtn = item.querySelector('.wiki-expand');
    const chevron = item.querySelector('.wiki-chevron');
    if (panel) {
      panel.hidden = true;
      panel.classList.add('hidden');
    }
    if (expandBtn) expandBtn.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.style.transform = '';
  };

  const openItem = (item, scroll = true) => {
    const panel = item.querySelector('.wiki-panel');
    const expandBtn = item.querySelector('.wiki-expand');
    const chevron = item.querySelector('.wiki-chevron');
    if (!panel || !expandBtn) return;

    item
      .closest('[data-search-results]')
      ?.querySelectorAll('.wiki-item')
      .forEach((other) => {
        if (other !== item) closeItem(other);
      });

    panel.hidden = false;
    panel.classList.remove('hidden');
    expandBtn.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.style.transform = 'rotate(90deg)';
    if (scroll) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const bindHandlers = (container) => {
    container.querySelectorAll('.wiki-expand').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.wiki-item');
        const panel = item?.querySelector('.wiki-panel');
        if (panel && !panel.hidden) closeItem(item);
        else if (item) openItem(item);
      });
    });

    container.querySelectorAll('[data-dir-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dirPath = btn.getAttribute('data-dir-toggle');
        const children = btn.parentElement?.querySelector('.folder-children');
        const chevron = btn.querySelector('.folder-chevron');
        if (!children) return;

        const open = children.hidden;
        children.hidden = !open;
        children.classList.toggle('hidden', !open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        chevron?.classList.toggle('is-open', open);
        if (open) expandedDirs.add(dirPath);
        else expandedDirs.delete(dirPath);
      });
    });
  };

  const renderResults = ({ query, resultsEl, emptyEl, metaEl }) => {
    const q = query.trim();
    const results = filterPages(q);
    const matchedSlugs = new Set(results.map((p) => p.slug));
    const tree = q ? filterTree(folderTree, matchedSlugs) : folderTree;
    const hasTree = tree.length > 0;

    if (metaEl) {
      if (!q) {
        metaEl.textContent = hasTree
          ? `共 ${results.length} 篇 · ${countDirs(folderTree)} 個資料夾`
          : '';
      } else {
        metaEl.textContent = results.length ? `找到 ${results.length} 筆` : '沒有結果';
      }
    }

    if (!hasTree) {
      resultsEl.classList.add('hidden');
      resultsEl.innerHTML = '';
      if (emptyEl) {
        emptyEl.textContent = q ? `沒有符合「${q}」的結果` : '還沒有筆記';
        emptyEl.classList.remove('hidden');
      }
      return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');
    resultsEl.classList.add('wiki-tree');
    resultsEl.innerHTML = renderRoot(tree, Boolean(q));
    resultsEl.classList.remove('hidden');
    bindHandlers(resultsEl);
  };

  const getQueryFromUrl = () => new URLSearchParams(window.location.search).get('q') || '';

  const mount = ({ input, form, resultsEl, emptyEl, metaEl, syncUrl = false }) => {
    const runSearch = () => {
      const q = input?.value ?? '';
      if (syncUrl) {
        const url = new URL(window.location.href);
        if (q.trim()) url.searchParams.set('q', q.trim());
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
      }
      renderResults({ query: q, resultsEl, emptyEl, metaEl });
    };

    input?.addEventListener('input', runSearch);
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      runSearch();
    });

    return { runSearch, getQueryFromUrl };
  };

  return { mount, renderResults, getQueryFromUrl, filterPages };
}
