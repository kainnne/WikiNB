import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { handlePrivateStudy, randomInviteCode, gradeAnswer, questionForLearner, privateStudyRate } from '../worker/private-study.js';
import { isPrivateMarkdown } from '../src/lib/content-visibility.js';
import worker from '../worker/index.js';

const dir = mkdtempSync(join(tmpdir(), 'wikinb-study-test-'));
const file = join(dir, 'db.sqlite');
const python = `import sqlite3,json,sys
p=json.load(sys.stdin);c=sqlite3.connect(p['file']);c.row_factory=sqlite3.Row
if p.get('script'): c.executescript(p['query']);rows=[]
else:
 r=c.execute(p['query'],p['args']);rows=[dict(x) for x in r.fetchall()]
c.commit();print(json.dumps({'rows':rows,'meta':{'changes':c.total_changes}}));c.close()`;
let queries = [];
function sql(query, args = [], script = false) {
  queries.push(query);
  const r = spawnSync('python3', ['-c', python], { input: JSON.stringify({ file, query, args, script }), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
}
const DB = { prepare(query) {
  const statement = args => ({ async first() { return sql(query, args).rows[0] || null; }, async run() { return sql(query, args); } });
  return { ...statement([]), bind(...args) { return statement(args); } };
} };
const env = { DB, PRIVATE_STUDY_ADMIN_SECRET: 'test-admin-secret', TOKEN_SECRET: 'test-session-secret' };
let identity = 'learner@example.test', calls = 0, instruction = '', mode = 'ok', activeInvite;
const services = {
  guestSession: async r => r.headers.get('Authorization') === 'Bearer test-verified-session' ? { email: identity } : null,
  consumeRate: async () => ({ ok: true }),
  generate: async (_env, _email, prompt) => {
    calls++; instruction = prompt;
    if (mode === 'fail') return { error: 'provider unavailable', status: 502 };
    if (mode === 'revoke') sql('UPDATE private_study_invites SET revoked = 1 WHERE code_hash = ?', [activeInvite.id]);
    return { answer: '教學測試內容' };
  },
};
function req(path, body, token = 'test-verified-session') {
  return new Request('https://test.invalid/api/private-study/'+path, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: token ? 'Bearer '+token : '', 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
const call = (path, body, token) => handlePrivateStudy(req(path, body, token), env, services);
async function invite() { const r = await call('admin/invite', {}, env.PRIVATE_STUDY_ADMIN_SECRET); assert.equal(r.status, 200); return r.json(); }
const q = { id: 'fixture-q1', type: 'single', topic: '測試觀念', stem: '測試問題', options: [{ key: 'A', text: '測試選項甲' }, { key: 'B', text: '測試選項乙' }], decoded_answer: 'B', decoded_answer_parts: ['B'], clue: 'PRIVATE_CLUE_SENTINEL' };
try {
  sql(readFileSync(new URL('../worker/migrations/0004_private_study.sql', import.meta.url), 'utf8'), [], true);
  sql('CREATE TABLE rate_limits(rate_key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, count INTEGER NOT NULL)', [], true);
  for (const record of [q, { ...q, id: 'fixture-q2' }]) sql('INSERT INTO private_study_questions VALUES(?, ?)', [record.id, JSON.stringify(record)]);
  sql('INSERT INTO private_study_units VALUES(?, ?, ?)', ['U01', '測試單元', JSON.stringify({ questionIds: [q.id, 'fixture-q2'], overview: '單元重點', bookText: 'RAW_BOOK_SENTINEL' })]);
  for (let i=0; i<100; i++) { const code = randomInviteCode(); assert.match(code, /^[A-Z0-9]{6}$/); assert.match(code, /[A-Z]/); assert.match(code, /[0-9]/); }
  for (const source of ['visibility: private', 'visibility: "private" # comment', 'private: true']) assert.equal(isPrivateMarkdown('---\n'+source+'\n---\nsecret'), true);
  assert.equal(isPrivateMarkdown('---\nvisibility: public\n---\nbody'), false);
  assert.equal(questionForLearner(q).decoded_answer, undefined); assert.equal(questionForLearner(q).clue, undefined);
  assert.equal(gradeAnswer(q, 'b'), true); assert.equal(gradeAnswer(q, 'A'), false);
  assert.equal(gradeAnswer({type:'multiple',decoded_answer_parts:['A','C']},'C、A'), true);
  assert.equal(gradeAnswer({type:'tf_group',decoded_answer_parts:['是','否']},'Yes,No'), true);
  assert.equal(gradeAnswer({type:'matching',decoded_answer_parts:['甲','乙']},'乙、甲'), false);
  queries = []; assert.equal((await call('chat', {unit:'U01',action:'start'}, '')).status, 401); assert.equal(queries.length,0);
  assert.equal((await worker.fetch(req('chat', {}, 'forged-token'), env)).status,401);
  assert.equal((await call('chat',{unit:'U01',action:'start'})).status,403); assert.equal(calls,0);
  assert.equal(queries.some(x=>x.includes('FROM private_study_questions')),false);
  assert.equal((await call('admin/invite',{})).status,403);
  activeInvite = await invite(); assert.ok(Math.abs(activeInvite.expiresAt-Date.now()-3600000)<2000);
  const stored = sql('SELECT * FROM private_study_invites').rows[0]; assert.equal(stored.code_hash,activeInvite.id); assert.ok(!JSON.stringify(stored).includes(activeInvite.code));
  assert.equal((await call('redeem',{code:activeInvite.code})).status,200);
  assert.equal((await call('redeem',{code:activeInvite.code.toLowerCase()})).status,200);
  identity='other@example.test'; assert.equal((await call('redeem',{code:activeInvite.code})).status,403);
  identity='learner@example.test';
  assert.equal((await call('document')).status,404,'Verified invite never enables raw documents');
  assert.equal((await call('chat',{unit:'U01',action:'answer',answer:'B'})).status,409);
  let r = await call('chat',{unit:'U01',action:'start'}); assert.equal(r.status,200); let data=await r.json(); assert.equal(data.questionId,q.id);
  assert.doesNotMatch(instruction,/decoded_answer|PRIVATE_CLUE_SENTINEL|RAW_BOOK_SENTINEL/);
  assert.doesNotMatch(data.answer,/PRIVATE_CLUE_SENTINEL|來源答案/);
  assert.equal((await call('chat',{unit:'U01',action:'next',questionId:q.id})).status,400);
  assert.equal((await call('chat',{unit:'U01',action:'answer',questionId:'stale',answer:'B'})).status,409);
  r=await call('chat',{unit:'U01',action:'answer',questionId:q.id,answer:'b'}); assert.equal(r.status,200); assert.match((await r.json()).answer,/✓ 答案正確/);
  mode='fail'; assert.equal((await call('chat',{unit:'U01',action:'next',questionId:q.id})).status,502);
  assert.equal(sql('SELECT question_index FROM private_study_progress').rows[0].question_index,0,'Failed model request cannot skip a question');
  mode='ok'; r=await call('chat',{unit:'U01',action:'next',questionId:q.id}); assert.equal(r.status,200); assert.equal((await r.json()).questionId,'fixture-q2');
  assert.equal((await call('chat',{unit:'U01',action:'answer',questionId:q.id,answer:'B'})).status,409);
  mode='revoke'; assert.equal((await call('chat',{unit:'U01',action:'ask',questionId:'fixture-q2',message:'解釋'})).status,403,'Revocation during model call prevents content returning');
  queries=[]; assert.equal((await call('chat',{unit:'U01',action:'start'})).status,403); assert.equal(queries.some(x=>x.includes('FROM private_study_questions')),false);
  activeInvite=await invite(); sql('UPDATE private_study_invites SET expires_at=? WHERE code_hash=?',[Date.now()-1,activeInvite.id]); assert.equal((await call('redeem',{code:activeInvite.code})).status,403);
  const rates=await Promise.all(Array.from({length:8},()=>privateStudyRate(env,'race-test',2,60000))); assert.equal(rates.filter(x=>x.ok).length,2,'Atomic limiter bounds parallel guesses');
  console.log('OK: private study real SQL, admin/guest isolation, TTL, single use, revoke, no raw access, answer gating, progress and atomic limits');
} finally { rmSync(dir,{recursive:true,force:true}); }
