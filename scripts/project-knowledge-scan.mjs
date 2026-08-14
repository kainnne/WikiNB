import crypto from 'node:crypto';
import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const configPath = path.join(projectRoot, 'config', 'project-knowledge-sources.json');
const stateDir = path.join(projectRoot, '.wikinb-sync');
const statePath = path.join(stateDir, 'project-source-state.json');
const writeState = process.argv.includes('--write-state');
const jsonOutput = process.argv.includes('--json');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const config = readJson(configPath, { sources: [] });
const previous = readJson(statePath, { files: {} });
const current = {};
const missing = [];
const repositories = {};

function gitBuffer(root, args) {
  try {
    return childProcess.execFileSync('git', ['-C', root, ...args], {
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

function gitOutput(root, args) {
  const output = gitBuffer(root, args);
  return output ? output.toString('utf8').trim() : null;
}

function worktreeFingerprint(root, status) {
  const hash = crypto.createHash('sha256').update(status);
  for (const args of [
    ['diff', '--no-ext-diff', '--binary', '--no-color'],
    ['diff', '--cached', '--no-ext-diff', '--binary', '--no-color'],
  ]) {
    const diff = gitBuffer(root, args);
    if (diff) hash.update(diff);
  }

  const untrackedOutput = gitBuffer(root, ['ls-files', '--others', '--exclude-standard', '-z']);
  const untracked = untrackedOutput
    ? untrackedOutput.toString('utf8').split('\0').filter(Boolean).sort()
    : [];
  for (const relativeFile of untracked) {
    const absoluteFile = path.resolve(root, relativeFile);
    if (!absoluteFile.startsWith(`${root}${path.sep}`)) continue;
    try {
      const stat = fs.statSync(absoluteFile);
      hash.update(`${relativeFile}\0${stat.size}\0${stat.mtimeMs}\0`);
    } catch {
      hash.update(`${relativeFile}\0missing\0`);
    }
  }
  return hash.digest('hex');
}

const discoveryRoot = path.resolve(projectRoot, config.discovery?.root || '..');
const ignoredProjects = new Set(config.discovery?.ignore || []);
const projects = fs
  .readdirSync(discoveryRoot, { withFileTypes: true })
  .filter((entry) => !entry.name.startsWith('.') && !ignoredProjects.has(entry.name))
  .filter((entry) => {
    if (entry.isDirectory()) return true;
    if (!entry.isSymbolicLink()) return false;
    try {
      return fs.statSync(path.join(discoveryRoot, entry.name)).isDirectory();
    } catch {
      return false;
    }
  })
  .map((entry) => entry.name)
  .sort();

for (const source of config.sources || []) {
  const sourceRoot = path.resolve(projectRoot, source.root);
  const head = gitOutput(sourceRoot, ['rev-parse', 'HEAD']);
  if (head) {
    const status = gitOutput(sourceRoot, ['status', '--porcelain=v1', '--untracked-files=all']) || '';
    repositories[source.id] = {
      source: source.id,
      head,
      worktreeSha256: worktreeFingerprint(sourceRoot, status),
      changedEntryCount: status ? status.split('\n').length : 0,
    };
  }
  for (const relativeFile of source.files || []) {
    const absoluteFile = path.resolve(sourceRoot, relativeFile);
    const expectedPrefix = `${sourceRoot}${path.sep}`;
    if (absoluteFile !== sourceRoot && !absoluteFile.startsWith(expectedPrefix)) {
      throw new Error(`Source path escapes its root: ${source.id}/${relativeFile}`);
    }
    const key = `${source.id}:${relativeFile}`;
    if (!fs.existsSync(absoluteFile)) {
      missing.push(key);
      continue;
    }
    const stat = fs.statSync(absoluteFile);
    if (!stat.isFile()) {
      missing.push(key);
      continue;
    }
    current[key] = {
      source: source.id,
      file: relativeFile,
      sha256: hashFile(absoluteFile),
      size: stat.size,
    };
  }
}

const added = [];
const changed = [];
for (const [key, value] of Object.entries(current)) {
  if (!previous.files?.[key]) added.push(value);
  else if (previous.files[key].sha256 !== value.sha256) changed.push(value);
}
const removed = Object.entries(previous.files || {})
  .filter(([key]) => !current[key])
  .map(([, value]) => value);
const previousProjects = new Set(previous.projects || []);
const currentProjects = new Set(projects);
const addedProjects = projects.filter((name) => !previousProjects.has(name));
const removedProjects = [...previousProjects].filter((name) => !currentProjects.has(name)).sort();
const repositoryChanges = [];
for (const [key, value] of Object.entries(repositories)) {
  const old = previous.repositories?.[key];
  if (!old || old.head !== value.head || old.worktreeSha256 !== value.worktreeSha256) {
    repositoryChanges.push(value);
  }
}

const result = {
  hasChanges: Boolean(
    added.length ||
      changed.length ||
      removed.length ||
      missing.length ||
      addedProjects.length ||
      removedProjects.length ||
      repositoryChanges.length
  ),
  counts: {
    tracked: Object.keys(current).length,
    added: added.length,
    changed: changed.length,
    removed: removed.length,
    missing: missing.length,
    projects: projects.length,
    addedProjects: addedProjects.length,
    removedProjects: removedProjects.length,
    repositoryChanges: repositoryChanges.length,
  },
  added,
  changed,
  removed,
  missing,
  addedProjects,
  removedProjects,
  repositoryChanges,
};

if (writeState) {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(
    statePath,
    `${JSON.stringify(
      {
        version: 2,
        updatedAt: new Date().toISOString(),
        projects,
        repositories,
        files: current,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  const printGroup = (label, items) => {
    if (!items.length) return;
    process.stdout.write(`${label} (${items.length})\n`);
    for (const item of items) {
      const name =
        typeof item === 'string'
          ? item
          : item.file
            ? `${item.source}:${item.file}`
            : item.source;
      process.stdout.write(`  - ${name}\n`);
    }
  };
  process.stdout.write(
    `WikiNB project source scan: ${result.counts.tracked} tracked; ` +
      `${result.counts.added} added, ${result.counts.changed} changed, ` +
      `${result.counts.removed} removed, ${result.counts.missing} missing; ` +
      `${result.counts.addedProjects} new project(s), ` +
      `${result.counts.repositoryChanges} repository change(s).\n`,
  );
  printGroup('Added', added);
  printGroup('Changed', changed);
  printGroup('Removed', removed);
  printGroup('Missing', missing);
  printGroup('New projects', addedProjects);
  printGroup('Removed projects', removedProjects);
  printGroup('Repository changes', repositoryChanges);
  if (writeState) process.stdout.write('Baseline state updated.\n');
}
