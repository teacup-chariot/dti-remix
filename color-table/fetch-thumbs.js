// Download every wearable thumbnail once into cache/thumbs/{stem}. Disk-cached + resumable (skips files
// already on disk), so a re-run after tweaking a calibration knob costs NOTHING here — only compute-table.js
// re-runs. Polite: bounded concurrency + a tiny gap, https-normalised, one retry. images.neopets.com is the
// public item CDN (ACAO:*, curl-friendly) — this is a DEV-MACHINE harvest, exactly the read-only, throttled
// posture of tools/active-box; the userscript itself never makes these requests.
//
// Usage: node fetch-thumbs.js [limit]      (limit = only the first N items, for a quick pipeline test)
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const DIR = path.join(__dirname, 'cache', 'thumbs');
const ITEMS = path.join(__dirname, 'cache', 'items.json');
const FAILED = path.join(__dirname, 'cache', 'fetch-failed.json');

const CONCURRENCY = 24;
const GAP_MS = 15;             // small breather between request starts
const UA = 'DTI-Remix color-table builder (Neopets DTI userscript; public item CDN, read-only)';

function get(url, redirects = 0) {
  return new Promise((resolve) => {
    const u = url.replace(/^http:/, 'https:');
    const req = https.get(u, { headers: { 'user-agent': UA } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && redirects < 3) {
        r.resume();
        return resolve(get(r.headers.location, redirects + 1));
      }
      if (r.statusCode !== 200) { r.resume(); return resolve({ err: 'HTTP ' + r.statusCode }); }
      const chunks = [];
      r.on('data', (d) => chunks.push(d));
      r.on('end', () => resolve({ buf: Buffer.concat(chunks) }));
    });
    req.on('error', (e) => resolve({ err: e.message }));
    req.setTimeout(20000, () => { req.destroy(); resolve({ err: 'timeout' }); });
  });
}

async function main() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  let items = JSON.parse(fs.readFileSync(ITEMS, 'utf8'));
  const limit = parseInt(process.argv[2], 10);
  if (limit > 0) items = items.slice(0, limit);

  // resume: only fetch stems not already on disk
  const todo = items.filter((it) => !fs.existsSync(path.join(DIR, it.stem)));
  const already = items.length - todo.length;
  console.log('items:', items.length, '· already cached:', already, '· to fetch:', todo.length);

  const failed = [];
  let done = 0, ok = 0;
  let idx = 0;

  async function worker() {
    while (idx < todo.length) {
      const it = todo[idx++];
      // one retry on transient failure
      let r = await get(it.url);
      if (r.err) r = await get(it.url);
      done++;
      if (r.buf && r.buf.length) {
        try { fs.writeFileSync(path.join(DIR, it.stem), r.buf); ok++; }
        catch (e) { failed.push({ stem: it.stem, url: it.url, err: 'write ' + e.message }); }
      } else {
        failed.push({ stem: it.stem, url: it.url, err: r.err || 'empty' });
      }
      if (done % 500 === 0 || done === todo.length) {
        console.log('  ' + done + '/' + todo.length + '  ok=' + ok + '  failed=' + failed.length);
      }
      if (GAP_MS) await new Promise((res) => setTimeout(res, GAP_MS));
    }
  }

  const t0 = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  fs.writeFileSync(FAILED, JSON.stringify(failed, null, 2));
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\nfetched', ok, 'of', todo.length, 'in', secs + 's · failures:', failed.length, '->', FAILED);
  console.log('total on disk now:', fs.readdirSync(DIR).length);
}

main().catch((e) => { console.error(e); process.exit(1); });
