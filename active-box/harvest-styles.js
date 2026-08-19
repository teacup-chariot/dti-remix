// Harvest Active-Box crops for Pet Styles — one command, no arguments needed.
//
//   node harvest-styles.js                 poll the sink + the roster, measure, WRITE bulk.js
//   node harvest-styles.js --no-apply      same, but stop at the ledger (unattended/scheduled runs)
//   node harvest-styles.js --apply-only    skip the network, just fold the ledger into bulk.js
//   node harvest-styles.js pairs.json      legacy: a /list dump, or the gear's exported style log
//   node harvest-styles.js discord.txt     legacy: pasted Discord pings
//   node harvest-styles.js --url "<u>"     legacy: an explicit /list address
//   node harvest-styles.js --pet "<name>" ask about ONE pet (a submission for it just landed)
//
// WHY IT POLLS A ROSTER. A style can only be measured while some pet is WEARING it — the crop comes
// out of that pet's live render. Submitters cycle styles, so a submitted pair is measurable for a
// few days and then goes quiet; a single manual harvest catches whatever happens to be equipped that
// minute and files the rest as "stale". So this keeps a ROSTER of every pet name we have ever seen
// (cache/style-roster.json) and, on every run, asks DTI what each of them is wearing RIGHT NOW:
//   · a submitted pair that verifies  → measure it (the original path)
//   · ANY unmeasured style on a roster pet → measure it too, submitted or not. Free coverage: the
//     pet is demonstrably wearing it, which is the whole verification the sink performs.
// Everything measured lands in cache/harvested.json (the ledger) with its pet, score and date, so a
// capture is never lost between runs — the perishable half is the render, not the paste.
//
// TRAFFIC. Only two hosts, both already in the pipeline: impress.openneo.net /pets/load (DTI's own
// server-side pet load — the same check the sink worker runs) and pets.neopets.com renders, fetched
// through the real installed Chrome by fetch-images.js because that host 403s everything else.
// Read-only GETs, throttled, disk-cached. ⛔ The userscript still never originates either (10.649.4
// veto stands) — this is build-time tooling on one machine.
//
// Output conventions match emit-table.js: [cx, cy] toFixed(4), size appended only when it deviates
// from the ⅓ standard by > 0.01. --apply rewrites the OE_ABOX_BY_STYLE line in bulk.js in place and
// re-parses the file; low-confidence crops (NCC < 0.5) are HELD in the ledger, never applied blind.
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');
const { findCrop } = require('./match');

// Paths are env-overridable so the SAME script runs on the nightly GitHub runner, where the layout is
// flat (active-box/ at the repo root) and the only build to read is the shipped bulk_clean.js.
const CACHE = process.env.ABOX_CACHE || path.join(__dirname, 'cache');
const IMG = path.join(CACHE, 'img');
const BULK = process.env.ABOX_BULK || path.join(__dirname, '..', '..', 'bulk.js');
const JOBS = path.join(CACHE, 'jobs-harvest.json');
const ROSTER = path.join(CACHE, 'style-roster.json');
const LEDGER = path.join(CACHE, 'harvested.json');
const LOG = path.join(CACHE, 'harvest-log.md');
const SINK = 'https://dtr-style-sink.dti-remix.workers.dev/list';
const STD_SIZE = 1 / 3;
const MIN_SCORE = 0.5;

const argv = process.argv.slice(2);
const has = (f) => argv.indexOf(f) >= 0;
const APPLY = !has('--no-apply');
const APPLY_ONLY = has('--apply-only');
// a positional arg is a file; the values that FOLLOW --url/--pet are not (that bug ate a pet name)
const VALUED = ['--url', '--pet'];
const fileArg = argv.filter((a, i) => a[0] !== '-' && VALUED.indexOf(argv[i - 1]) < 0)[0] || null;
// --pet "<name>": a submission for this pet just landed, so ask about IT and nobody else. The
// nightly run sweeps the whole roster; a submission-triggered run has one pet worth asking about and
// a live capture window measured in minutes, so it skips the other fourteen /pets/load calls.
const ONLY_PET = (has('--pet') ? String(argv[argv.indexOf('--pet') + 1] || '') : '').trim().toLowerCase();

