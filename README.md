# DTI Remix

DTI Remix is a browser userscript that adds accessibility, organization, and
quality-of-life tools to **[Dress to Impress](https://impress.openneo.net/)**.

Having started out as a tool for managing a large NC collection, DTI Remix grew
over four months of development and iteration to include importing, color search, outfit
variants, comparisons, trade planning, saved context, larger controls, petpet
and petpetpet matching, easy NC Pet Style token previews and management, sorting
by latest, and visibility into NC Mall item launches.

DTI Remix is shaped by years of participation in the customization community and months of closer attention to how players actually use DTI, the NC Mall, and customization on Neopets.com. Conversations with casual customizers, collectors with thousands of wearables, and traders at every level, along with discussions across Neocord, Neopets Nation, and /r/neopets, surfaced the same pain points, time sinks, and “I wish DTI could do this” moments again and again.

Accessibility is part of the project throughout, with larger targets, fewer repetitive actions, clearer state, and keyboard navigation
across key parts of the interface.

DTI Remix is free, has no ads or paid features, and is shared as an unofficial
fan project.

<p align="center">
  <img src="https://i.ibb.co/jP0zkSy4/dti-remix.png" alt="DTI Remix" width="520">
</p>

### Why a userscript?

When Flash support ended, Dress to Impress helped revive the customization scene. Thanks
to years of work and maintenance from its creator, DTI became a household name
among Neopians and a tool customizers rely on every day.

Replacing it was never the goal. Players already know and love DTI, and it's
where years of outfits, lists, and collection data live. Since DTI is open
source, building on top of it made much more sense. DTI Remix can add new tools
without asking anyone to leave DTI or start over somewhere else.

It also means DTI Remix doesn't need player accounts or its own database of
personal data.

## About the project

DTI Remix isn't affiliated with or endorsed by Neopets. All Neopets characters,
artwork, images, names, and related marks belong to their respective owners.

The source is public so anyone can inspect what the script does. DTI Remix is
not on the list of approved userscripts. The software is provided as-is, without
warranty, and is used at your own risk.

------------------------------------------------------------------------

## Installing

DTI Remix is a userscript and requires a userscript manager.

### Chrome, Edge, Brave, Opera

1. Install **[Tampermonkey](https://www.tampermonkey.net/)** and pin it
 to your toolbar.
2. Open
 **https://raw.githubusercontent.com/teacup-chariot/dti-remix/main/DTI_Remix_LOADER.user.js**.
 Tampermonkey will open an install page.
3. Click **Install**.
4. Go to **https://impress.openneo.net/** and refresh. The first visit
 downloads the main script. Refresh once more after it finishes.

If you're installing through **Greasy Fork**, its install button hands the same
loader to your userscript manager.

### Safari on macOS

1. Install **Tampermonkey** for Safari from the Mac App Store, then
 enable it in **Safari → Settings → Extensions**.
2. Follow steps 2 through 4 above.

### Safari on iPad

1. Install **Tampermonkey** from the App Store, enable it in **Settings
 → Safari → Extensions**, and allow it on `impress.openneo.net`.
2. Follow steps 2 through 4 above.

### What you're installing

The installed userscript is a small loader. It fetches `bulk_clean.js` from this
repository, caches it, and checks for updates in the background.

> If a page loads without DTI Remix styling immediately after
> installation, refresh once more after the initial script download
> finishes.

------------------------------------------------------------------------

## Browser support

**Chrome (desktop):** Fully supported
**Edge, Brave, Opera:** Supported
**Safari (macOS):** Supported
**Safari on iPad:** Limited; some layout issues and slower performance
**Firefox:** Untested

------------------------------------------------------------------------

# Privacy and Neopets access

DTI Remix doesn't ask for, read, store, or transmit Neopets passwords or login
credentials. It doesn't buy, sell, move, discard, equip, submit, or otherwise
change anything on a Neopets account.

Its Neopets import helpers read specific information from pages already open in
the browser. Inventory, Safety Deposit Box, closet, and gallery contents aren't
sent to DTI Remix-operated servers.

**The creator of DTI Remix can't view your notes, customizations, import data,
or other information about you or how you use DTI or DTI Remix.** The only data
sent to DTI Remix-operated services is what's listed below.

## Neopets import pages

| Page | Reads | Keeps locally | Sends to Neopets |
| --- | --- | --- | --- |
| **Inventory** `www.neopets.com/inventory.phtml` | Wearable item names and quantities, plus displayed information used to identify relevant item and Pet Style types | Import queue and import state | Nothing |
| **Safety Deposit Box** `www.neopets.com/safetydeposit.phtml` | Item names, quantities, and displayed metadata used to classify relevant items | Import data and pagination progress | Nothing |
| **Closet** `www.neopets.com/closet.phtml` | Item names, quantities, and displayed metadata used to classify items as NC, NP, or Paint Brush items | Import data and pagination progress | Nothing |
| **Gallery** `www.neopets.com/gallery/…` | Displayed item names; each displayed entry is imported as one copy | Import queue and import state | Nothing |
| **Styling Chamber** `www.neopets.com/stylingchamber/` | Displayed Pet Style token names | Owned Pet Styles and observed copy counts | Nothing |
| **Neolodge** `www.neopets.com/neolodge.phtml` | Pet names shown in the pet selector and displayed pet images | Pet import state | Nothing |


## Neopets network traffic

Automatic Neopets traffic from DTI Remix is limited to image loads from
`images.neopets.com` and `pets.neopets.com`. Links to Neopets and the NC Mall
load only when clicked.

To verify this, open DevTools → **Network**, use DTI Remix, and filter for
`neopets.com`.

------------------------------------------------------------------------

# External services

Most DTI Remix data stays in browser storage. The script also uses the following
external services.

| Service | Domain | Used for |
| --- | --- | --- |
| **Dress to Impress** | `impress.openneo.net` | Loading pets, saving outfits, editing lists, and importing items into a DTI closet using the existing DTI session. |
| **DTI GraphQL API** | `impress-2020.openneo.net/api/graphql` | Item search, item information, and appearance data used by DTI Remix features. |
| **DTI outfit images** | `outfits.openneo-assets.net` | Outfit images displayed by DTI Remix. |
| **GitHub** | `raw.githubusercontent.com` | Hosting the script and supporting data files that DTI Remix downloads and caches. Neopets and DTI account data isn't attached to these requests. |
| **itemdb proxy** | `dtr-itemdb.…workers.dev` | Item and petpet lookups through the cached itemdb proxy. |
| **itemdb** | `itemdb.com.br` | Ordinary links and a logo image. Itemdb lookups use the proxy above. |
| **Lebron values** | `lebron-values.netlify.app` | The cap values shown on item cards, in the closet, and in the Copy panel. One download of a public values file, cached for two days. Neopets and DTI account data isn't attached to the request. |
| **Pet Style measurements** | `dtr-style-sink.…workers.dev` | Receives the **pet name and Pet Style ID** when a missing Pet Style preview measurement is needed. No Neopets username, inventory, credentials, or other Neopets account data is included. |
| **Anonymous usage counter** | `dtr-count.…workers.dev` | Receives a random locally generated installation ID and cache-busting timestamp at most once per UTC day. The ID isn't derived from a Neopets or DTI account and doesn't include usernames, pet names, inventory, closet, SDB, gallery contents, or activity history. |
| **Google Fonts** | `fonts.googleapis.com` | Font resources used by the interface. Neopets and DTI account data isn't attached to the request. |
| **CreateJS** | `code.createjs.com` | Animation support for animated item previews. Loaded only when needed. |

Standard network metadata, including IP address and browser headers, is visible
to the destination server for web requests. This information is not visible to
the creator of DTI Remix or other users of this script.

## Local storage

Settings, themes, import state and history, notes, trade-planning information,
and feature caches are stored in DTI Remix's Tampermonkey userscript storage.

That storage belongs to the Tampermonkey installation in that browser profile,
so DTI Remix data doesn't automatically transfer to another browser, browser
profile, or device.

Clearing normal browser cache doesn't clear DTI Remix's Tampermonkey storage.
Stored values can be viewed in **Tampermonkey Dashboard → DTI Remix → Storage**.

### Backing up or moving DTI Remix

Before uninstalling Tampermonkey or resetting its extension data, open
**Tampermonkey Dashboard → Utilities → Export**, include userscript storage in
the backup, and save the export. It can be restored later from the same
Utilities page.

The same backup can be used to move DTI Remix data to another browser or device.
This copies the data at the time of the export. **The two installations won't
stay in sync afterward.**

------------------------------------------------------------------------

## What's in this repository

| File or folder | What's in it |
| --- | --- |
| `DTI_Remix_LOADER.user.js` | The userscript loader. Fetches, caches, and updates the main file. |
| `bulk_clean.js` | The main DTI Remix application. |
| `item-index.json` | Local wearable item index used for browsing and filtering. |
| `color-table.json` | Pre-computed color data used by color filtering. |
| `style-index.json` | Pet Style names and release dates that aren't available through the live API. |
| `color-table/` | Scripts that generate the item, color, and style data files from DTI's public data. |
| `active-box/` | Scripts that measure the Neoboards active-pet preview crop for Pet Styles. |
| `.github/workflows/` | Scheduled jobs that refresh the data files and check for new Pet Style measurements. |

The three data files are optional. If one is missing or doesn't include a newly
released item yet, DTI Remix can work it out as needed. Those results may take a
little longer to load.

---

## Technical info

- **Architecture:** The loader and single-file userscript require no client
  build step. The script is cached in extension storage with ETag revalidation
  and runs at `document-start`.
- **Rendering:** The interface uses the DOM directly. CreateJS loads only for
  animated item previews. Pet previews composite DTI's public layer images.
- **Data:** Item, color, and style indexes are generated from DTI's public data
  by a nightly GitHub Action and committed as JSON. Color filtering uses a
  local lookup plus one batched query.
- **Services:** Three Cloudflare Workers handle the itemdb cache/proxy, Pet
  Style preview measurement collection and validation, and the daily usage
  counter. None are required for the core app.
- **Neopets:** DTI Remix makes no programmatic account-action requests.
  Automatic traffic is limited to image loads. Importers read the loaded page
  DOM, and imported account data isn't sent to DTI Remix-operated servers.
- **Tooling:** Claude Code is used during the development process. The experience,
  layout, interaction patterns, components, and architectural decisions were
  designed and drafted by the creator of DTI Remix.
- **Testing:** The automated test suite covers storage, routing, color tokens,
  DOM adapters, and icon usage, and a theme audit checks color-token
  compliance. The full suite is run before every push.

------------------------------------------------------------------------

## Credits and thanks

- **Dress to Impress**, the foundation DTI Remix is built on.
- **itemdb**, for mall data, as well as p2/p3, color filtering.
- **The early test Meepits**, for invaluable feedback and patience.

Neopets is a trademark of its respective owners. This project is unaffiliated
with them.

------------------------------------------------------------------------

## Contact

To report a bug, provide feedback, or simply get in touch, reach out to dti.remix@gmail.com :)
