// Build the colour table: for every cached thumbnail, run bulk.js's OWN extracted pixel core over the decoded
// frame-0 pixels → {family: fraction} → round to permille → cache/table.json. Because the classifier source is
// lifted from bulk.js (see core.js), this can never disagree with the live engine. Fast + CPU-only, so re-run it
// freely after any calibration-knob change (thumbnails stay disk-cached from fetch-thumbs.js).
//
// Output cache/table.json = { v, generatedAt, count, table: { "<stem>": { "<fam>": <permille int>, ... } } }
// where v is the live cache-key version read from bulk.js (_PIXHIST_KEY) so client + table stay in lockstep.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadPixHistCore, readPixhistVersion, DEFAULT_BULK } = require('./core.js');
const { decodeToPixels } = require('./decode.js');

const DIR = path.join(__dirname, 'cache', 'thumbs');
const ITEMS = path.join(__dirname, 'cache', 'items.json');
const OUT = path.join(__dirname, 'cache', 'table.json');
const SKIPPED = path.join(__dirname, 'cache', 'compute-skipped.json');

// Read the live histogram cache version from bulk.js (_PIXHIST_KEY = 'dtr_oe_pixhist_vN') so the table is
// stamped with the exact compute version it was built against — the client only trusts a table whose v matches.
// (readPixhistVersion now lives in core.js — it needs the same bulk.js/generated-core fallback that
//  loadPixHistCore has, or CI reads the version from a file that is not there.)

function main() {
  const { _pixHistFromData } = loadPixHistCore(DEFAULT_BULK);
  const v = readPixhistVersion(DEFAULT_BULK);
  const items = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));

  const table = {};
  const skipped = [];
  let ok = 0, noFile = 0, decodeErr = 0, empty = 0, oversize = 0;
  const t0 = Date.now();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const fp = path.join(DIR, it.stem);
    if (!fs.existsSync(fp)) { noFile++; skipped.push({ stem: it.stem, why: 'no-file' }); continue; }
    let px, fr;
    try {
      const buf = fs.readFileSync(fp);
      px = decodeToPixels(buf);
      if (Math.max(px.W, px.H) < 80 || px.W !== px.H) { /* just tally unusual sizes, still compute */ }
      if (Math.max(px.W, px.H) > 80) oversize++;
      fr = _pixHistFromData(px.data, px.W, px.H);
    } catch (e) {
      decodeErr++; skipped.push({ stem: it.stem, why: 'decode: ' + e.message }); continue;
    }
    if (!fr) { empty++; skipped.push({ stem: it.stem, why: 'no-opaque-pixels' }); continue; }
    // permille ints (compact + plenty precise for the >=10%/>=30% match thresholds); drop dust < 1‰
    const rec = {};
    for (const f of Object.keys(fr)) { const pm = Math.round(fr[f] * 1000); if (pm > 0) rec[f] = pm; }
    table[it.stem] = rec;
    ok++;
    if (ok % 5000 === 0) console.log('  computed', ok, '...');
  }

  const payload = { v, generatedAt: new Date().toISOString(), count: ok, table };
  fs.writeFileSync(OUT, JSON.stringify(payload));
  fs.writeFileSync(SKIPPED, JSON.stringify(skipped, null, 2));
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const mb = (fs.statSync(OUT).size / 1048576).toFixed(2);
  console.log('\nversion:', v);
  console.log('computed:', ok, '· no-file:', noFile, '· decode-err:', decodeErr, '· empty:', empty, '· >80px:', oversize);
  console.log('table.json:', mb + ' MB (uncompressed) in', secs + 's ->', OUT);
}

main();
