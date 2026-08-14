const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_DIR = path.resolve(__dirname, '..');
const RECS_PATH = path.join(REPO_DIR, 'recommendations.json');

const DEFAULT_KEYWORDS = ['中原大學','通識課','推薦'];

function loadRecs() {
  const raw = fs.readFileSync(RECS_PATH, 'utf8');
  return JSON.parse(raw);
}

function normalizeText(s) {
  return (s||'').toString().toLowerCase().replace(/[^\w\s\u4e00-\u9fff]+/g, ' ').replace(/\s+/g,' ').trim();
}

function tokenize(s) {
  const t = normalizeText(s);
  if (!t) return [];
  return Array.from(new Set(t.split(' ').filter(Boolean)));
}

function getTrigrams(s) {
  const t = normalizeText(s).replace(/\s+/g, '');
  const trigrams = new Set();
  for (let i=0;i+3<=t.length;i++) trigrams.add(t.slice(i,i+3));
  return trigrams;
}

function diceCoefficient(aSet, bSet) {
  if (!aSet.size || !bSet.size) return 0;
  let inter = 0;
  aSet.forEach(x => { if (bSet.has(x)) inter++; });
  return (2*inter) / (aSet.size + bSet.size);
}

function scoreRecommendation(item, keywords) {
  const hay = [item.name, item.comment, item.source, item.teacher, item.code].filter(Boolean).join(' ');
  const hayTokens = new Set(tokenize(hay));
  const kwTokens = new Set(keywords.flatMap(k=>tokenize(k)));

  const overlap = diceCoefficient(hayTokens, kwTokens);
  const nameTris = getTrigrams(item.name||'');
  const kwTris = getTrigrams(keywords.join(' '));
  const triSim = diceCoefficient(nameTris, kwTris);

  let boost = 0;
  const teacher = (item.teacher||'').toLowerCase();
  const code = (item.code||'').toLowerCase();
  for (const k of keywords) {
    const kk = k.toLowerCase();
    if (teacher && teacher.includes(kk)) boost += 0.15;
    if (code && code.includes(kk)) boost += 0.25;
  }
  if (item.verified) boost += 0.05;

  return Math.min(1, overlap*0.6 + triSim*0.35 + boost);
}

function buildItouchSearchUrl(item) {
  const base = 'https://itouch.cycu.edu.tw/active_system/CourseQuerySystem/spa/#/courseQuery';
  const q = encodeURIComponent(item.name || item.comment || '');
  return `${base}?courseName=${q}`;
}

function matchAndReorder(recs, keywords) {
  const scored = recs.map(r => ({ r, score: scoreRecommendation(r, keywords) }));
  const MIN_SCORE = 0.12;
  const matches = scored.filter(s => s.score >= MIN_SCORE).sort((a,b)=>b.score-a.score);
  const matched = matches.map(m => { m.r._matchScore = m.score; m.r._itouchLink = buildItouchSearchUrl(m.r); return m.r; });
  const rest = recs.filter(r => !matched.includes(r));
  return { matched, rest, reordered: matched.concat(rest) };
}

function writeUpdated(reordered) {
  const ts = new Date().toISOString().replace(/[:.]/g,'').replace('T','-').slice(0,15);
  const outName = `recommendations.updated.${ts}.json`;
  const outPath = path.join(REPO_DIR, outName);
  fs.writeFileSync(outPath, JSON.stringify(reordered, null, 2), 'utf8');
  return outPath;
}

function gitCommitAndPush(filePath) {
  const repoRoot = path.resolve(REPO_DIR, '..'); // repo was initialized at outputs/
  try {
    console.log('Staging', path.relative(repoRoot, filePath));
    execSync(`git add "${filePath}"`, { cwd: repoRoot, stdio: 'inherit' });
    const msg = `chore: demo update recommendations (${path.basename(filePath)})`;
    execSync(`git commit -m "${msg}"`, { cwd: repoRoot, stdio: 'inherit' });
    execSync(`git push origin main`, { cwd: repoRoot, stdio: 'inherit' });
    console.log('Git commit and push completed.');
  } catch (e) {
    console.error('Git commit/push failed:', e.message);
  }
}

function main() {
  console.log('Demo autoLoadRecs — using keywords:', DEFAULT_KEYWORDS.join(', '));
  const recs = loadRecs();
  const { matched, rest, reordered } = matchAndReorder(recs, DEFAULT_KEYWORDS);

  console.log(`Found ${matched.length} matched items, ${rest.length} others.`);
  if (matched.length) {
    console.log('--- Matched items ---');
    matched.forEach((m,i)=>{
      console.log(`${i+1}. ${m.code} | ${m.name} | ${m.teacher} | ${m.source}`);
    });
  }

  const out = writeUpdated(reordered);
  console.log('Wrote updated recommendations to:', out);
  // attempt to commit and push the updated file to the repo root
  gitCommitAndPush(out);
}

main();
