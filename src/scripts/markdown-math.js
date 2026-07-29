import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

marked.setOptions({ breaks: true, gfm: true });

function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(String(tex || '').trim(), {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
    });
  } catch {
    return displayMode ? `<pre>${tex}</pre>` : `<code>${tex}</code>`;
  }
}

/**
 * 先抽出數學區塊再跑 marked，避免 \[ \] \( \) 被 markdown 吃掉。
 * 同時相容 $$...$$、偶發的獨立 [ ... ] 數學列。
 */
export function renderMarkdownWithMath(raw) {
  const text = String(raw ?? '');
  const slots = [];
  const stash = (html) => {
    const token = `@@MATH${slots.length}@@`;
    slots.push(html);
    return token;
  };

  let prepared = text
    // display: \[ ... \]
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, tex) => stash(renderTex(tex, true)))
    // inline: \( ... \)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, tex) => stash(renderTex(tex, false)))
    // display: $$ ... $$
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => stash(renderTex(tex, true)))
    // inline: $ ... $（避開 $$）
    .replace(/(^|[^$])\$([^$\n]+?)\$(?!\$)/g, (_m, lead, tex) => `${lead}${stash(renderTex(tex, false))}`)
    // Codex 偶發輸出成獨立一行的 [ tex ]（非連結）
    .replace(/(^|\n)\s*\[\s*\n([\s\S]*?)\n\s*\]\s*(?=\n|$)/g, (_m, lead, tex) => {
      if (/https?:\/\//i.test(tex) || /\]\(/.test(tex)) return _m;
      if (!/[\\^_{}]|\\[a-zA-Z]+/.test(tex)) return _m;
      return `${lead}${stash(renderTex(tex, true))}`;
    });

  let html = marked.parse(prepared, { async: false });
  slots.forEach((htmlPart, i) => {
    html = String(html).split(`@@MATH${i}@@`).join(htmlPart);
  });
  return html;
}
