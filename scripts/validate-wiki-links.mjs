import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const wikiRoot = path.resolve(scriptDir, '..', 'wiki');

function collectMarkdown(dir, prefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectMarkdown(absolute, relative));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(relative);
  }
  return files;
}

const files = collectMarkdown(wikiRoot);
const slugs = new Set(
  files
    .filter((file) => !['index.md', 'AGENTS.md'].includes(path.basename(file)))
    .map((file) => file.replace(/\.md$/i, '')),
);
const broken = [];

for (const file of files) {
  if (path.basename(file) === 'AGENTS.md') continue;
  const source = fs.readFileSync(path.join(wikiRoot, file), 'utf8');
  const withoutCode = source.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const match of withoutCode.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const target = match[1].split('|', 1)[0].split('#', 1)[0].trim().replace(/\.md$/i, '');
    if (target && !slugs.has(target)) broken.push({ file, target });
  }
}

if (broken.length) {
  process.stderr.write('Broken Wiki links:\n');
  for (const item of broken) process.stderr.write(`  - ${item.file}: [[${item.target}]]\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Wiki link check passed: ${files.length} Markdown files, ${slugs.size} pages.\n`);
}
