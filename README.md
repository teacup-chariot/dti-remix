# DTI Remix

A full, accessibility-focused **reskin of Neopets [Dress to Impress](https://impress.openneo.net/)** — reworked UI plus a large set of new features for easier NC inventory / closet / wishlist management. Runs as a single client-side Tampermonkey userscript. Not affiliated with or monetized off DTI (DTI is open source).

## Install (for users)

1. Install **[Tampermonkey](https://www.tampermonkey.net/)** in Chrome (or another userscript manager).
2. Open this link — Tampermonkey will show its **Install** page; click **Install**:
   **https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js**
3. Open **https://impress.openneo.net/** and hard-refresh (`Ctrl+Shift+R`).

That's it — you only ever install that one tiny loader. It downloads the full reskin (`bulk_clean.js`) from this repo, caches it locally, and quietly auto-updates in the background. You never install or update it yourself.

> If a page looks unstyled, hard-refresh once more (the reskin downloads on first visit, then it's instant).

## What's in the repo

| File | What it is |
| --- | --- |
| `DTI_Remix_LOADER.user.js` | The tiny userscript users install. Shows an instant cover (kills the cold-load flash), then fetches + runs `bulk_clean.js` from this repo (cache-first, ETag-revalidated). |
| `bulk_clean.js` | Production build made from `bulk.js` by `node build-clean.js` (comments + `console.*` stripped). **This is what the loader fetches from GitHub.** |
| `color-table.json` | Precomputed color-family data for the whole wearable catalog (~27k items, ~2.7 MB / ~0.6 MB gzipped), so color filtering in the Outfit Editor is an instant **lookup** instead of thousands of in-browser image reads. The reskin fetches it from this repo once and caches it by version. **Optional / self-healing:** if it's missing, stale, or a newer item isn't in it yet, color filtering still works — it just computes those items on the fly (the old, slower way). Built + refreshed by `tools/color-table/` (see that folder's README). |

## Notes

- Everything is client-side. It reads the already-loaded inventory DOM and the same public customization CDN assets DTI itself loads — it never performs write/account actions against neopets.com.