if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

function fail(msg) { console.error('x ' + msg); process.exit(1); }
const readJson = (p, dflt) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return dflt; } };
const writeJson = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 1));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Node 14-compatible mini-fetch (this machine has no global fetch): resolves {status, headers, text}
// WITHOUT following redirects — we need the Location header itself.
function httpReq(url, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const r = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: opts.method || 'GET',
      headers: opts.headers || {},
    }, (res) => {
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

// ── 1. submissions: the sink by default, or any legacy input ─────────────────────────────────
async function readPairs() {
  let text = '';
  if (has('--url')) {
    const url = argv[argv.indexOf('--url') + 1];
    if (!url) fail('--url needs the /list address');
    const r = await httpReq(url);
    if (r.status !== 200) fail('/list returned HTTP ' + r.status + (r.status === 403 ? ' — wrong LIST_KEY?' : ''));
    text = r.text;
  } else if (fileArg) {
    if (!fs.existsSync(fileArg)) fail('no such file: ' + fileArg);
    text = fs.readFileSync(fileArg, 'utf8');
  } else {
    const r = await httpReq(SINK).catch(e => ({ status: 0, text: e.message }));
    if (r.status !== 200) { console.log('! sink unreachable (' + (r.status || r.text) + ') — polling the roster only'); return { pairs: {}, meas: {} }; }
    text = r.text;
  }
  const pairs = {}; // styleId -> petName
  const meas = {};  // styleId -> {cx, cy, size, score} (client-measured; dormant since the 10.649.4 veto)
  const t = text.trim();
  if (t.startsWith('{')) {
    const j = JSON.parse(t);
    Object.keys(j).forEach(id => {
      const v = j[id];
      // sink entry {petName,…}, bare {"id":"pet"}, or the gear's exported log {"id":{name,ts}}
      const nm = typeof v === 'string' ? v : (v && (v.petName || v.name));
      if (!/^\d{1,8}$/.test(id) || !nm) return;
      pairs[id] = String(nm).trim();
      if (v && typeof v === 'object' && typeof v.cx === 'number' && typeof v.cy === 'number' && typeof v.size === 'number') {
        meas[id] = { cx: v.cx, cy: v.cy, size: v.size, score: (typeof v.score === 'number' ? v.score : null) };
      }
    });
  } else {
    // Discord ping format (bold markers survive a copy-paste as **) — pair only, never coords
    const re = /style\s*\*\*(\d{1,8})\*\*.*?pet\s*\*\*([^*]+)\*\*/gi;
    let m;
    while ((m = re.exec(t))) pairs[m[1]] = m[2].trim();
  }
  return { pairs, meas };
}

// ── 2. the shipped table (already-measured styles are skipped and kept in the merge) ─────────
function readCurrentTable() {
  const src = fs.readFileSync(BULK, 'utf8');
  const m = src.match(/const OE_ABOX_BY_STYLE = (\{[^;]*\});/);
  if (!m) fail('could not find OE_ABOX_BY_STYLE in bulk.js');
  return new Function('return (' + m[1] + ')')();
}
// The sibling-derived table (derive-siblings.js). A direct measurement of a style we had only
// DERIVED is the one real test of that derivation — so compare them and say so either way.
function readSibTable() {
  const m = fs.readFileSync(BULK, 'utf8').match(/const OE_ABOX_BY_STYLE_SIB = (\{[^;]*\});/);
  return m ? new Function('return (' + m[1] + ')')() : {};
}
function checkAgainstDerived(styleId, box, sib) {
  const d = sib[styleId];
  if (!d) return;
  const off = Math.max(Math.abs(d[0] - box[0]), Math.abs(d[1] - box[1]), Math.abs((d[2] || 1 / 3) - (box[2] || 1 / 3)));
  if (off <= 0.011) console.log('    ^ CONFIRMS the sibling derivation for ' + styleId + ' (off by ' + off.toFixed(4) + ')');
  else console.log('    ^ !! DISAGREES with the derived box for ' + styleId + ': derived ['
    + d.join(', ') + '] vs measured [' + box.join(', ') + '], off by ' + off.toFixed(4)
    + ' — the box may NOT follow the body for styles. Re-check derive-siblings.js before shipping.');
}

const safe = (nm) => nm.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
// image cache is keyed by (pet, style): a pet's cpn render is its CURRENT look, which changes —
// a name-only cache would happily re-measure last week's style.
const imgFile = (nm, styleId, sz) => path.join(IMG, 'petname-' + safe(nm) + '-s' + styleId + '-1-' + sz + '.png');

// What style is this pet wearing RIGHT NOW? (Same check the sink worker runs at submit time —
// impress.openneo.net is curl-friendly, no session needed.) '' = no style, null = ask again later.
async function currentStyleOf(name) {
  const form = new URLSearchParams();
  form.set('name', name);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await httpReq('https://impress.openneo.net/pets/load', {
        method: 'POST', body: form.toString(),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });
      const loc = (r.headers && r.headers.location) || '';
      const q = new URLSearchParams(loc.split('?')[1] || '');
      // no Location, or a Location that carries no pet, means the load did not happen — retry, and
      // if it still will not answer, say so instead of recording "wearing nothing".
      if (!loc || !q.get('name')) { if (attempt) { console.log('  ! DTI would not load "' + name + '" — leaving it alone'); return null; } await sleep(1500); continue; }
      return q.get('style') || '';
    } catch (e) {
      if (attempt) { console.log('  ! could not reach DTI for "' + name + '": ' + e.message); return null; }
      await sleep(1500);
    }
  }
  return null;
}

