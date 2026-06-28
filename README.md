# DTI Remix

A full, accessibility-focused **reskin of Neopets [Dress to Impress](https://impress.openneo.net/)** — reworked UI plus a large set of new features for easier NC inventory / closet / wishlist management. Runs as a single client-side Tampermonkey userscript. Not affiliated with or monetized off DTI (DTI is open source, by Matchu / OpenNeo).

## Install (for users)

1. Install **[Tampermonkey](https://www.tampermonkey.net/)** in Chrome (or another userscript manager).
2. Open this link — Tampermonkey will show its **Install** page; click **Install**:
   **https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js**
3. Open **https://impress.openneo.net/** and hard-refresh (`Ctrl+Shift+R`).

That's it — you only ever install that one tiny loader. It downloads the full reskin (`bulk.js`) from this repo, caches it locally, and quietly auto-updates in the background. You never install or update `bulk.js` yourself.

> If a page looks unstyled, hard-refresh once more (the reskin downloads on first visit, then it's instant).

## What's in the repo

| File | What it is |
| --- | --- |
| `DTI_Remix_LOADER.user.js` | The tiny userscript users install. Shows an instant cover (kills the cold-load flash), then fetches + runs `bulk.js` from this repo (cache-first, ETag-revalidated). |
| `bulk.js` | The full reskin / all features (~3 MB). Fetched at runtime by the loader — **not** installed directly. |

## Updating (for the maintainer)

- **Reskin/feature changes** → edit `bulk.js`, then upload it here (**Add file → Upload files → drag `bulk.js` → Commit**). Users get it on their next refresh (2nd refresh after a push, due to ETag cache-then-revalidate; GitHub raw is also CDN-cached ~5 min).
- **Loader changes** (e.g. new `@match`) → bump the loader's `@version` and upload it; Tampermonkey auto-updates it for users via `@updateURL`.
- `node --check bulk.js` before uploading.

## Notes

- Everything is client-side. It reads the already-loaded inventory DOM and the same public customization CDN assets DTI itself loads — it never performs write/account actions against neopets.com.
