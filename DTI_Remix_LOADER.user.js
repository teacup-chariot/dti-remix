// ==UserScript==
// @name         DTI Remix
// @version      1.9.6
// @namespace    dti-remix
// @description  DTI Remix — a full accessible reskin of Neopets Dress to Impress. Tiny loader: shows an instant cover (kills the cold-load flash), then runs the full reskin from GitHub (downloaded once, cached, auto-updates in the background).
// @author       DTI Remix
// @match        *://*.neopets.com/inventory.phtml*
// @match        *://*.neopets.com/safetydeposit.phtml*
// @match        *://*.neopets.com/stylingchamber*
// @match        *://*.neopets.com/gallery/*
// @match        *://*.neopets.com/closet.phtml*
// @match        *://*.neopets.com/quickstock.phtml*
// @match        *://*.neopets.com/quickref.phtml*
// @match        *://*.neopets.com/neolodge.phtml*
// @match        *://impress.openneo.net/items*
// @match        https://impress.openneo.net/items
// @match        https://impress.openneo.net/items?*
// @match        https://impress.openneo.net/items/*
// @match        https://impress.openneo.net/
// @match        https://impress.openneo.net/*
// @match        *://impress-2020.openneo.net/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_listValues
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js
// @downloadURL  https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js
// ==/UserScript==

(function () {
  'use strict';

  if (location.hostname === 'impress-2020.openneo.net') {
    try {
      var _p2020 = location.pathname, _to = '';
      var _u = _p2020.match(/^\/user\/(\d+)(?:\/(?:lists|items|closet)?)?\/?$/);
      var _i = _p2020.match(/^\/items\/(\d+)/);
      var _o = _p2020.match(/^\/outfits\/(\d+)/);
      if (_u) _to = 'https://impress.openneo.net/user/' + _u[1] + '/closet';
      else if (_i) _to = 'https://impress.openneo.net/items/' + _i[1];
      else if (_o) _to = 'https://impress.openneo.net/outfits/' + _o[1];
      else if (_p2020 === '/your-outfits') _to = 'https://impress.openneo.net/your-outfits';
      else if (_p2020 === '/' || _p2020 === '') _to = 'https://impress.openneo.net/';
      if (_to) location.replace(_to);
    } catch (_dtr2020Err) {}
    return;
  }

  var BULK_URL = 'https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/bulk_clean.js';

  var bulkTried = false;

  (function () {
    try {
      var p = location.pathname, q = location.search;
      var route =
        /[?&]dti_sync=bulk(?:&|$)/.test(q) ? 'bulk' :
        /^\/items\/\d+\b/.test(p) ? 'item' :
        (p === '/' || p === '') ? 'home' :
        (/^\/user\/\d+[^/]*\/closet/.test(p) || /^\/your-outfits\b/.test(p)) ? 'closet' :
        /^\/outfits\//.test(p) ? 'outfit' : '';

      if (!route) {
        if (location.hostname !== 'impress.openneo.net') return;
        route = 'any';
      }

      var coverBg = '#fdf7f0';
      try {
        var _sk = GM_getValue('dtr:theme:current');
        if (_sk === undefined || _sk === null || _sk === '') _sk = GM_getValue('dib-theme');
        if (_sk === 'lychee') coverBg = '#f9edeb';
        if (_sk === 'blacksesame') coverBg = '#26221f';
        if (_sk === 'ubejelly') coverBg = '#ddd2e3';
      } catch (_dtrThemeReadErr) {}
      var st = document.createElement('style');
      st.id = 'dtr-cold-cover-css';
      st.textContent = 'html.dtr-cold-cover::before{content:"";position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483646;background:' + coverBg + ';opacity:var(--dtr-cover-op,1);transition:opacity 0.18s ease-out;pointer-events:none;}';
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
        if (route === 'any') return (!!document.getElementById('dia-critical-early-css') && document.readyState !== 'loading') || (bulkTried && document.readyState === 'complete');
        return document.readyState === 'complete';
      };
      var iv = setInterval(function () {
        if (visible()) { clearInterval(iv); try { requestAnimationFrame(drop); } catch (e) { drop(); } }
      }, 40);
      setTimeout(function () { clearInterval(iv); drop(); }, 15000);
    } catch (_dtrColdCoverErr) {}
  })();

  try {
    if (location.hostname === 'impress.openneo.net' && /^\/your-outfits(?:$|[/?#])/.test(location.pathname)) {
      window.__DTR_YO_PREFETCH = fetch('/your-outfits.json', { headers: { 'Accept': 'application/json' } });
      window.__DTR_YO_PREFETCH.catch(function () {});
    }
  } catch (_dtrYoPrefetchErr) {}

  function dropCover() { try { window.__dtrDropColdCover && window.__dtrDropColdCover(); } catch (_) {} }
  function runBulk(code) {
    bulkTried = true;
    if (!code) { dropCover(); return; }
    try { eval(code); }
    catch (e) { console.error('[DTR loader] bulk failed to run:', e); dropCover(); }
  }

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
      if (!db) { fetchBulk(function (code) { runBulk(code); }); return; }
      idbGet(db, 'bulk', function (cached) {
        idbGet(db, 'etag', function (cachedEtag) {
          if (cached) {
            runBulk(cached);
            refreshIfChanged(db, cachedEtag || '');
          } else {
            fetchBulk(function (code, et) {
              runBulk(code);
              if (code) { idbSet(db, 'bulk', code); idbSet(db, 'etag', et || ''); }
            });
          }
        });
      });
    });
  }

  var devPreview = false;
  try {
    var gmDev = GM_getValue('dtr_dev', 0);
    devPreview = (gmDev === 1 || gmDev === true || gmDev === '1') || (localStorage.getItem('dtr_dev') === '1');
  } catch (_) { try { devPreview = (localStorage.getItem('dtr_dev') === '1'); } catch (__) {} }
  if (devPreview) {
    try {
      GM_xmlhttpRequest({

        method: 'GET', url: 'http://localhost:8731/bulk.js', timeout: 800,
        onload: function (res) {
          if (res && res.status >= 200 && res.status < 300 && res.responseText) {
            console.log('%c[DTR] PREVIEW MODE — running bulk.js from your local dev helper (not GitHub)', 'color:#3a7a5e;font-weight:700');
            runBulk(res.responseText);
          } else { loadFromGitHub(); }
        },
        onerror: function () { loadFromGitHub(); },
        ontimeout: function () { loadFromGitHub(); },
      });
    } catch (e) { loadFromGitHub(); }
  } else {
    loadFromGitHub();
  }
})();
