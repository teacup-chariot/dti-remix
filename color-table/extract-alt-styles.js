// Add PET STYLE (alt style) thumbnails to the colour-table fetch list.
//
// WHY: the wearable extractor keeps only rows that occupy a zone, and a pet style is not a wearable —
// it replaces the pet. So Pet Styles were absent from the colour table and every user's browser
// computed their colours locally instead. ~3,500 thumbnails.
//
// They ARE in DTI's dump, in `alt_styles`, with a `thumbnail_url` on the same public item CDN as
// everything else — so this is the same pipeline, just a second table.
//
// APPENDS to cache/items.json (what fetch-thumbs.js and compute-table.js read), deduped on stem, so
// re-running is idempotent and neither of those scripts needed changing.
//
// Run AFTER extract-items.js:  node extract-items.js && node extract-alt-styles.js
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const DUMP = path.join(__dirname, '..', 'active-box', 'cache', 'latest.sql.gz');
const ITEMS = path.join(__dirname, 'cache', 'items.json');

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
    let cur = '', inStr = false, esc = false;
    for (; i < n; i++) {
      const c = s[i];
      if (inStr) {
        if (esc) { cur += c; esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
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

async function main() {
  if (!fs.existsSync(ITEMS)) throw new Error('cache/items.json missing — run `node extract-items.js` first');
  const out = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
  const seen = new Set(out.map((r) => r.stem));
  const before = out.length;

  const rl = readline.createInterface({
    input: fs.createReadStream(DUMP).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });

  let cols = null, inCreate = false;
  let scanned = 0, added = 0, skippedHost = 0, dupStem = 0;

  for await (const line of rl) {
    if (line.startsWith('CREATE TABLE `alt_styles`')) { inCreate = true; cols = []; continue; }
    if (inCreate) {
      const m = line.match(/^\s*`([^`]+)`/);
      if (m) { cols.push(m[1]); continue; }
      if (line.startsWith(')')) { inCreate = false; continue; }
      continue;
    }
    if (cols && line.startsWith('INSERT INTO `alt_styles`')) {
      for (const row of parseTuples(line.slice(line.indexOf('VALUES') + 6))) {
        scanned++;
        const rec = {};
        cols.forEach((c, idx) => { rec[c] = row[idx]; });
        const url = rec.thumbnail_url || '';
        if (!/^https?:\/\/images\.neopets\.com\/items\//i.test(url)) { skippedHost++; continue; }
        const stem = stemOf(url);
        if (!stem) continue;
        if (seen.has(stem)) { dupStem++; continue; }
        seen.add(stem);
        out.push({ id: +rec.id, stem, url });
        added++;
      }
    }
  }

  if (!cols) throw new Error('CREATE TABLE `alt_styles` not found in dump');
  fs.writeFileSync(ITEMS, JSON.stringify(out));
  console.log('alt_styles rows scanned:', scanned);
  console.log('pet style thumbnails added:', added, '(dup stem: ' + dupStem + ', non-CDN: ' + skippedHost + ')');
  console.log('fetch list:', before, '->', out.length, '@', ITEMS);
}

main().catch((e) => { console.error(e); process.exit(1); });
