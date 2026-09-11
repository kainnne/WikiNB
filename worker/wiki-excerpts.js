// Select evidence within a page; preserve the existing per-page and corpus budgets.
export function selectWikiExcerpt(page, terms, limit) {
  const aliases = [
    [/fair|compar|公平|比較|不對稱/i, ['公平', '比較', '不對稱']],
    [/critici|feedback|質疑|被動/i, ['被動', '判斷', '評價']],
    [/resource|team|資源|團隊|第一週/i, ['資源', '團隊', '第一週']],
    [/speak|oral|口才|口語/i, ['口語', '表達']],
    [/abilit|capabilit|能力/i, ['能力', '觀察表']],
  ];
  const query = terms.join(' ');
  const title = String(page.title || '').toLowerCase();
  terms = terms.filter(term => !title.includes(term));
  terms = [...new Set([...terms, ...aliases.filter(([pattern]) => pattern.test(query)).flatMap(([, words]) => words)])];
  const body = String(page.bodyText || '');
  const sections = (Array.isArray(page.sections) ? page.sections : [])
    .filter(section => Number.isInteger(section.start) && Number.isInteger(section.end)
      && section.start >= 0 && section.end > section.start && section.end <= body.length);
  if (!sections.length || body.length <= limit) return body.slice(0, limit);
  const ranked = sections.map((section, index) => {
    // The leaf heading prevents a repeated parent topic from drowning out detail.
    const heading = String(section.heading || '').split(' / ').at(-1).toLowerCase();
    const text = body.slice(section.start, section.end).toLowerCase();
    const score = terms.reduce((sum, term) => sum + (heading.includes(term) ? 8 : 0) + (text.includes(term) ? 1 : 0), 0);
    return { ...section, index, score };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  if (!ranked[0]?.score || ranked[0].index === 0) return body.slice(0, limit);
  // A short opening keeps scope/limitations alongside the requested evidence.
  let result = body.slice(0, Math.min(220, sections[0].end, limit));
  for (const section of ranked.slice(0, 2)) {
    const remaining = limit - result.length - 12;
    if (remaining < 100) break;
    let text = body.slice(section.start, section.end).trim();
    if (text.length > remaining) {
      const lower = text.toLowerCase();
      const matches = terms.filter(term => lower.includes(term)).sort((a, b) => b.length - a.length);
      const position = matches.length ? lower.indexOf(matches[0]) : 0;
      const start = Math.min(Math.max(0, position - 180), Math.max(0, text.length - remaining));
      text = text.slice(start, start + remaining);
    }
    result += '\n[…]\n' + text;
  }
  return result.slice(0, limit);
}
