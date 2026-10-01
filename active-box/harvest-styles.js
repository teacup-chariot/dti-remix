'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');
const { findCrop } = require('./match');
const C = require('./crops');

const DIR = process.env.ABOX_CACHE || __dirname;
const IMG = process.env.ABOX_IMG || path.join(require('os').tmpdir(), 'abox-img');
const BULK = process.env.ABOX_BULK || path.join(DIR, '..', 'bulk_clean.js');
const STYLE_INDEX = process.env.ABOX_STYLE_INDEX || path.join(DIR, '..', 'style-index.json');
const PROBLEMS = process.env.ABOX_PROBLEMS || '';
const KEY = process.env.STYLE_SINK_KEY || '';
const STYLE = String(process.env.ABOX_STYLE || '').trim();
const LEDGER = path.join(DIR, 'harvested.json');
const CROPS = path.join(DIR, 'style-crops.json');
const OLD_ROSTER = path.join(DIR, 'style-roster.json');
const SINK = 'https://dtr-style-sink.dti-remix.workers.dev/list';
const MIN_SCORE = 0.5;
const INSTANT_WINDOW_MS = 6 * 3600 * 1000;

const problems = [];
function flushProblems() {
  if (PROBLEMS && problems.length) fs.appendFileSync(PROBLEMS, problems.map(p => '- ' + p).join('\n') + '\n');
}
function fail(msg) {
  problems.push(msg);
  flushProblems();
  console.error('x ' + msg);
  process.exit(1);
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch (_) { return null; } };
const readJson = (p, dflt) => { const t = readText(p); if (t == null) return dflt; try { return JSON.parse(t); } catch (_) { return dflt; } };

function httpReq(url, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: opts.method || 'GET', headers: opts.headers || {} }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: body }));
    });
    r.on('error', reject);
    r.setTimeout(15000, () => { r.destroy(new Error('timeout')); });
    if (opts.body) r.write(opts.body);
    r.end();
  });
}

async function readInbox() {
  if (!KEY) fail('The STYLE_SINK_KEY secret is not set on this repository, so the inbox cannot be read.');
  let r;
  try { r = await httpReq(SINK + '?key=' + encodeURIComponent(KEY)); } catch (e) { fail('Could not reach the style inbox: ' + e.message); }
  if (r.status === 403) fail('The style inbox refused the password (403). STYLE_SINK_KEY on GitHub and LIST_KEY in Cloudflare must be the same.');
  if (r.status !== 200) fail('The style inbox answered HTTP ' + r.status + '.');
  try { return JSON.parse(r.text) || {}; } catch (_) { fail('The style inbox sent something that is not JSON.'); }
  return {};
}

function readTable(name) {
  const src = readText(BULK);
  if (src == null) fail('Could not read the shipped script at ' + path.basename(BULK) + '.');
  const m = src.match(new RegExp('const ' + name + ' = (\\{[^;]*\\});'));
  if (!m) return null;
  return new Function('return (' + m[1] + ')')();
}

async function currentStyleOf(name) {
  const form = new URLSearchParams();
  form.set('name', name);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await httpReq('https://impress.openneo.net/pets/load', {
        method: 'POST', body: form.toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
      const loc = (r.headers && r.headers.location) || '';
      const q = new URLSearchParams(loc.split('?')[1] || '');
      if (!loc || !q.get('name')) { if (attempt) { console.log('  ! DTI would not load ' + C.petTag(name)); return null; } await sleep(1500); continue; }
      return q.get('style') || '';
    } catch (e) {
      if (attempt) { console.log('  ! could not reach DTI for ' + C.petTag(name) + ': ' + e.message); return null; }
      await sleep(1500);
    }
  }
  return null;
}

const imgName = (tag, styleId, sz) => tag.replace('#', '-') + '-s' + styleId + '-' + sz + '.png';

