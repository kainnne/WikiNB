import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';

// Originals are written ONLY to the explicitly supplied private output directory.
const { values } = parseArgs({ options: { source: { type: 'string' }, out: { type: 'string' } } });
if (!values.source || !values.out) throw new Error('Usage: --source <question bank> --out <Git-ignored private directory>');
const source = path.resolve(values.source), out = path.resolve(values.out);
const repo = path.resolve(new URL('..', import.meta.url).pathname);
assert.ok(out.startsWith(path.join(repo, 'AGENTS_Intro', 'project-local') + path.sep), 'Output must be in the ignored project-local area');
const json = relative => JSON.parse(fs.readFileSync(path.join(source, relative), 'utf8'));
const catalog = json('index/catalog.json'), units = json('index/units.json'), questions = json('questions/exports/all-unique.json');
assert.equal(catalog.supplementary_teaching_materials_included, false);
assert.equal(questions.length, catalog.counts.unique_questions);
assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
const questionIds = new Set(questions.map(q => q.id));
const unitData = units.map(unit => {
  const pool = json(unit.question_data_path);
  assert.equal(pool.length, unit.pool_count);
  assert.ok(pool.every(q => questionIds.has(q.id)));
  return { unit: unit.unit, title: unit.name, summary: unit.summary, key_concepts: unit.key_concepts, retrieval_keywords: unit.retrieval_keywords, aliases: unit.aliases, questionIds: pool.map(q => q.id), author: catalog.author, snapshot: catalog.captured_date };
});
assert.equal(unitData.reduce((n,u) => n+u.questionIds.length,0), catalog.counts.question_occurrences);
const prefix = 'Learning/azure-ai-901';
const mapping = new Map([
  ['README.md', prefix], ['index/unit-outline.md', prefix+'/unit-outline'],
  ['questions/by-topic/README.md', prefix+'/topics'], ['study/question-index.md', prefix+'/question-index'],
  ['questions/collections/unique-practice.md', prefix+'/all/practice'], ['questions/collections/unique-review.md', prefix+'/all/review'],
]);
for (const unit of units) {
  for (const [file, suffix] of [['README.md','overview'],['practice.md','practice'],['review.md','review']]) mapping.set(`units/${unit.unit}/${file}`, `${prefix}/${unit.unit.toLowerCase()}/${suffix}`);
}
for (const file of fs.readdirSync(path.join(source, 'questions/by-topic')).filter(file => /^\d+\.md$/.test(file))) mapping.set('questions/by-topic/'+file, prefix+'/topics/'+file.replace(/\.md$/, ''));
fs.mkdirSync(out, { recursive: true });
const titleCatalog = [];
function save(slug, title, body) {
  const destination = path.join(out, 'wiki', slug+'.md'); fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination, `---\ntitle: ${JSON.stringify(title)}\ntype: note\nstatus: active\nvisibility: private\ndate: ${catalog.captured_date}\n---\n\n${body.trim()}\n`);
  titleCatalog.push({slug,title});
}
for (const [relative,slug] of mapping) {
  const original = fs.readFileSync(path.join(source,relative),'utf8');
  const title = original.match(/^#\s+(.+)$/m)?.[1] || slug.split('/').at(-1);
  const body = original.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (all,label,target) => {
    if (/^(?:https?:|mailto:|#)/i.test(target)) return all;
    const [location, fragment] = target.split('#');
    const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(relative),location));
    const destination = mapping.get(normalized);
    return destination ? `[${label}](/private-study/?article=${encodeURIComponent(destination)}${fragment ? '#'+fragment : ''})` : `${label}（私人索引資料，不提供網頁下載）`;
  });
  save(slug,title,body);
}
save(prefix+'/tutor-prompt', 'Azure AI-901 題庫問答提示', `# Azure AI-901 題庫問答提示

先讀私人來源的 index/units.json 與 index/unit-outline.md，以新標題、簡述、概念及關鍵字定位單元；U1 等別名轉為 U01。

優先呈現完整原題、選項、題型、題號與必要作答數量。沒有指定單元才從 U01 開始；可以指定單元、概念或題號，不強制從第一課走完整個課程。先作答的練習，等待回答後才給來源答案與原判題線索。

使用者直接問題意、觀念或選項差異時，針對這題說明，不要求先讀老師教材，也不自動加一段課程或變形題。AI 補充解析與題目原 clue 分開，沒有教材、PPT 或额外教學筆記可讀，不聲稱已讀過。

584 個唯一題號、797 筆單元紀錄，保留各單元題序；U10 的 208 題不是全部題庫。需要接續時附單元、題號與下一步摘要；私人 Codex 不自動寫入或公開學習紀錄。

非 Microsoft 官方題庫。來源核對不代表官方事實審查；最新服務、SDK 或考試資訊按需要查官方文件。
`);
const quote = value => "'"+String(value).replaceAll("'","''")+"'";
const sql = questions.map(q => `INSERT OR REPLACE INTO private_study_questions(question_id,data) VALUES(${quote(q.id)},${quote(JSON.stringify(q))});`);
for (const unit of unitData) sql.push(`INSERT OR REPLACE INTO private_study_units(unit_id,title,data) VALUES(${quote(unit.unit)},${quote(unit.title)},${quote(JSON.stringify(unit))});`);
fs.writeFileSync(path.join(out,'private-bank.sql'),sql.join('\n')+'\n');
fs.writeFileSync(path.join(repo,'config/private-study-catalog.json'),JSON.stringify(titleCatalog,null,2)+'\n');
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({ schemaVersion:catalog.schema_version, source, privateOnly:true, questionCount:questions.length, unitOccurrences:catalog.counts.question_occurrences, titleCount:titleCatalog.length, includesTeacherMaterials:false },null,2)+'\n');
console.log(`Prepared private bank: ${questions.length} questions, ${unitData.length} units, ${titleCatalog.length} title-only catalog entries; no teacher materials`);
