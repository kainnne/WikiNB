import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const WIKI_DIR = path.join(process.cwd(), 'wiki');

export interface WikiPage {
  slug: string;
  title: string;
  description: string;
  type: 'note' | 'learning';
  status: 'active' | 'completed' | 'paused' | 'archived';
  tags: string[];
  date: string;
  updated?: string;
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  targetSkill?: string;
  relatedSkills?: string[];
  body: string;
  html: string;
  excerpt: string;
}

export interface WikiTreeFileNode {
  type: 'file';
  name: string;
  path: string;
  slug: string;
  title: string;
}

export interface WikiTreeDirNode {
  type: 'dir';
  name: string;
  path: string;
  children: WikiTreeNode[];
}

export type WikiTreeNode = WikiTreeDirNode | WikiTreeFileNode;

/** wiki/foo bar/note.md → "foo%20bar/note"，讓巢狀路徑能安全放進 URL。 */
export function encodeWikiSlug(slug: string): string {
  return String(slug)
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}

/**
 * 把外部傳入的 slug 收斂成 `folder/note` 形式，並擋掉跳出 wiki/ 的路徑。
 * 無效時回傳 undefined。
 */
export function normalizeWikiSlug(slug: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(slug) ? slug.join('/') : slug;
  if (!raw) return undefined;

  const segments = String(raw)
    .replace(/\\/g, '/')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return undefined;
  if (segments.some((s) => s === '.' || s === '..')) return undefined;

  const last = segments[segments.length - 1].replace(/\.md$/i, '');
  if (!last) return undefined;
  segments[segments.length - 1] = last;

  return segments.join('/');
}

function parentFolder(slug: string): string {
  const idx = slug.lastIndexOf('/');
  return idx === -1 ? '' : slug.slice(0, idx);
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function linkifyWikiLinks(html: string): string {
  const base = (import.meta.env?.BASE_URL as string) || '/';
  return html.replace(
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_match, slug: string, label?: string) => {
      const target = normalizeWikiSlug(slug);
      const text = (label || slug.replace(/-/g, ' ')).trim();
      if (!target) return text;
      return `<a href="${base}wiki/${encodeWikiSlug(target)}" class="wiki-link">${text}</a>`;
    },
  );
}

function formatDateField(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return s.slice(0, 32);
}

function parseWikiFile(filePath: string, slug: string): WikiPage {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const html = linkifyWikiLinks(marked.parse(content, { async: false }) as string);
  const plain = stripMarkdown(content);
  const date =
    formatDateField(data.date) ||
    formatDateField(data.updated) ||
    new Date().toISOString().slice(0, 10);

  return {
    slug,
    title: (data.title as string) || slug,
    description: (data.description as string) || plain.slice(0, 120),
    type: (data.type as WikiPage['type']) || 'note',
    status: (data.status as WikiPage['status']) || 'active',
    tags: (data.tags as string[]) || [],
    date,
    updated: formatDateField(data.updated),
    priority: data.priority as WikiPage['priority'],
    progress: data.progress as number | undefined,
    targetSkill: data.targetSkill as string | undefined,
    relatedSkills: (data.relatedSkills as string[]) || [],
    body: content,
    html,
    excerpt: plain.slice(0, 200),
  };
}

export function getAllWikiPages(): WikiPage[] {
  if (!fs.existsSync(WIKI_DIR)) return [];

  const collectFiles = (dir: string, prefix = ''): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        files.push(...collectFiles(path.join(dir, entry.name), rel));
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
        files.push(rel);
      }
    }
    return files;
  };

  const files = collectFiles(WIKI_DIR);

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      return parseWikiFile(path.join(WIKI_DIR, file), slug);
    })
    .sort((a, b) => {
      // 最新在上：優先 updated，否則 date
      const ta = new Date(a.updated || a.date).getTime();
      const tb = new Date(b.updated || b.date).getTime();
      return tb - ta;
    });
}

export function getWikiPage(slug: string | string[] | undefined): WikiPage | undefined {
  const normalized = normalizeWikiSlug(slug);
  if (!normalized) return undefined;

  const root = path.resolve(WIKI_DIR);
  const filePath = path.resolve(root, `${normalized}.md`);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return undefined;

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return undefined;
  }
  if (!stat.isFile()) return undefined;

  return parseWikiFile(filePath, normalized);
}

/**
 * 由 page slug 組出巢狀資料夾樹（資料夾在前、檔案沿用傳入順序＝預設最新在上）。
 */
export function getWikiFolderTree(pages: WikiPage[]): WikiTreeNode[] {
  interface DirBuild {
    node: WikiTreeDirNode;
    dirs: Map<string, DirBuild>;
    files: WikiTreeFileNode[];
  }

  const makeDir = (name: string, dirPath: string): DirBuild => ({
    node: { type: 'dir', name, path: dirPath, children: [] },
    dirs: new Map(),
    files: [],
  });

  const root = makeDir('', '');

  for (const page of pages) {
    const segments = page.slug.split('/').filter(Boolean);
    const fileName = segments.pop();
    if (!fileName) continue;

    let cursor = root;
    const walked: string[] = [];
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

  const flatten = (dir: DirBuild): WikiTreeNode[] => {
    const dirs = [...dir.dirs.values()].sort((a, b) => collator.compare(a.node.name, b.node.name));
    for (const child of dirs) {
      child.node.children = flatten(child);
    }
    return [...dirs.map((d) => d.node), ...dir.files];
  };

  return flatten(root);
}

/**
 * 直接掃描 wiki/ 磁碟樹（含尚無筆記的空資料夾），供 WikiNB 瀏覽頁使用。
 */
export function getWikiDiskTree(dir = WIKI_DIR, prefix = ''): WikiTreeNode[] {
  if (!fs.existsSync(dir)) return [];
  const collator = new Intl.Collator('zh-Hant', { numeric: true, sensitivity: 'base' });
  const dirs: WikiTreeDirNode[] = [];
  const files: WikiTreeFileNode[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      dirs.push({
        type: 'dir',
        name: entry.name,
        path: rel,
        children: getWikiDiskTree(abs, rel),
      });
    } else if (entry.name.endsWith('.md') && entry.name !== 'index.md') {
      const slug = rel.replace(/\.md$/i, '');
      let title = slug;
      try {
        title = parseWikiFile(abs, slug).title;
      } catch {
        /* ignore */
      }
      files.push({
        type: 'file',
        name: entry.name,
        path: rel,
        slug,
        title,
      });
    }
  }

  dirs.sort((a, b) => collator.compare(a.name, b.name));
  files.sort((a, b) => collator.compare(a.name, b.name));
  return [...dirs, ...files];
}

export function getAllTags(pages: WikiPage[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const page of pages) {
    for (const tag of page.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSearchIndex(pages: WikiPage[]) {
  // 維持呼叫端排序（預設最新在上）
  return pages.map((p) => ({
    slug: p.slug,
    folder: parentFolder(p.slug),
    title: p.title,
    description: p.description,
    type: p.type,
    tags: p.tags,
    date: p.date,
    updated: p.updated,
    html: p.html,
    bodyText: stripMarkdown(p.body),
  }));
}

export function getPagesByType(pages: WikiPage[], type: WikiPage['type']) {
  return pages.filter((p) => p.type === type);
}
