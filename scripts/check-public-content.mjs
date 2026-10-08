import fs from 'node:fs';
import path from 'node:path';
import { isPrivateMarkdown } from '../src/lib/content-visibility.js';
const forbidden = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) scan(p);
    else if (/\.md$/i.test(p) && isPrivateMarkdown(fs.readFileSync(p, 'utf8'))) forbidden.push(p);
  }
}
scan('wiki'); scan('public');
if (forbidden.length) throw new Error(`Private Markdown must be moved out of public build paths: ${forbidden.join(', ')}`);
if (fs.existsSync('public/study/azure-ai-901')) throw new Error('Azure source downloads cannot be published');
console.log('OK: public Wiki/assets contain no marked private documents or Azure source downloads');
