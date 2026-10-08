import fs from 'node:fs';
import path from 'node:path';

export function registerPrivateStudy(app, authMiddleware, { sourceRoot, catalog, apiUrl, adminSecret }) {
  app.get('/api/private-study/owner', authMiddleware, (_req, res) => { res.set('Cache-Control', 'no-store'); res.json({ owner: true }); });
  app.get('/api/private-study/document', authMiddleware, (req, res) => {
    const slug = String(req.query.slug || '');
    if (!catalog.some(item => item.slug === slug)) return res.status(404).json({ error: '找不到私人文章' });
    const root = path.resolve(sourceRoot || '.');
    const filename = path.resolve(root, slug + '.md');
    if (!sourceRoot || !filename.startsWith(root + path.sep) || !fs.existsSync(filename)) return res.status(404).json({ error: '私人文章尚未配置' });
    res.set('Cache-Control', 'no-store');
    res.json({ title: catalog.find(item => item.slug === slug).title, markdown: fs.readFileSync(filename, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '') });
  });
  for (const action of ['invite', 'revoke']) {
    app.post(`/api/private-study/${action}`, authMiddleware, async (req, res) => {
      if (!adminSecret || !apiUrl?.startsWith('https://')) return res.status(503).json({ error: '私人邀請服務尚未配置' });
      try {
        const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/private-study/admin/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminSecret}` }, body: JSON.stringify(action === 'revoke' ? { id: req.body?.id } : {}), signal: AbortSignal.timeout(15000) });
        const data = await response.json();
        res.set('Cache-Control', 'no-store'); res.status(response.status).json(data);
      } catch { res.status(502).json({ error: '私人邀請服務暫時無法連線' }); }
    });
  }
}