const toEntry = (cx, cy, size) => {
  const e = [+cx.toFixed(4), +cy.toFixed(4)];
  if (Math.abs(size - STD_SIZE) > 0.01) e.push(+size.toFixed(4));
  return e;
};
const today = () => new Date().toISOString().slice(0, 10);

// Measure one cached (pet, style) render pair. Returns the ledger entry, or null with a reason.
function measurePair(styleId, pet, via, ledger, sib) {
  const a = imgFile(pet, styleId, 1), f = imgFile(pet, styleId, 4);
  const have = (p) => fs.existsSync(p) && fs.statSync(p).size > 0;
  if (!have(a) || !have(f)) { console.log('  ! style ' + styleId + ' (' + pet + '): renders missing — next run'); return null; }
  let res;
  try { res = findCrop(a, f); } catch (e) { console.log('  x style ' + styleId + ' (' + pet + '): ' + e.message); return null; }
  if (res.failed) { console.log('  x style ' + styleId + ' (' + pet + '): ' + res.failed); return null; }
  const entry = { box: toEntry(res.cx, res.cy, res.size), pet: pet, score: +res.score.toFixed(3), via: via, ts: today() };
  if (res.score < MIN_SCORE) entry.held = 'low NCC ' + res.score.toFixed(3);
  ledger[styleId] = entry;
  console.log('  style ' + styleId + ' via "' + pet + '" -> [' + entry.box.join(', ') + '] score ' + res.score.toFixed(3)
    + (entry.held ? '  ! HELD, low NCC — prove it with proof-styles.js' : '') + (via === 'cache' ? '  (from a cached render)' : ''));
  if (sib) checkAgainstDerived(styleId, entry.box, sib);
  return entry;
}

// Renders on disk were verified wearing-now when they were FETCHED, so they stay measurable long
// after the pet has moved on — this is what saves a capture when a run is interrupted, or when the
// pet undresses between the fetch and the match (irasibeth did exactly that, 2026-08-17).
function sweepCache(table, ledger, sib) {
  if (!fs.existsSync(IMG)) return [];
  const done = [];
  fs.readdirSync(IMG).forEach(f => {
    const m = f.match(/^petname-(.+)-s(\d+)-1-1\.png$/);
    if (!m) return;
    const styleId = m[2];
    if (table[styleId] || (ledger[styleId] && !ledger[styleId].held)) return;
    if (measurePair(styleId, m[1], 'cache', ledger, sib)) done.push(styleId);
  });
  return done;
}

