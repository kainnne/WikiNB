import { marked } from 'marked';

export function safeAnswer(markdown, doc = document) {
  const template = doc.createElement('template');
  template.innerHTML = marked.parse(String(markdown || ''), { async: false, breaks: true, gfm: true });
  template.content.querySelectorAll('script,style,iframe,object,embed,svg,math,form,img').forEach(node => node.remove());
  const allowed = new Set(['P', 'BR', 'STRONG', 'EM', 'UL', 'OL', 'LI', 'CODE', 'PRE', 'BLOCKQUOTE', 'A', 'H2', 'H3', 'H4', 'HR']);
  template.content.querySelectorAll('*').forEach(node => {
    if (!allowed.has(node.tagName)) { node.replaceWith(...node.childNodes); return; }
    const href = node.tagName === 'A' ? node.getAttribute('href') : null;
    for (const attr of [...node.attributes]) node.removeAttribute(attr.name);
    if (href) {
      try {
        const url = new URL(href, 'https://wikinb.kainnne.com/');
        if (['https:', 'http:', 'mailto:'].includes(url.protocol)) {
          node.setAttribute('href', url.href);
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      } catch { /* Keep unsafe links as inert text. */ }
    }
  });
  return template.content;
}

// Only transport differs; /openai/ uses the existing Gemini page and interaction.
export async function checkOpenAI(api) {
  const response = await fetch(`${api}/api/openai/health`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('health');
  return (await response.json()).available === true;
}

export async function askOpenAI(api, { message, history }) {
  const known = ['invalid_request', 'invalid_question', 'rate_limit', 'provider_rate_limit', 'budget_exhausted', 'unavailable', 'knowledge_unavailable', 'upstream_unavailable', 'empty_answer'];
  let response, data;
  try {
    response = await fetch(`${api}/api/openai/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }), signal: AbortSignal.timeout(60000),
    });
    data = await response.json();
  } catch { throw Object.assign(new Error('openai.error.upstream_unavailable'), { code: 'upstream_unavailable' }); }
  if (!response.ok || !data.ok) {
    const code = known.includes(data.code) ? data.code : 'unavailable';
    throw Object.assign(new Error(`openai.error.${code}`), { code });
  }
  return data;
}
