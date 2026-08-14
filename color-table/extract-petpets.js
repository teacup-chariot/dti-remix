// Add PETPET + PETPETPET thumbnails to the colour-table fetch list.
//
// WHY: the colour table is built from DTI's dump filtered to WEARABLES (things that occupy a zone), so
// petpets — which are Neopets items, not DTI wearables — were never in it. Their colours were computed
// in each user's browser instead, which is the picker's "one-time fetch of every painted petpet's
// colours, this can take a few minutes" scan: paid once PER PERSON rather than solved once for
// everybody. ~3,900 thumbnails against the 27,900 we already process.
//
// They are not in the dump, so the list comes from our own itemdb proxy (the same endpoints the picker
// uses, and the same ones that are KV-cached there, so this costs itemdb nothing extra):
//   /petpets      canonical one-per-species    (~398)
//   /petpets-all  every painted colourway      (~3,479)
//   /petpetpets   petpetpets                   (~52)
//
// It APPENDS to cache/items.json — the list fetch-thumbs.js and compute-table.js already read — so
// neither of those needed changing. Deduped on stem, so re-running is idempotent.
//
// Run AFTER extract-items.js:  node extract-items.js && node extract-petpets.js
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const WORKER = 'https://dtr-itemdb.dti-remix.workers.dev';
const PATHS = ['/petpets', '/petpets-all', '/petpetpets'];
const ITEMS = path.join(__dirname, 'cache', 'items.json');

const stemOf = (url) => ((url || '').split('/').pop() || '').split('?')[0].toLowerCase();

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'DTI-Remix color-table builder' } }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return reject(new Error(url + ' → HTTP ' + r.statusCode)); }
      let body = '';
      r.setEncoding('utf8');
      r.on('data', (d) => { body += d; });
      r.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(ITEMS)) throw new Error('cache/items.json missing — run `node extract-items.js` first');
  const out = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
  const seen = new Set(out.map((r) => r.stem));
  const before = out.length;

  let added = 0, skippedHost = 0, dupStem = 0;
  for (const p of PATHS) {
    const d = await getJSON(WORKER + p);
    const items = (d && d.items) || [];
    let n = 0;
    for (const it of items) {
      const url = (it && it.image) || '';
      // same rule as the wearable extractor: the stem is the cache key, so it must be a per-art
      // filename on the public item CDN. Anything else would collide or 404.
      if (!/^https?:\/\/images\.neopets\.com\/items\//i.test(url)) { skippedHost++; continue; }
      const stem = stemOf(url);
      if (!stem) continue;
      if (seen.has(stem)) { dupStem++; continue; }
      seen.add(stem);
      out.push({ id: +it.item_id || +it.iid || 0, stem, url });
      added++; n++;
    }
    console.log('  ' + p.padEnd(14) + items.length + ' returned, ' + n + ' new');
  }

  fs.writeFileSync(ITEMS, JSON.stringify(out));
  console.log('\nwearable thumbnails:', before);
  console.log('petpet thumbnails added:', added, '(dup stem: ' + dupStem + ', non-CDN: ' + skippedHost + ')');
  console.log('fetch list now:', out.length, '->', ITEMS);
}

main().catch((e) => { console.error(e); process.exit(1); });
