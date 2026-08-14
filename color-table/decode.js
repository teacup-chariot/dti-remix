// Decode an item thumbnail buffer to the SAME RGBA pixels the browser hands _pixHistFromData.
//
// The browser does: new Image() → drawImage onto a fresh (transparent) canvas at native size (capped to 128,
// smoothing OFF) → getImageData. We mirror that: decode GIF frame-0 (omggif composites the palette + honours
// the transparent index onto transparent, exactly like an <img> on a blank canvas) or PNG (pngjs), then apply
// the identical cap-128 nearest downscale. Item thumbs are 80×80 so the cap never fires in practice → native
// pixels on both sides → byte-identical fractions.
'use strict';
const { GifReader } = require('omggif');
const { PNG } = require('pngjs');

const CAP = 128;   // must match bulk.js _pixHistCompute's cap

function decodeNative(buf) {
  const sig3 = buf.slice(0, 3).toString('latin1');
  const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (sig3 === 'GIF') {
    const r = new GifReader(buf);
    const W = r.width, H = r.height;
    const data = new Uint8Array(W * H * 4);     // zero-filled = transparent, like a blank canvas
    r.decodeAndBlitFrameRGBA(0, data);          // frame 0, palette + transparent index applied
    return { data, W, H };
  }
  if (isPng) {
    const png = PNG.sync.read(buf);             // RGBA, alpha preserved
    return { data: new Uint8Array(png.data.buffer, png.data.byteOffset, png.data.length), W: png.width, H: png.height };
  }
  throw new Error('unsupported image format (not GIF or PNG)');
}

// Nearest-neighbour downscale to the cap, mirroring canvas drawImage(...,W,H) with imageSmoothingEnabled=false.
// (Only runs for the rare >128px asset; 80×80 thumbs return unchanged.)
function applyCap(img) {
  const { data, W: sW, H: sH } = img;
  const sc = Math.min(1, CAP / Math.max(sW, sH));
  if (sc >= 1) return img;
  const dW = Math.max(1, Math.round(sW * sc));
  const dH = Math.max(1, Math.round(sH * sc));
  const out = new Uint8Array(dW * dH * 4);
  for (let y = 0; y < dH; y++) {
    const syo = Math.min(sH - 1, Math.floor(y * sH / dH)) * sW;
    for (let x = 0; x < dW; x++) {
      const sx = Math.min(sW - 1, Math.floor(x * sW / dW));
      const si = (syo + sx) * 4, di = (y * dW + x) * 4;
      out[di] = data[si]; out[di + 1] = data[si + 1]; out[di + 2] = data[si + 2]; out[di + 3] = data[si + 3];
    }
  }
  return { data: out, W: dW, H: dH };
}

function decodeToPixels(buf) {
  return applyCap(decodeNative(buf));
}

module.exports = { decodeToPixels, decodeNative, CAP };
