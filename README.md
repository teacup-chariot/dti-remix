# DTI Remix

A full, accessibility-focused **reskin of Neopets [Dress to Impress](https://impress.openneo.net/)** — reworked UI plus a large set of new features for easier NC inventory / closet / wishlist management. Runs as a single client-side Tampermonkey userscript. Not affiliated with or monetized off DTI (DTI is open source, by Matchu / OpenNeo).

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
| `bulk.js` | The full reskin / all features (~3.4 MB), WITH comments + console logs — the **dev source** you edit. Served locally by `dev-server.js` in preview mode; not shipped directly. |
| `bulk_clean.js` | Production build made from `bulk.js` by `node build-clean.js` (comments + `console.*` stripped). **This is what the loader fetches from GitHub.** |
| `color-table.json` | Precomputed color-family data for the whole wearable catalog (~27k items, ~2.7 MB / ~0.6 MB gzipped), so color filtering in the Outfit Editor is an instant **lookup** instead of thousands of in-browser image reads. The reskin fetches it from this repo once and caches it by version. **Optional / self-healing:** if it's missing, stale, or a newer item isn't in it yet, color filtering still works — it just computes those items on the fly (the old, slower way). Built + refreshed by `tools/color-table/` (see that folder's README). |

## Updating (for the maintainer)

> **Who does what:** the assistant (Claude) edits `bulk.js` and runs `node build-clean.js` to produce `bulk_clean.js`. **I (the maintainer) do the GitHub step myself, by hand, through the GitHub website — I do not use the terminal or git commands.** So a hand-off is done when `bulk_clean.js` is regenerated and syntax-clean; the assistant should never try to commit or push — it just tells me the file is ready and I upload it.

- **Reskin/feature changes** → edit `bulk.js`, then run `node build-clean.js` to regenerate `bulk_clean.js`, and I upload **`bulk_clean.js`** here by hand (**Add file → Upload files → drag `bulk_clean.js` → Commit**). Users get it on their next refresh (2nd refresh after a push, due to ETag cache-then-revalidate; GitHub raw is also CDN-cached ~5 min).
- **Loader changes** (e.g. new `@match`) → bump the loader's `@version` and upload it; Tampermonkey auto-updates it for users via `@updateURL`.
- **Color table refresh** (folds newly-launched items into the fast lookup) → the assistant regenerates `color-table.json` via `tools/color-table/`, and I upload **`color-table.json`** here by hand, exactly like `bulk_clean.js` (**Add file → Upload files → drag `color-table.json` → Commit** — it lives at the repo root, next to `bulk_clean.js`, *not* inside the `tools/color-table` folder). This is **occasional, not per-change**: new items always work without it, so a missing or stale table never breaks anything — it's purely a speed cache. The assistant owns noticing when a refresh is worthwhile and hands me the file; I never track versions or run anything.

> `bulk.js` is run via `eval()`, so one syntax error breaks it for everyone. Each edit is validated with `node --check bulk.js` before it's handed off — you just upload.

## Notes

- Everything is client-side. It reads the already-loaded inventory DOM and the same public customization CDN assets DTI itself loads — it never performs write/account actions against neopets.com.
