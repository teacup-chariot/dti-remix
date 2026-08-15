// Extract the PET STYLE index from DTI's public data dump (latest.sql.gz) → style-index.json at the
// repo root — the shippable styles INDEX, delivered exactly like item-index.json.
//
// WHY: the live /species/{id}/alt-styles.json is the day-zero source but it HIDES the fields that
// make styles legible: `created_at` (the TRUE release date — "Newest" has nothing else to sort by),
// `series_name` (NULL until a DTI editor names it; the API substitutes "<New?>" placeholders), and
// `full_name`. The dump has all three. The dump lags live by days, so this index ENRICHES what the
// client already loaded live — it never replaces it. Rows here that live doesn't know yet don't
// exist; live rows the index doesn't know yet simply stay un-enriched.
//
// Shape: { v, generatedAt, dumpDate, count, styles: [ [id, species_id, color_id, body_id,
//          created_at, series_name, full_name, stem], … ] } — arrays, not objects, same reasoning
// as item-index.json. series_name/full_name are null until DTI names the style (the client treats
// null as "unnamed", which is REAL information — don't collapse it to '').
// created_at/dumpDate carry the dump's own local-time stamps, same caveat as item-index.json:
// hours of skew are fine, day-resolution is what the client groups by.
// stem = lowercased thumbnail filename. `mall_bg_circle.gif` is DTI's shared PLACEHOLDER for
// styles with no portrait yet — kept RAW here; the client tests for it (portrait fallback) and
// the itemdb name join skips it.
//
// TOKEN NAMES (the itemdb join): a style's real thumbnail IS the granting NC token item's art, and
// itemdb knows that item by image stem — so unnamed rows can borrow the item's name ("Mutant Kacheek
// Pet Style") until DTI names the style. Joined ONLY for rows the dump does NOT name (~120 of 3,474;
// 2 batches of 100, worker-cached 12h) — the named rows would waste ~35 batches of itemdb's point
// budget nightly to fetch names the resolver would never show (official beats itemdb). Best-effort:
// on ANY failure the previous run's tokenNames carry forward and the index still ships — the dates
// and dump names are the primary cargo, the join is enrichment.
//
// Runs standalone off the cached dump:  node extract-style-index.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const https = require('https');

const DUMP = path.join(__dirname, '..', 'active-box', 'cache', 'latest.sql.gz');
const WORKER = 'https://dtr-itemdb.dti-remix.workers.dev';

// ⛔ DO NOT HARD-CODE '..','..'. This folder sits at tools/color-table on the dev machine but at the
// REPO ROOT in CI (only these scripts are published, not the whole tools tree) — see emit-index.js.
function repoRoot() {
  let d = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(d, '.github')) || fs.existsSync(path.join(d, 'bulk_clean.js'))) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return path.join(__dirname, '..');   // last resort: one level up
}
const OUT = path.join(repoRoot(), 'style-index.json');

const stemOf = (url) => ((url || '').split('/').pop() || '').split('?')[0].toLowerCase();

// Minimal tuple parser — same shape as extract-items.js. NULL becomes the literal 'NULL'.
function parseTuples(s) {
  const rows = [];
  let i = 0;
  const n = s.length;
  while (i < n) {
    if (s[i] !== '(') { i++; continue; }
    i++;
    const row = [];
    let cur = '', inStr = false;
    for (; i < n; i++) {
      const c = s[i];
      if (inStr) {
        if (c === '\\') { cur += s[i + 1]; i++; continue; }
        if (c === "'") { inStr = false; continue; }
        cur += c;
        continue;
      }
      if (c === "'") { inStr = true; continue; }
      if (c === ',') { row.push(cur); cur = ''; continue; }
      if (c === ')') { row.push(cur); rows.push(row); break; }
      cur += c;
    }
    i++;
  }
  return rows;
}

const nul = (v) => (v === 'NULL' || v === undefined ? null : v);

// itemdb keys items by image stem WITHOUT the extension (matches bulk.js _oePalStem).
const imageIdOf = (stem) => String(stem || '').replace(/\.(gif|png|jpe?g)$/i, '');

function postJSON(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = JSON.stringify(body);
    const rq = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(payload), 'user-agent': 'DTI-Remix style-index builder' },
    }, (r) => {
      let out = '';
      r.setEncoding('utf8');
      r.on('data', (d) => { out += d; });
      r.on('end', () => {
        if (r.statusCode !== 200) return reject(new Error(url + ' → HTTP ' + r.statusCode + (out ? ' ' + out.slice(0, 200) : '')));
        try { resolve(JSON.parse(out)); } catch (e) { reject(e); }
      });
    });
    rq.on('error', reject);
    rq.end(payload);
  });
}

