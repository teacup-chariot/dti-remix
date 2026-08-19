// Browser-based image fetcher: pets.neopets.com 403s non-browser clients (TLS fingerprinting), so
// we drive the REAL installed Chrome via puppeteer-core and save each response body. Read-only GETs
// of public renders, sequential + throttled, disk-cached/resumable — the Matchu-endorsed method.
// Usage: node fetch-images.js <jobs.json>   where jobs = [{hash, mood, size}, ...]
'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const IMG = path.join(process.env.ABOX_CACHE || path.join(__dirname, 'cache'), 'img');
if (!fs.existsSync(IMG)) fs.mkdirSync(IMG, { recursive: true });

// This box's Chrome by default; CHROME_PATH lets a CI runner point at its own (ubuntu-latest ships
// one at /usr/bin/google-chrome). Same real browser either way — pets.neopets.com TLS-fingerprints
// and 403s anything else, so a headless HTTP client is not an option on any machine.
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname, 'jobs.json')));
  // job forms: {hash, mood, size} → /cp/{hash}/{mood}/{size}.png, or {url, out} for anything else
  // (e.g. /cpn/{petname}/{mood}/{size}.png — a real pet's CURRENT look, incl. Pet Styles)
  jobs.forEach(j => {
    if (!j.url) j.url = 'https://pets.neopets.com/cp/' + j.hash + '/' + j.mood + '/' + j.size + '.png';
    if (!j.out) j.out = j.hash + '-' + j.mood + '-' + j.size + '.png';
  });
  const todo = jobs.filter(j => {
    const f = path.join(IMG, j.out);
    return !(fs.existsSync(f) && fs.statSync(f).size > 0);
  });
  console.log('jobs:', jobs.length, '· cached:', jobs.length - todo.length, '· to fetch:', todo.length);
  if (!todo.length) return;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-gpu', '--no-first-run', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'],
  });
  try {
    const page = await browser.newPage();
    let ok = 0, fail = 0;
    for (const j of todo) {
      const url = j.url;
      const file = path.join(IMG, j.out);
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const status = resp.status();
        if (status !== 200) { console.log('HTTP', status, url); fail++; }
        else {
          const buf = await resp.buffer();
          if (buf.slice(0, 4).toString('hex') !== '89504e47') { console.log('not-png', url); fail++; }
          else { fs.writeFileSync(file, buf); ok++; }
        }
      } catch (e) { console.log('ERR', url, e.message); fail++; }
      if ((ok + fail) % 25 === 0) console.log('progress:', ok + fail, '/', todo.length, '(ok', ok, 'fail', fail + ')');
      await sleep(350);
    }
    console.log('done. ok:', ok, 'fail:', fail);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
