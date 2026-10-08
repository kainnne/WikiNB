export function normalizeStudyUnit(value) {
  const match = String(value || '').normalize('NFKC').trim().match(/^U0?([1-9]|10)$/i);
  return match ? `U${String(Number(match[1])).padStart(2, '0')}` : '';
}

// Uses only the metadata returned after private access verification.
export function findStudyUnits(units, query) {
  const text = String(query || '').normalize('NFKC').toLowerCase().trim();
  if (!text) return units;
  const unit = normalizeStudyUnit(text);
  if (unit) return units.filter(item => item.unit === unit);
  const terms = text.split(/\s+/).filter(Boolean);
  const normalize = value => String(value || '').normalize('NFKC').toLowerCase();
  return units.map(item => {
    const fields = [[item.name, 4], [(item.key_concepts || []).join(' '), 3], [(item.retrieval_keywords || []).join(' '), 2], [item.summary, 1]];
    const score = terms.reduce((sum, term) => sum + fields.reduce((n, [value, weight]) => n + (normalize(value).includes(term) ? weight : 0), 0), 0);
    const everyTerm = terms.every(term => fields.some(([value]) => normalize(value).includes(term)));
    return { item, score: everyTerm ? score : 0 };
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score || a.item.unit.localeCompare(b.item.unit)).map(row => row.item);
}