(async () => {
  const now = Date.now();
  const mode = STYLE ? 'instant' : 'nightly';
  if (STYLE && !/^\d{1,8}$/.test(STYLE)) fail('The style number this run was started with is not a number.');

  const shipped = readTable('OE_ABOX_BY_STYLE');
  if (!shipped) fail('Could not find the measured-style table in the shipped script.');
  const shippedSib = readTable('OE_ABOX_BY_STYLE_SIB') || {};
  const ledger = readJson(LEDGER, {});
  const index = readJson(STYLE_INDEX, null);
  if (!index) problems.push('Could not read style-index.json, so no sibling styles were filled in.');
  const bodies = C.bodiesFromStyleIndex(index);

  const inbox = await readInbox();
  C.wakeProblems(inbox, now).forEach(p => problems.push(p));

  let names = mode === 'instant' ? C.instantPetNames(inbox, STYLE, now, INSTANT_WINDOW_MS) : C.petNamesFromInbox(inbox);
  const oldRoster = readJson(OLD_ROSTER, null);
  if (oldRoster && mode === 'nightly') {
    Object.keys(oldRoster).forEach(k => {
      const n = String((oldRoster[k] && oldRoster[k].name) || k).trim();
      if (/^[a-zA-Z0-9_\- ]{1,30}$/.test(n) && !names[n.toLowerCase()]) names[n.toLowerCase()] = n;
    });
  }
  const keys = Object.keys(names);
  console.log(mode + ' run' + (STYLE ? ' for style ' + STYLE : '') + ': ' + keys.length + ' pet(s) to ask about, '
    + Object.keys(inbox).length + ' style(s) in the inbox, ' + Object.keys(shipped).length + ' measured in the shipped script, '
    + Object.keys(ledger).length + ' in the ledger.');

  const wearing = {};
  let answered = 0;
  for (const k of keys) {
    const cur = await currentStyleOf(names[k]);
    if (cur !== null) { answered++; wearing[k] = { name: names[k], style: cur }; }
    await sleep(400);
  }
  if (keys.length && !answered) problems.push('Dress to Impress did not answer for any pet, so nothing could be checked.');

  const todo = C.pickCandidates(wearing, shipped, ledger, inbox);
  console.log('wearing an unmeasured style now: ' + todo.length + ' (of ' + answered + ' pet(s) that answered).');
  if (mode === 'instant' && !todo.some(t => t.styleId === STYLE) && !(shipped[STYLE] || (ledger[STYLE] && !ledger[STYLE].held))) {
    console.log('  the pet sent in with style ' + STYLE + ' is no longer wearing it.');
  }

  if (todo.length) {
    if (!fs.existsSync(IMG)) fs.mkdirSync(IMG, { recursive: true });
    const jobs = [];
    todo.forEach(t => {
      const tag = C.petTag(t.pet);
      [1, 4].forEach(sz => jobs.push({
        url: 'https://pets.neopets.com/cpn/' + encodeURIComponent(t.pet.toLowerCase()) + '/1/' + sz + '.png',
        out: imgName(tag, t.styleId, sz),
        label: tag + ' style ' + t.styleId + ' size ' + sz,
      }));
    });
    const jobsFile = path.join(IMG, 'jobs.json');
    fs.writeFileSync(jobsFile, JSON.stringify(jobs));
    const r = spawnSync('node', [path.join(__dirname, 'fetch-images.js'), jobsFile], { stdio: 'inherit', env: Object.assign({}, process.env, { ABOX_IMG: IMG }) });
    if (r.status !== 0) problems.push('Neopets did not send every pet picture (the lines above say which). Those styles were not measured.');

    todo.forEach(t => {
      const tag = C.petTag(t.pet);
      const a = path.join(IMG, imgName(tag, t.styleId, 1));
      const f = path.join(IMG, imgName(tag, t.styleId, 4));
      const have = (p) => fs.existsSync(p) && fs.statSync(p).size > 0;
      if (!have(a) || !have(f)) { console.log('  ! style ' + t.styleId + ' (' + tag + '): pictures missing'); return; }
      let res;
      try { res = findCrop(a, f); } catch (e) { problems.push('Could not measure style ' + t.styleId + ': ' + e.message); return; }
      if (res.failed) { problems.push('Could not measure style ' + t.styleId + ': ' + res.failed); return; }
      const box = [+res.cx.toFixed(4), +res.cy.toFixed(4)];
      if (Math.abs(res.size - 1 / 3) > 0.01) box.push(+res.size.toFixed(4));
      const entry = { box: box, score: +res.score.toFixed(3), via: t.submitted ? 'submitted' : 'spotted', ts: new Date(now).toISOString().slice(0, 10) };
      if (res.score < MIN_SCORE) entry.held = 'low NCC ' + res.score.toFixed(3);
      ledger[t.styleId] = entry;
      console.log('  style ' + t.styleId + ' (' + tag + ') -> [' + box.join(', ') + '] score ' + entry.score + (entry.held ? '  HELD, low confidence, not published' : ''));
      const d = shippedSib[t.styleId];
      if (d) {
        const off = Math.max(Math.abs(d[0] - box[0]), Math.abs(d[1] - box[1]), Math.abs((d[2] || 1 / 3) - (box[2] || 1 / 3)));
        console.log('    ' + (off <= 0.011 ? 'confirms' : '!! DISAGREES with') + ' the sibling-derived box (off by ' + off.toFixed(4) + ')');
      }
    });
  }

  const ledgerOut = C.stripLedger(ledger);
  const ledgerText = C.toFileText(ledgerOut);
  if (readText(LEDGER) !== ledgerText) { fs.writeFileSync(LEDGER, ledgerText); console.log('ledger updated.'); }
  const crops = C.buildCropsFile({ ledger: ledgerOut, shipped: shipped, bodies: bodies });
  const cropsText = C.toFileText(crops);
  if (readText(CROPS) !== cropsText) { fs.writeFileSync(CROPS, cropsText); console.log('style-crops.json updated.'); }
  console.log('published: ' + Object.keys(crops.measured).length + ' measured, ' + Object.keys(crops.siblings).length + ' sibling style(s).');
  if (oldRoster && mode === 'nightly') { fs.unlinkSync(OLD_ROSTER); console.log('removed the old public pet list (style-roster.json).'); }

  flushProblems();
  if (problems.length) console.log('\nproblems (this run will be marked as failed):\n' + problems.map(p => '- ' + p).join('\n'));
})().catch(e => fail('The harvest crashed: ' + (e && e.message)));
