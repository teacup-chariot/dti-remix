// Copy cache/index.json to the repo root as item-index.json — the shippable item INDEX that lets the
// client filter by colour without paging DTI's API.
//
// WHY A SECOND FILE instead of folding this into color-table.json: the two have different shapes and
// different lifetimes. The colour table is keyed by THUMBNAIL STEM (items that share art share one
// entry) and is stamped with the pixel-engine version, so the client only trusts a table whose `v`
// matches its own classifier. The index is one row per ITEM and does not care about the engine version
// at all. Keeping them apart means a calibration-knob change re-ships 2.7MB of colours without
// re-shipping the index, and a new-items day re-ships the index without touching the colours.
//
// Shape: { v, generatedAt, dumpDate, count, items: [ [id, name, stem, [zoneId,…]], … ] }
//   dumpDate = the mtime of DTI's public dump this was built from. The client compares it against
//   /items/latest to know which days it still has to top up live. Without it the client cannot tell
//   a fresh index from a week-old one.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC = path.join(__dirname, 'cache', 'index.json');
// ⛔ DO NOT HARD-CODE '..','..'. This folder sits at tools/color-table on the dev machine but at the
// REPO ROOT in CI (only these scripts are published, not the whole tools tree), so a fixed depth wrote
// the artifact one level ABOVE the repo and the commit step then found nothing to add. Walk up until a
// directory looks like the repo root instead.
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
const OUT = path.join(repoRoot(), 'item-index.json');

function main() {
  if (!fs.existsSync(SRC)) throw new Error('cache/index.json missing — run `node extract-items.js` first');
  const raw = fs.readFileSync(SRC);
  const meta = JSON.parse(raw.toString('utf8'));
  fs.writeFileSync(OUT, raw);
  const gz = zlib.gzipSync(raw, { level: 9 });
  const mb = (n) => (n / 1048576).toFixed(2) + ' MB';
  console.log('index version: ', meta.v);
  console.log('generated:     ', meta.generatedAt);
  console.log('fresh through: ', meta.dumpDate, '(DTI dump date)');
  console.log('items:         ', meta.count);
  console.log('raw size:      ', mb(raw.length));
  console.log('gzipped:       ', mb(gz.length), '(what the browser actually downloads)');
  console.log('\nwrote', OUT);
}

main();
