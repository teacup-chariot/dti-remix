// Extract the PIXHIST-CORE region from bulk.js and turn it into a live function.
//
// This is the whole point of the drift-proof design: rather than re-implement the pixel classifier here (and
// let it rot out of sync with the live engine), we lift the EXACT source of `_pixFamily` + the `_PIX_*` knobs
// + `_pixHistFromData` straight out of bulk.js — the same bytes that run in the browser — and eval them. Change
// a knob in bulk.js, re-run `npm run compute`, and the table matches automatically. The region is DOM-free by
// construction (see the marker comments in bulk.js), so it evaluates cleanly in Node.
'use strict';
const fs = require('fs');
const path = require('path');

const START = 'PIXHIST-CORE-START';
const END = 'PIXHIST-CORE-END';

// ⛔ CI HAS NO bulk.js. It is the PRIVATE dev source and is deliberately never published, so on a
// GitHub runner the read below throws and the whole nightly job dies in seconds. When bulk.js is
// absent we fall back to pixhist-core.generated.js — the same region, extracted by emit-core.js and
// committed. Drift-proofing is intact either way: on a dev machine bulk.js always wins, so a knob
// change takes effect immediately and the generated file is only a shipping vehicle.
const GENERATED = path.join(__dirname, 'pixhist-core.generated.js');
function _generated() {
  if (!fs.existsSync(GENERATED)) {
    throw new Error(
      'Neither bulk.js nor pixhist-core.generated.js is available.\n' +
      '  On a dev machine: run from the repo so bulk.js resolves.\n' +
      '  In CI: run `node emit-core.js` locally and commit pixhist-core.generated.js.'
    );
  }
  return require(GENERATED);
}

// The classifier's version (_PIXHIST_KEY) — from bulk.js when present, else the generated file.
function readPixhistVersion(bulkPath) {
  if (fs.existsSync(bulkPath)) {
    const m = fs.readFileSync(bulkPath, 'utf8').match(/_PIXHIST_KEY\s*=\s*'([^']+)'/);
    if (!m) throw new Error("could not read _PIXHIST_KEY from " + bulkPath);
    return m[1];
  }
  return _generated().v;
}

function loadPixHistCore(bulkPath) {
  if (!fs.existsSync(bulkPath)) {
    const body = _generated().body;
    const api = new Function(body + '\n;return { _pixHistFromData, _pixFamily };')();
    if (typeof api._pixHistFromData !== 'function') throw new Error('_pixHistFromData not found in the generated core');
    return api;
  }
  const src = fs.readFileSync(bulkPath, 'utf8');
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a < 0 || b < 0 || b < a) {
    throw new Error('PIXHIST-CORE markers not found in ' + bulkPath + ' — did bulk.js move/rename them?');
  }
  // Slice from the END of the START marker line to the START of the END marker line, so the marker comment
  // text itself is not part of the evaluated body.
  const startLineEnd = src.indexOf('\n', a);
  const endLineStart = src.lastIndexOf('\n', b);
  const body = src.slice(startLineEnd + 1, endLineStart);
  // The body is a run of `const`/`function` declarations. Wrap it and return the two functions we need. If a
  // future edit adds a stray reference to something DOM/OE, this throws loudly instead of silently mis-computing.
  let factory;
  try {
    factory = new Function(body + '\n;return { _pixHistFromData, _pixFamily };');
  } catch (e) {
    throw new Error('PIXHIST-CORE failed to parse as standalone JS: ' + e.message);
  }
  const api = factory();
  if (typeof api._pixHistFromData !== 'function') throw new Error('_pixHistFromData not found in PIXHIST-CORE');
  return api;
}

const DEFAULT_BULK = path.join(__dirname, '..', '..', 'bulk.js');

module.exports = { loadPixHistCore, readPixhistVersion, DEFAULT_BULK };
