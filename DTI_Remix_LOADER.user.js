// ==UserScript==
// @name         DTI Remix
// @version      1.0.0
// @namespace    dti-remix
// @description  DTI Remix — a full accessible reskin of Neopets Dress to Impress. Tiny loader: shows an instant cover (kills the cold-load flash), then runs the full reskin from GitHub (downloaded once, cached, auto-updates in the background).
// @author       teacup-chariot
// @match        *://*.neopets.com/inventory.phtml*
// @match        *://*.neopets.com/safetydeposit.phtml*
// @match        *://*.neopets.com/stylingchamber*
// @match        *://*.neopets.com/gallery/*
// @match        *://impress.openneo.net/items*
// @match        https://impress.openneo.net/items
// @match        https://impress.openneo.net/items?*
// @match        https://impress.openneo.net/items/*
// @match        https://impress.openneo.net/
// @match        https://impress.openneo.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js
// @downloadURL  https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js
// ==/UserScript==

(function () {
  'use strict';

  // ── WHERE THE BIG FILE LIVES ────────────────────────────────────────────────
  var BULK_URL = 'https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/bulk.js';

  // ── 1) Instant cold-load cover (runs first; tiny so it injects before paint) ──
  (function () {
    try {
      var p = location.pathname, q = location.search;
      var route =
        /[?&]dti_sync=bulk(?:&|$)/.test(q) ? 'bulk' :
        /^\/items\/\d+\b/.test(p) ? 'item' :
        (p === '/' || p === '') ? 'home' :
        (/^\/user\/\d+[^/]*\/closet/.test(p) || /^\/your-outfits\b/.test(p)) ? 'closet' :
        /^\/outfits\//.test(p) ? 'outfit' : '';
      if (!route) return;
      var st = document.createElement('style');
      st.id = 'dtr-cold-cover-css';
      st.textContent = 'html.dtr-cold-cover::before{content:"";position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;background:#fdf7f0;opacity:var(--dtr-cover-op,1);transition:opacity 0.18s ease-out;pointer-events:none;}';
      (document.head || document.documentElement).appendChild(st);
      document.documentElement.classList.add('dtr-cold-cover');
      var done = false;
      var drop = function () {
        if (done) return; done = true;
        try {
          document.documentElement.style.setProperty('--dtr-cover-op', '0');
          setTimeout(function () { try { document.documentElement.classList.remove('dtr-cold-cover'); } catch (_) {} }, 220);
        } catch (e) { try { document.documentElement.classList.remove('dtr-cold-cover'); } catch (_) {} }
      };
      window.__dtrDropColdCover = drop;
      var visible = function () {
        if (route === 'bulk') return !!document.getElementById('dia-bulk-root');
        if (route === 'item') { var sh = document.getElementById('dia-shell'); return !!(sh && sh.classList.contains('dtr-shell-ready')); }
        if (route === 'home') return !!document.getElementById('dia-hp-page');
        if (route === 'closet') return !!document.getElementById('dia-closet-v2-root');
        if (route === 'outfit') return !!document.getElementById('dtr-outfit-editor');
        return document.readyState === 'complete';
      };
      var iv = setInterval(function () {
        if (visible()) { clearInterval(iv); try { requestAnimationFrame(drop); } catch (e) { drop(); } }
      }, 40);
      setTimeout(function () { clearInterval(iv); drop(); }, 15000);
    } catch (_dtrColdCoverErr) {}
  })();

  // ── 2) Run the bulk — CACHE-FIRST so it's instant after the first download ───
  function dropCover() { try { window.__dtrDropColdCover && window.__dtrDropColdCover(); } catch (_) {} }
  function runBulk(code) {
    if (!code) { dropCover(); return; }
    try { eval(code); }   // direct eval keeps the bulk in this sandbox (GM_* + unsafeWindow available)
    catch (e) { console.error('[DTR loader] bulk failed to run:', e); dropCover(); }
  }

  // Tiny IndexedDB key/value store (async, NOT preloaded, so it never delays the cover above).
  function idbOpen(cb) {
    try {
      var req = indexedDB.open('dtr-cache', 1);
      req.onupgradeneeded = function () { try { req.result.createObjectStore('kv'); } catch (_) {} };
      req.onsuccess = function () { cb(req.result); };
      req.onerror = function () { cb(null); };
    } catch (e) { cb(null); }
  }
  function idbGet(db, key, cb) {
    try { var r = db.transaction('kv', 'readonly').objectStore('kv').get(key); r.onsuccess = function () { cb(r.result); }; r.onerror = function () { cb(null); }; }
    catch (e) { cb(null); }
  }
  function idbSet(db, key, val) {
    try { db.transaction('kv', 'readwrite').objectStore('kv').put(val, key); } catch (e) {}
  }
  function etagOf(res) {
    try { return ((String(res.responseHeaders || '').match(/^etag:\s*(.*)$/im) || [])[1] || '').trim(); } catch (e) { return ''; }
  }
  function fetchBulk(cb) {
    try {
      GM_xmlhttpRequest({
        method: 'GET', url: BULK_URL, timeout: 45000,
        onload: function (res) {
          if (res && res.status >= 200 && res.status < 300 && res.responseText) cb(res.responseText, etagOf(res));
          else { console.error('[DTR loader] bulk fetch status', res && res.status); cb(null); }
        },
        onerror: function () { console.error('[DTR loader] bulk fetch error'); cb(null); },
        ontimeout: function () { console.error('[DTR loader] bulk fetch timeout'); cb(null); },
      });
    } catch (e) { console.error('[DTR loader] GM_xmlhttpRequest threw', e); cb(null); }
  }
  // Cheap background freshness check: HEAD for the etag; only re-download if it changed.
  function refreshIfChanged(db, cachedEtag) {
    try {
      GM_xmlhttpRequest({
        method: 'HEAD', url: BULK_URL, timeout: 20000,
        onload: function (res) {
          var et = etagOf(res);
          if (et && et !== cachedEtag) fetchBulk(function (code, newEt) { if (code) { idbSet(db, 'bulk', code); idbSet(db, 'etag', newEt || et); } });
        },
        onerror: function () {}, ontimeout: function () {},
      });
    } catch (e) {}
  }

  function loadFromGitHub() {
    idbOpen(function (db) {
      if (!db) { fetchBulk(function (code) { runBulk(code); }); return; }      // no IDB → just fetch+run
      idbGet(db, 'bulk', function (cached) {
        idbGet(db, 'etag', function (cachedEtag) {
          if (cached) {
            runBulk(cached);                       // INSTANT from local cache
            refreshIfChanged(db, cachedEtag || ''); // update in background for next load
          } else {
            fetchBulk(function (code, et) {         // first ever load: download, run, cache
              runBulk(code);
              if (code) { idbSet(db, 'bulk', code); idbSet(db, 'etag', et || ''); }
            });
          }
        });
      });
    });
  }

  loadFromGitHub();
})();