// ── 5. fold the ledger into bulk.js ──────────────────────────────────────────────────────────
// Rewrites the single OE_ABOX_BY_STYLE line and re-parses the whole file; on any doubt the original
// text goes straight back. Held (low-NCC) entries never reach this.
function applyLedger(ledger) {
  const table = readCurrentTable();
  const pending = Object.keys(ledger).filter(id => !ledger[id].held && !table[id]);
  if (!pending.length) return { added: [], line: null };
  const merged = Object.assign({}, table);
  pending.forEach(id => { merged[id] = ledger[id].box; });
  const body = Object.keys(merged).sort((a, b) => +a - +b).map(id => "'" + id + "': [" + merged[id].join(', ') + ']').join(', ');
  const line = '    const OE_ABOX_BY_STYLE = { ' + body + ' };';
  const src = fs.readFileSync(BULK, 'utf8');
  const next = src.replace(/^.*const OE_ABOX_BY_STYLE = \{[^;]*\};.*$/m, line.replace(/\$/g, '$$$$'));
  if (next === src) fail('could not rewrite the OE_ABOX_BY_STYLE line — apply by hand');
  fs.writeFileSync(BULK, next);
  const chk = spawnSync('node', ['--check', BULK], { encoding: 'utf8' });
  if (chk.status !== 0) {
    fs.writeFileSync(BULK, src);
    fail('node --check failed after the rewrite — bulk.js restored, nothing applied:\n' + (chk.stderr || ''));
  }
  pending.forEach(id => { ledger[id].applied = today(); });
  return { added: pending, line: line };
}

