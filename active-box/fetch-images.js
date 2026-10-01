'use strict';
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const IMG = process.env.ABOX_IMG || path.join(require('os').tmpdir(), 'abox-img');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!fs.existsSync(IMG)) fs.mkdirSync(IMG, { recursive: true });
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const todo = jobs.filter(j => {
    const f = path.join(IMG, j.out);
    return !(fs.existsSync(f) && fs.statSync(f).size > 0);
  });
  console.log('pictures: ' + jobs.length + ', already here: ' + (jobs.length - todo.length) + ', to fetch: ' + todo.length);
  if (!todo.length) return 0;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-gpu', '--no-first-run', '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'],
  });
  let ok = 0, fail = 0;
  try {
    const page = await browser.newPage();
    for (const j of todo) {
      const label = j.label || j.out;
      try {
        const resp = await page.goto(j.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const status = resp.status();
        if (status !== 200) { console.log('  HTTP ' + status + ': ' + label); fail++; }
        else {
          const buf = await resp.buffer();
          if (buf.slice(0, 4).toString('hex') !== '89504e47') { console.log('  not a PNG: ' + label); fail++; }
          else { fs.writeFileSync(path.join(IMG, j.out), buf); ok++; }
        }
      } catch (e) { console.log('  error: ' + label + ': ' + e.message.replace(/https?:\/\/\S+/g, '<address>')); fail++; }
      await sleep(350);
    }
  } finally {
    await browser.close();
  }
  console.log('fetched: ' + ok + ', failed: ' + fail);
  return fail ? 1 : 0;
}

main().then(code => process.exit(code), e => { console.error('fetch-images crashed: ' + String(e && e.message).replace(/https?:\/\/\S+/g, '<address>')); process.exit(1); });
