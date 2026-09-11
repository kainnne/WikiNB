import { marked } from 'marked';

// Build heading ranges once. The index stores text once, not a second copy per section.
export function indexWikiSections(markdown, toText = stripMarkdown) {
  let bodyText = '';
  const sections = [], parents = [];
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'html') continue;
    const text = toText(token.raw || '');
    if (!text) continue;
    if (token.type === 'heading') {
      if (sections.length) sections.at(-1).end = bodyText.length;
      while (parents.length && parents.at(-1).depth >= token.depth) parents.pop();
      parents.push({ depth: token.depth, title: toText(token.text) });
      sections.push({ heading: parents.map(item => item.title).join(' / '), start: bodyText.length, end: 0 });
    }
    bodyText += (bodyText ? '\n\n' : '') + text;
  }
  if (sections.length) sections.at(-1).end = bodyText.length;
  return { bodyText, sections };
}

export function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