(async () => {
  const ledger = readJson(LEDGER, {});
  const roster = readJson(ROSTER, {});          // petName(lower) -> {seen, styles:[…], last}
  const table = readCurrentTable();
  const sib = readSibTable();                   // derived boxes: a direct measurement tests them

  if (APPLY_ONLY) {
    const r = applyLedger(ledger);
    writeJson(LEDGER, ledger);
    console.log(r.added.length ? 'applied to bulk.js: ' + r.added.join(', ') : 'nothing pending — bulk.js unchanged.');
    return;
  }

  const { pairs, meas } = await readPairs();
  // roster grows from every submission and never shrinks — a pet that changes styles is exactly the
  // pet worth asking again next time.
  Object.keys(pairs).forEach(id => {
    const k = pairs[id].toLowerCase();
    const e = roster[k] || (roster[k] = { name: pairs[id], styles: [] });
    if (e.styles.indexOf(id) < 0) e.styles.push(id);
  });
  let names = Object.keys(roster);
  if (!names.length) fail('no pet names anywhere — feed a /list dump or the gear\'s exported style log once');
  if (ONLY_PET) {
    if (!roster[ONLY_PET]) roster[ONLY_PET] = { name: ONLY_PET, styles: [] };   // a pet we had never seen
    names = [ONLY_PET];
    console.log('triggered by a submission for "' + roster[ONLY_PET].name + '" — asking about that pet only');
  }

  console.log('roster: ' + names.length + ' pets · sink pairs: ' + Object.keys(pairs).length
    + ' · measured styles in bulk.js: ' + Object.keys(table).length + ' · ledger: ' + Object.keys(ledger).length);

  // ── 3. what is each roster pet wearing right now? ──
  const wearing = {};
  for (const k of names) {
    const cur = await currentStyleOf(roster[k].name);
    if (cur === null) continue;                       // network trouble: leave last known alone
    wearing[k] = cur;
    // `seen` = the last time this pet's look actually CHANGED, not the last time we asked. Nightly
    // runs commit this file, and stamping every pet every night would be a commit a day saying
    // nothing happened.
    if (roster[k].last !== cur || !roster[k].seen) roster[k].seen = today();
    roster[k].last = cur;
    if (cur && roster[k].styles.indexOf(cur) < 0) roster[k].styles.push(cur);
    await sleep(400);
  }
  writeJson(ROSTER, roster);

  // candidates = anything a roster pet wears right now that is neither shipped nor already measured
  const todo = [];
  Object.keys(wearing).forEach(k => {
    const sid = wearing[k];
    if (!sid || table[sid] || (ledger[sid] && !ledger[sid].held)) return;
    todo.push({ styleId: sid, pet: roster[k].name, submitted: !!pairs[sid] });
  });
  const idle = Object.keys(wearing).length - todo.length;
  console.log('wearing something new: ' + todo.length + ' (' + todo.filter(t => t.submitted).length
    + ' submitted, ' + todo.filter(t => !t.submitted).length + ' spotted) · nothing to take from ' + idle + ' pets');

  // pre-measured submissions (dormant path, kept: the worker still accepts coords)
  Object.keys(meas).forEach(id => {
    if (table[id] || (ledger[id] && !ledger[id].held)) return;
    const r = meas[id];
    ledger[id] = { box: toEntry(r.cx, r.cy, r.size), pet: pairs[id], score: r.score, via: 'client', ts: today() };
    if (r.score != null && r.score < MIN_SCORE) ledger[id].held = 'low NCC ' + r.score;
    console.log('  style ' + id + ' via "' + pairs[id] + '" -> [' + ledger[id].box.join(', ') + '] client-measured');
  });

  // ── 4. fetch the two renders through real Chrome, then match ──
  if (todo.length) {
    const jobs = [];
    todo.forEach(t => {
      [1, 4].forEach(sz => jobs.push({
        url: 'https://pets.neopets.com/cpn/' + encodeURIComponent(t.pet.toLowerCase()) + '/1/' + sz + '.png',
        out: 'petname-' + safe(t.pet) + '-s' + t.styleId + '-1-' + sz + '.png',
      }));
    });
    fs.writeFileSync(JOBS, JSON.stringify(jobs));
    const r = spawnSync('node', ['fetch-images.js', JOBS], { cwd: __dirname, stdio: 'inherit' });
    if (r.status !== 0) console.log('! fetch-images exited ' + r.status + ' — measuring whatever is cached');
    todo.forEach(t => measurePair(t.styleId, t.pet, t.submitted ? 'submitted' : 'spotted', ledger, sib));
  }
  // anything fetched by an earlier run (or an interrupted one) that never got measured
  const recovered = sweepCache(table, ledger, sib);
  if (recovered.length) console.log('recovered from cached renders: ' + recovered.join(', '));

  // ── 5. ledger → bulk.js ──
  const held = Object.keys(ledger).filter(id => ledger[id].held);
  const ready = Object.keys(ledger).filter(id => !ledger[id].held && !table[id]);
  let applied = [];
  if (APPLY && ready.length) {
    applied = applyLedger(ledger).added;
    if (applied.length) spawnSync('node', ['derive-siblings.js', '--write'], { cwd: __dirname, stdio: 'inherit' });
    console.log('\napplied to bulk.js: ' + applied.length + ' style(s) -> table now '
      + (Object.keys(table).length + applied.length) + '. Bump the build marker, then: npm run embed && npm test');
  } else if (ready.length) {
    console.log('\nledger holds ' + ready.length + ' unapplied style(s) — run with --apply-only to fold them into bulk.js');
  } else {
    console.log('\nnothing new to apply.');
  }
  if (held.length) console.log('held (low confidence, never auto-applied): ' + held.join(', '));
  writeJson(LEDGER, ledger);

  const stale = Object.keys(pairs).filter(id => !table[id] && !ledger[id]).length;
  console.log('still waiting on a wearer: ' + stale + ' submitted style(s)');
  fs.appendFileSync(LOG, '- ' + today() + ' — polled ' + names.length + ' pets, measured '
    + todo.length + ', applied ' + applied.length + (applied.length ? ' (' + applied.join(', ') + ')' : '')
    + ', held ' + held.length + ', waiting ' + stale + '\n');
})();
