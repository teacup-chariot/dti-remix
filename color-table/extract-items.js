// Extract WEARABLE item thumbnails from DTI's public data dump (latest.sql.gz) into cache/items.json.
// Streams the gzip (never inflates the whole dump into RAM); reads the column order from the dump's own
// CREATE TABLE so an upstream schema change fails loudly instead of silently mis-mapping columns.
//
// We keep only rows that:
//   • occupy at least one zone (`cached_occupied_zone_ids` non-empty) → the item is actually wearable, and
//   • have an `images.neopets.com/items/…` thumbnail → a UNIQUE per-art filename (the client keys its
//     histogram cache by that filename/stem). S3 (`impress-asset-images…/80x80.png`) thumbnails share the
//     same "80x80.png" filename across items, so they'd collide in a stem-keyed table — skip them; those
//     rare/legacy items just fall back to live in-browser compute.
//
// Output rows: { id, stem, url } where stem = the lowercased filename incl. extension (matches the client's
// _pixHistStem). Refresh the dump first:
//   curl -L -o ../active-box/cache/latest.sql.gz https://impress.openneo.net/public-data/latest.sql.gz
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const DUMP = path.join(__dirname, '..', 'active-box', 'cache', 'latest.sql.gz');
const OUT = path.join(__dirname, 'cache', 'items.json');
// ── THE ITEM INDEX (added for local colour filtering) ────────────────────────────────────────────
// items.json above is the FETCH list: one row per unique thumbnail, because two items that share art
// share a colour entry. The INDEX is the opposite — EVERY wearable item, including the ones that share
// art — because the picker has to be able to list them all. They join on `stem`.
// Shape: { v, generatedAt, count, items: [ [id, name, stem, [zoneId,…]], … ] } — arrays, not objects,
// since the key names would otherwise repeat 28,000 times.
const OUT_INDEX = path.join(__dirname, 'cache', 'index.json');

// Parse one SQL VALUES list "(1,'a',NULL),(...)" → array of arrays. Minimal but handles quoted strings
// with backslash escapes (all mysqldump emits). NULL becomes the literal string 'NULL' (callers check).
function parseTuples(s) {
  const rows = [];
  let i = 0;
  const n = s.length;
  while (i < n) {
    while (i < n && s[i] !== '(') i++;
    if (i >= n) break;
    i++;
    const row = [];
    let cur = '';
    let inStr = false;
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

const stemOf = (url) => ((url || '').split('/').pop() || '').split('?')[0].toLowerCase();

async function main() {
  const rl = readline.createInterface({
    input: fs.createReadStream(DUMP).pipe(zlib.createGunzip()),
    crlfDelay: Infinity,
  });

  let cols = null;
  let inCreate = false;
  const out = [];
  const index = [];
  const seenStem = new Set();
  let scanned = 0, wearable = 0, skippedHost = 0, dupStem = 0;

  for await (const line of rl) {
    if (line.startsWith('CREATE TABLE `items`')) { inCreate = true; cols = []; continue; }
    if (inCreate) {
      const m = line.match(/^\s*`([^`]+)`/);
      if (m) { cols.push(m[1]); continue; }
      if (line.startsWith(')')) { inCreate = false; continue; }
      continue;
    }
    if (cols && line.startsWith('INSERT INTO `items`')) {
      const vals = line.slice(line.indexOf('VALUES') + 6);
      for (const row of parseTuples(vals)) {
        scanned++;
        const rec = {};
        cols.forEach((c, idx) => { rec[c] = row[idx]; });
        const zones = rec.cached_occupied_zone_ids;
        if (!zones || zones === 'NULL' || zones === '') continue;   // not wearable → skip
        wearable++;
        const url = rec.thumbnail_url || '';
        if (!/^https?:\/\/images\.neopets\.com\/items\//i.test(url)) { skippedHost++; continue; }
        const stem = stemOf(url);
        if (!stem) continue;
        // EVERY wearable item goes in the index, even when it shares art with another one — the picker
        // must be able to list both. `zones` is the dump's own comma-separated cached_occupied_zone_ids,
        // which is also what decides wearability above, so the index can filter by zone with no extra data.
        index.push([
          +rec.id,
          rec.name === 'NULL' ? '' : (rec.name || ''),
          stem,
          String(zones).split(',').map(z => +z).filter(z => z > 0),
        ]);
        if (seenStem.has(stem)) { dupStem++; continue; }   // shared art across items → one table entry
        seenStem.add(stem);
        out.push({ id: +rec.id, stem, url });
      }
    }
  }

  if (!cols) throw new Error('CREATE TABLE `items` not found in dump');
  fs.writeFileSync(OUT, JSON.stringify(out));
  // The dump's own mtime is the index's "fresh through" date — the client compares it against
  // /items/latest to know exactly which days it still has to top up.
  const dumpDate = fs.statSync(DUMP).mtime.toISOString();
  fs.writeFileSync(OUT_INDEX, JSON.stringify({
    v: 1,
    generatedAt: new Date().toISOString(),
    dumpDate,
    count: index.length,
    items: index,
  }));
  console.log('columns:', cols.length);
  console.log('INDEX rows (every wearable item):', index.length, '->', OUT_INDEX);
  console.log('dump date (index is fresh through):', dumpDate);
  console.log('rows scanned:', scanned);
  console.log('wearable (occupies a zone):', wearable);
  console.log('skipped (non images.neopets.com thumbnail):', skippedHost);
  console.log('skipped (duplicate stem / shared art):', dupStem);
  console.log('UNIQUE thumbnails to fetch+compute:', out.length, '->', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
