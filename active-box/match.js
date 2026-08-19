// Shared template-matcher: locate Neopets' baked 50×50 active-box avatar inside the 300px render of
// the SAME hash (identical render at two scales → normalized cross-correlation peaks sharply at the
// true crop). Returns { x, y, size, score } normalized 0..1 over the render frame.
'use strict';
const { PNG } = require('pngjs');
const fs = require('fs');

function decode(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

// Bilinear resize RGBA
function resize(img, w, h) {
  const out = { width: w, height: h, data: Buffer.alloc(w * h * 4) };
  for (let y = 0; y < h; y++) {
    const sy = ((y + 0.5) * img.height) / h - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(img.height - 1, y0 + 1);
    const fy = sy - y0;
    for (let x = 0; x < w; x++) {
      const sx = ((x + 0.5) * img.width) / w - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(img.width - 1, x0 + 1);
      const fx = sx - x0;
      for (let c = 0; c < 4; c++) {
        const p00 = img.data[(y0 * img.width + x0) * 4 + c];
        const p01 = img.data[(y0 * img.width + x1) * 4 + c];
        const p10 = img.data[(y1 * img.width + x0) * 4 + c];
        const p11 = img.data[(y1 * img.width + x1) * 4 + c];
        out.data[(y * w + x) * 4 + c] =
          p00 * (1 - fx) * (1 - fy) + p01 * fx * (1 - fy) + p10 * (1 - fx) * fy + p11 * fx * fy;
      }
    }
  }
  return out;
}

// NCC of template T (RGBA, with alpha mask) against search image I at (ox, oy), sampling every
// `step`-th masked pixel. Composites both over the same mid-grey so alpha regions are comparable.
function nccAt(T, I, ox, oy, samples) {
  let sumT = 0, sumI = 0, sumTT = 0, sumII = 0, sumTI = 0, n = 0;
  for (let k = 0; k < samples.length; k += 3) {
    const tx = samples[k], ty = samples[k + 1];
    const ti = (ty * T.width + tx) * 4;
    const ii = ((oy + ty) * I.width + (ox + tx)) * 4;
    const ta = T.data[ti + 3] / 255, ia = I.data[ii + 3] / 255;
    for (let c = 0; c < 3; c++) {
      const tv = T.data[ti + c] * ta + 128 * (1 - ta);
      const iv = I.data[ii + c] * ia + 128 * (1 - ia);
      sumT += tv; sumI += iv; sumTT += tv * tv; sumII += iv * iv; sumTI += tv * iv; n++;
    }
  }
  const mT = sumT / n, mI = sumI / n;
  const vT = sumTT / n - mT * mT, vI = sumII / n - mI * mI;
  if (vT <= 1e-6 || vI <= 1e-6) return -1;
  return (sumTI / n - mT * mI) / Math.sqrt(vT * vI);
}

// Build sample list from template alpha (or all pixels if opaque), roughly `target` points.
function buildSamples(T, target) {
  const pts = [];
  for (let y = 0; y < T.height; y++)
    for (let x = 0; x < T.width; x++)
      if (T.data[(y * T.width + x) * 4 + 3] > 16) pts.push(x, y, 0);
  const total = pts.length / 3;
  if (total === 0) return null; // fully transparent template (invisible pets)
  const stride = Math.max(1, Math.floor(total / target));
  const out = [];
  for (let i = 0; i < pts.length; i += 3 * stride) out.push(pts[i], pts[i + 1], 0);
  return out;
}

// Find the crop: search sizes szMin..szMax (in search-image px), positions on a grid, then refine.
function findCrop(avatarFile, fullFile, opts) {
  opts = opts || {};
  const A = decode(avatarFile);   // 50×50
  const F = decode(fullFile);     // 300×300 (or whatever)
  const S = F.width;
  const szMin = Math.round((opts.fracMin || 0.18) * S);
  const szMax = Math.round((opts.fracMax || 0.50) * S);
  let best = { score: -2, x: 0, y: 0, s: szMin };
  // coarse
  for (let s = szMin; s <= szMax; s += 4) {
    const T = resize(A, s, s);
    const samples = buildSamples(T, 400);
    if (!samples || samples.length < 60) return { failed: 'empty-template' };
    const step = Math.max(2, Math.round(s * 0.04));
    for (let oy = 0; oy + s <= F.height; oy += step) {
      for (let ox = 0; ox + s <= S; ox += step) {
        const sc = nccAt(T, F, ox, oy, samples);
        if (sc > best.score) best = { score: sc, x: ox, y: oy, s };
      }
    }
  }
  // refine (full-ish sampling, ±5 px, ±3 size)
  let fine = best;
  for (let s = Math.max(szMin, best.s - 3); s <= Math.min(szMax, best.s + 3); s++) {
    const T = resize(A, s, s);
    const samples = buildSamples(T, 1600);
    if (!samples) continue;
    for (let oy = Math.max(0, best.y - 5); oy <= Math.min(F.height - s, best.y + 5); oy++) {
      for (let ox = Math.max(0, best.x - 5); ox <= Math.min(S - s, best.x + 5); ox++) {
        const sc = nccAt(T, F, ox, oy, samples);
        if (sc > fine.score) fine = { score: sc, x: ox, y: oy, s };
      }
    }
  }
  return {
    x: fine.x / S, y: fine.y / S, size: fine.s / S,
    cx: (fine.x + fine.s / 2) / S, cy: (fine.y + fine.s / 2) / S,
    score: fine.score,
  };
}

module.exports = { findCrop, decode, resize, nccAt, buildSamples };
