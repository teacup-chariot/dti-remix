// Copy cache/table.json to the repo root as color-table.json — the shippable artifact the USER hand-uploads to
// GitHub (same flow as bulk_clean.js). bulk.js fetches it from raw.githubusercontent.com and caches it by
// version. Reports the raw + gzipped size (raw GitHub / Fastly serves it gzip-encoded, which is what the client
// actually downloads).
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC = path.join(__dirname, 'cache', 'table.json');
// ⛔ Same repo-root walk as emit-index.js — this folder is tools/color-table locally but the REPO ROOT
// in CI, so a hard-coded '..','..' wrote the artifact outside the repo and the commit found nothing.
function repoRoot() {
  let d = __dirname;
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(d, '.github')) || fs.existsSync(path.join(d, 'bulk_clean.js'))) return d;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return path.join(__dirname, '..');
}
const OUT = path.join(repoRoot(), 'color-table.json');

function main() {
  if (!fs.existsSync(SRC)) throw new Error('cache/table.json missing — run `node compute-table.js` first');
  const raw = fs.readFileSync(SRC);
  const meta = JSON.parse(raw.toString('utf8'));
  fs.writeFileSync(OUT, raw);
  const gz = zlib.gzipSync(raw, { level: 9 });
  const mb = (n) => (n / 1048576).toFixed(2) + ' MB';
  console.log('version:      ', meta.v);
  console.log('generated:    ', meta.generatedAt);
  console.log('items in table:', meta.count);
  console.log('raw size:     ', mb(raw.length));
  console.log('gzipped:      ', mb(gz.length), '(what the browser downloads)');
  console.log('\nwrote', OUT);
  console.log('\nNEXT: upload color-table.json to GitHub (the repo, main) by hand,');
  console.log('the same way you upload bulk_clean.js.');
}

main();