// stem → token item name for every UNNAMED row with a real (non-placeholder) thumb.
// Returns { [styleId]: name }; throws only out of postJSON — the caller decides the fallback.
async function joinTokenNames(styles) {
  const byImageId = new Map();   // image_id → [style ids] (defensive: stems should be unique per style)
  for (const s of styles) {
    if (s[5] !== null) continue;                       // dump already names it — resolver prefers that
    if (!s[7] || s[7] === 'mall_bg_circle.gif') continue;
    const iid = imageIdOf(s[7]);
    if (!byImageId.has(iid)) byImageId.set(iid, []);
    byImageId.get(iid).push(s[0]);
  }
  const ids = [...byImageId.keys()];
  const names = {};
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const res = await postJSON(WORKER + '/items', { image_id: batch });
    const items = (res && res.items) || {};
    for (const iid of batch) {
      const it = items[iid];
      if (it && it.name) byImageId.get(iid).forEach((sid) => { names[sid] = it.name; });
    }
  }
  return { names, asked: ids.length };
}

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(DUMP).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });

  let cols = null, inCreate = false;
  const styles = [];
  let dumpStamp = null;   // the dump's OWN completion date — see extract-items.js for why mtime lies in CI

  for await (const line of rl) {
    if (!dumpStamp && line.startsWith('-- Dump completed on')) {
      // ⚠ mysqldump does not zero-pad the hour — parse the parts by hand (see extract-items.js).
      const m = line.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/);
      if (m) dumpStamp = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
    }
    if (line.startsWith('CREATE TABLE `alt_styles`')) { inCreate = true; cols = []; continue; }
    if (inCreate) {
      const m = line.match(/^\s*`([^`]+)`/);
      if (m) { cols.push(m[1]); continue; }
      if (line.startsWith(')')) { inCreate = false; continue; }
      continue;
    }
    if (cols && line.startsWith('INSERT INTO `alt_styles`')) {
      for (const row of parseTuples(line.slice(line.indexOf('VALUES') + 6))) {
        const rec = {};
        cols.forEach((c, idx) => { rec[c] = row[idx]; });
        styles.push([
          +rec.id,
          +rec.species_id,
          +rec.color_id,
          +rec.body_id,
          rec.created_at,                 // 'YYYY-MM-DD HH:MM:SS', dump-local time, verbatim
          nul(rec.series_name),
          nul(rec.full_name),
          stemOf(rec.thumbnail_url),
        ]);
      }
    }
  }

  if (!cols) throw new Error('CREATE TABLE `alt_styles` not found in dump');
  if (!dumpStamp) console.warn('WARNING: no "Dump completed on" line found — falling back to file mtime, which in CI is the download time, NOT the dump date.');
  const dumpDate = dumpStamp || fs.statSync(DUMP).mtime.toISOString();

  let tokenNames = {}, joinNote = '';
  try {
    const j = await joinTokenNames(styles);
    tokenNames = j.names;
    joinNote = Object.keys(tokenNames).length + ' of ' + j.asked + ' unnamed stems resolved via itemdb';
  } catch (e) {
    // Best-effort: keep the previous run's names rather than shipping an index with none. In CI the
    // checkout has yesterday's style-index.json; locally there may be nothing — both are fine.
    try { tokenNames = JSON.parse(fs.readFileSync(OUT, 'utf8')).tokenNames || {}; } catch (_) {}
    joinNote = 'JOIN FAILED (' + e.message + ') — carried forward ' + Object.keys(tokenNames).length + ' names from the previous index';
    console.warn('WARNING: itemdb name join failed:', e.message);
  }

  const raw = JSON.stringify({
    v: 1,
    generatedAt: new Date().toISOString(),
    dumpDate,
    count: styles.length,
    styles,
    tokenNames,
  });
  fs.writeFileSync(OUT, raw);

  const named = styles.filter((s) => s[5] !== null).length;
  const placeholder = styles.filter((s) => s[7] === 'mall_bg_circle.gif').length;
  const gz = zlib.gzipSync(Buffer.from(raw), { level: 9 });
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  console.log('styles:', styles.length, '(named:', named + ', placeholder portrait:', placeholder + ')');
  console.log('token names:', joinNote);
  console.log('dump date (index is fresh through):', dumpDate);
  console.log('raw size:', kb(raw.length), '| gzipped:', kb(gz.length));
  console.log('wrote', OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
