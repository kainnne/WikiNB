import { marked } from 'marked';
import { t } from './i18n.js';

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

export function mountOpenAIChat() {
  const root = document.getElementById('openai-demo');
  if (!root) return;
  const api = String(root.dataset.apiUrl || '').replace(/\/+$/, '');
  const form = document.getElementById('openai-form');
  const input = document.getElementById('openai-message');
  const send = document.getElementById('openai-send');
  const log = document.getElementById('openai-log');
  const start = document.getElementById('openai-start');
  const status = document.getElementById('openai-status');
  const topics = [...root.querySelectorAll('[data-question]')];
  let history = [], busy = false, available = false, stateKey = 'openai.checking';
  function showState(key) { stateKey = key; status.textContent = key ? t(key) : ''; }
  function updateControls() {
    send.disabled = busy || !available;
    topics.forEach(button => { button.disabled = busy || !available; });
    input.readOnly = busy;
    log.setAttribute('aria-busy', String(busy));
  }
  function bubble(role, content) {
    const node = document.createElement('div');
    node.className = 'openai-message';
    node.dataset.role = role;
    node.setAttribute('aria-label', t(`openai.role.${role}`));
    if (role === 'user') node.textContent = content;
    else node.append(safeAnswer(content));
    log.append(node);
    while (log.querySelectorAll('.openai-message').length > 40) log.querySelector('.openai-message').remove();
    log.scrollTop = log.scrollHeight;
    return node;
  }
  async function submit(event) {
    event?.preventDefault();
    if (busy || !available) return;
    const message = input.value.trim();
    if (!message || message.length > 1200) { showState('openai.error.invalid_question'); return; }
    busy = true; updateControls(); showState('openai.thinking');
    start.hidden = true;
    const pending = bubble('user', message);
    try {
      const response = await fetch(`${api}/api/openai/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }), signal: AbortSignal.timeout(60000),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const known = ['invalid_request', 'invalid_question', 'rate_limit', 'provider_rate_limit', 'budget_exhausted', 'unavailable', 'knowledge_unavailable', 'upstream_unavailable', 'empty_answer'];
        const code = known.includes(data.code) ? data.code : 'unavailable';
        if (code === 'budget_exhausted') available = false;
        showState(`openai.error.${code}`);
        pending.remove();
        return;
      }
      bubble('assistant', data.answer);
      history = [...history, { role: 'user', content: message }, { role: 'assistant', content: data.answer }].slice(-4);
      input.value = '';
      showState(data.incomplete ? 'openai.incomplete' : '');
    } catch {
      pending.remove();
      showState('openai.error.upstream_unavailable');
    } finally {
      busy = false; updateControls();
      if (available) input.focus();
    }
  }
  form.addEventListener('submit', submit);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
      event.preventDefault(); form.requestSubmit();
    }
  });
  topics.forEach(button => button.addEventListener('click', () => {
    input.value = t(button.dataset.question); form.requestSubmit();
  }));
  document.addEventListener('wikinb:locale-change', () => {
    showState(stateKey);
    log.querySelectorAll('[data-role]').forEach(node => node.setAttribute('aria-label', t(`openai.role.${node.dataset.role}`)));
  });
  updateControls();
  if (!api) { showState('openai.error.unavailable'); return; }
  fetch(`${api}/api/openai/health`, { signal: AbortSignal.timeout(10000) })
    .then(async response => {
      if (!response.ok) throw new Error('health');
      const data = await response.json();
      available = data.available === true;
      showState(available ? '' : 'openai.paused');
    })
    .catch(() => showState('openai.error.unavailable'))
    .finally(updateControls);
}
