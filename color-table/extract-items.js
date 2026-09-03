

'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const DUMP = path.join(__dirname, '..', 'active-box', 'cache', 'latest.sql.gz');
const OUT = path.join(__dirname, 'cache', 'items.json');

const OUT_INDEX = path.join(__dirname, 'cache', 'index.json');

const CACHE_DIR = path.join(__dirname, 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

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
  let scanned = 0, wearable = 0, skippedHost = 0, dupStem = 0, ncCount = 0, unkCount = 0;
  let dumpStamp = null;

  for await (const line of rl) {

    if (!dumpStamp && line.startsWith('-- Dump completed on')) {

      const m = line.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/);
      if (m) dumpStamp = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])).toISOString();
    }
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
        if (!zones || zones === 'NULL' || zones === '') continue;
        wearable++;
        const url = rec.thumbnail_url || '';
        if (!/^https?:\/\/images\.neopets\.com\/items\//i.test(url)) { skippedHost++; continue; }
        const stem = stemOf(url);
        if (!stem) continue;

        const _rawRi = rec.rarity_index;
        const _ri = (_rawRi === 'NULL' || _rawRi == null || _rawRi === '') ? null : +_rawRi;
        const _isNC = (_ri === 500 || _ri === 0) || String(rec.is_manually_nc) === '1';

        const _unknown = !_isNC && (_ri === null || !Number.isFinite(_ri));
        if (_isNC) ncCount++; else if (_unknown) unkCount++;
        const _row = [
          +rec.id,
          rec.name === 'NULL' ? '' : (rec.name || ''),
          stem,
          String(zones).split(',').map(z => +z).filter(z => z > 0),
        ];
        if (_isNC) _row.push(1); else if (_unknown) _row.push(2);
        index.push(_row);
        if (seenStem.has(stem)) { dupStem++; continue; }
        seenStem.add(stem);
        out.push({ id: +rec.id, stem, url });
      }
    }
  }

  if (!cols) throw new Error('CREATE TABLE `items` not found in dump');
  fs.writeFileSync(OUT, JSON.stringify(out));

  const dumpDate = dumpStamp || fs.statSync(DUMP).mtime.toISOString();
  if (!dumpStamp) console.warn('WARNING: no "Dump completed on" line found — falling back to file mtime, which in CI is the download time, NOT the dump date.');
  fs.writeFileSync(OUT_INDEX, JSON.stringify({
    v: 1,

    nc: 1,
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
  if (unkCount) console.log('⚠ wearables with no usable rarity_index:', unkCount, '- marked unknown, their tooltips will ask the server');
  console.log('NC wearables:', ncCount, 'of', wearable, '(' + (wearable ? (ncCount / wearable * 100).toFixed(1) : '0') + '%)');
  console.log('skipped (non images.neopets.com thumbnail):', skippedHost);
  console.log('skipped (duplicate stem / shared art):', dupStem);
  console.log('UNIQUE thumbnails to fetch+compute:', out.length, '->', OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
