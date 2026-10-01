'use strict';
const crypto = require('crypto');

const ID_RE = /^\d{1,8}$/;
const DAY_MS = 24 * 3600 * 1000;

function validBox(b) {
  return Array.isArray(b) && (b.length === 2 || b.length === 3) && b.every(n => typeof n === 'number' && isFinite(n) && n > 0 && n < 1);
}

const byNumber = (a, b) => (+a) - (+b);

function petTag(name) {
  return 'pet#' + crypto.createHash('sha256').update('dtr-abox-pet:' + String(name || '').trim().toLowerCase()).digest('hex').slice(0, 6);
}

function stripLedger(ledger) {
  const out = {};
  Object.keys(ledger || {}).filter(id => ID_RE.test(id)).sort(byNumber).forEach(id => {
    const e = ledger[id] || {};
    const o = {};
    ['box', 'score', 'via', 'ts', 'held', 'applied'].forEach(k => { if (e[k] !== undefined) o[k] = e[k]; });
    out[id] = o;
  });
  return out;
}

function bodiesFromStyleIndex(index) {
  const map = {};
  const rows = (index && Array.isArray(index.styles)) ? index.styles : [];
  rows.forEach(r => {
    if (Array.isArray(r) && r[0] != null && r[3] != null) map[String(r[0])] = String(r[3]);
  });
  return map;
}

function buildCropsFile(opts) {
  const ledger = (opts && opts.ledger) || {};
  const shipped = (opts && opts.shipped) || {};
  const bodies = (opts && opts.bodies) || {};
  const measured = {};
  Object.keys(ledger).filter(id => ID_RE.test(id)).sort(byNumber).forEach(id => {
    const e = ledger[id];
    if (e && !e.held && validBox(e.box)) measured[id] = e.box.slice();
  });
  const known = {};
  Object.keys(shipped).forEach(id => { if (ID_RE.test(id) && validBox(shipped[id])) known[id] = shipped[id]; });
  Object.keys(measured).forEach(id => { known[id] = measured[id]; });
  const sourceForBody = {};
  Object.keys(known).sort(byNumber).forEach(id => {
    const body = bodies[id];
    if (body != null && !sourceForBody[body]) sourceForBody[body] = id;
  });
  const siblings = {};
  Object.keys(bodies).sort(byNumber).forEach(id => {
    if (known[id]) return;
    const src = sourceForBody[bodies[id]];
    if (src) siblings[id] = known[src].slice();
  });
  return { v: 1, measured: measured, siblings: siblings };
}

function petNamesFromInbox(entries) {
  const names = {};
  Object.keys(entries || {}).forEach(id => {
    const e = entries[id] || {};
    [e.petName].concat(Array.isArray(e.names) ? e.names : []).forEach(n => {
      const s = String(n || '').trim();
      if (/^[a-zA-Z0-9_\- ]{1,30}$/.test(s) && !names[s.toLowerCase()]) names[s.toLowerCase()] = s;
    });
  });
  return names;
}

function instantPetNames(entries, styleId, now, windowMs) {
  const names = {};
  Object.keys(entries || {}).forEach(id => {
    const e = entries[id] || {};
    const fresh = (now - (e.ts || 0)) <= windowMs;
    if (String(id) !== String(styleId) && !fresh) return;
    const s = String(e.petName || '').trim();
    if (/^[a-zA-Z0-9_\- ]{1,30}$/.test(s) && !names[s.toLowerCase()]) names[s.toLowerCase()] = s;
  });
  return names;
}

function pickCandidates(wearing, shipped, ledger, inbox) {
  const out = [];
  const seen = {};
  Object.keys(wearing || {}).forEach(key => {
    const w = wearing[key];
    const sid = w && w.style;
    if (!sid || seen[sid]) return;
    if (shipped[sid] || (ledger[sid] && !ledger[sid].held)) return;
    seen[sid] = 1;
    out.push({ styleId: String(sid), pet: w.name, submitted: !!(inbox && inbox[sid]) });
  });
  return out;
}

function wakeProblems(entries, now) {
  const counts = {};
  Object.keys(entries || {}).forEach(id => {
    const e = entries[id] || {};
    if (e.ping === undefined || (typeof e.ping === 'number' && e.ping >= 200 && e.ping < 300)) return;
    if (!e.pingedAt || now - e.pingedAt > DAY_MS) return;
    counts[String(e.ping)] = (counts[String(e.ping)] || 0) + 1;
  });
  return Object.keys(counts).map(code => {
    const n = counts[code];
    const what = code === 'no-key' ? 'the inbox has no GitHub key (GH_TOKEN) set in Cloudflare'
      : code === '401' ? 'GitHub refused the inbox\'s key (401): it is wrong or has expired'
      : code === '403' || code === '404' ? 'GitHub refused the inbox\'s key (' + code + '): it cannot start jobs in this repository'
      : 'GitHub answered ' + code;
    return 'The inbox could not wake this job for ' + n + ' style(s) in the last day: ' + what + '.';
  });
}

function toFileText(obj) { return JSON.stringify(obj, null, 1) + '\n'; }

module.exports = {
  validBox, petTag, stripLedger, bodiesFromStyleIndex, buildCropsFile, petNamesFromInbox, instantPetNames,
  pickCandidates, wakeProblems, toFileText,
};
