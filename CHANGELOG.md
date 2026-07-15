# DTI Remix — Changelog

<!-- ── UNRELEASED: running draft, updated as features land in preview. At push: date the heading,
     give it a theme label, final copy-edit (net effect only — collapse superseded churn), and move
     on. Never delete items from here except when the feature itself was removed before shipping. ── -->
## Unreleased

## July 15, 2026 — Color filters everywhere: your closet, others' closets & Pet Styles

### Enhancements
- **Closet:** **Filter your closet by color.** The same color filter from the item search is now in your closet — pick up to three color families to narrow your lists down to just those items, from one compact color button sitting right by the zone filter. Works alongside the zone filter and the NC/NP toggle.
- **Closet (visiting):** The color filter works on **other people's closets** too, so you can quickly find the reds (or the pastels, or the blues) in someone's trade list without scrolling through everything.
- **Customize & Homepage:** **Filter Pet Styles by color.** Both Pet Style pickers now take a color filter — pick a color and the matching styles show as individual tiles instead of grouped sets. There's also a new **compact view** (the grid button by the ⚙) that shrinks the thumbnails so you can scan far more styles at once.
- **Customize:** Color filtering is **steadier and clearer.** A live counter shows how many items it's checked so far, it plainly tells you when every result is loaded, and it now scans the whole catalog to the end instead of occasionally stopping short. The status message stays pinned at the bottom instead of jumping around while you're reading it.

### Fixes
- **Customize:** **More accurate color matching** — picture frames, foregrounds and garlands (the ones with a plain white pet area behind them) are no longer wrongly counted as white, so a **white** filter returns genuinely white items.
- **Customize:** Switching the color **source** (DTI ↔ itemdb) no longer throws away the results and re-scans everything from scratch — it reuses what it already found.
- **Customize:** Sorting color results by **value** or **newest** no longer stops short of the full set.
- **Everywhere:** **Pets that only come in a single pose** — like Baby Varwolf — now load properly in the editor and previews instead of coming up blank.
- **Closet:** The **bulk-action bar** (when you've selected several items) now stands out as its own clear card instead of blending into the page, with cleaner Add-to-Haul and Remove buttons.
- **Closet:** Cleared out a **stray leftover button** that could appear in the Try On Haul panel when you reached your closet by clicking through the site.

## July 13, 2026 — Two color sources & easier closet cleanup

### Enhancements
- **Customize:** **Two ways to filter by color now.** Pick the **source** right in the color filter: **DTI**, which reads an item's actual artwork (items that *are* that color), or **itemdb**, which uses its stored color data (items that *have* that color anywhere, a broader net) — switch between them for more variety in what turns up. There's a **?** that explains it all in plain language, and the whole control is more compact and tucks neatly by the sort dropdown.
- **Customize:** The **petpet browser's color filter now matches the item search** — same color dots and DTI/itemdb source choice.
- **Closet:** **Removing an item is simpler.** Step its quantity down to zero (or type 0) and it's gone — no more separate trash button — with a quick **Undo** in case you change your mind.

### Fixes
- **Closet:** Addressed a bug where removing an item with the trash can wasn't firing the delete, so it came back on refresh.
- **Closet:** The clipboard button no longer pops up over the quantity buttons (no more misclicks), and a deleted item no longer lingers in the "items selected" bar.

## July 12, 2026 — Petpets & petpetpets, color filter & Pet Style trading

### Enhancements
- **Customize (new!):** **Petpets and petpetpets are here!** The two little slots under your pet's preview are now real. Click one to browse: petpets open a two-step browser — pick the petpet, then pick its paint color — and petpetpets are a single list, both with current prices, search, and A–Z / Price / Newest sorting. Searching understands partial words in any order, and typing something like "faerie" also finds every painted Faerie petpet directly. The petpet browser also filters by **colorway** (Faerie, Halloween, Christmas...) from a dropdown, and by **visual color** with the same color dots the item search uses — combine them for things like "pink Faerie petpets". Picking doesn't close the browser (and your pet + slots stay bright while it's open, so you can see the trio together); it even pops out into a floating window you can drag around and resize from the corner, just like the Pet Style picker. Ask for a color across "Any colorway" and it quietly scans every painted petpet in the background — close the browser if you like; the Petpet slot shows a little progress pill, keeps going even if you leave the page and come back, and glows when it's done. Your choices show in their own spots below your pet, save with the outfit, and a tiny ✕ removes them. Item data comes from the wonderful [itemdb](https://itemdb.com.br), with thanks to their team for the green light.
- **Customize (new!):** **Filter items by color!** The long-promised Color filter in the item search is real: pick a color family (Red, Brown, Pink...) and you get items that are **mainly** that color — no search or zone needed, it browses everything that fits your pet, scanning the whole catalog on its own with a live "checked X of Y" count so you always know where it's at. Pick more than one color and a simple choice appears: **Any of these** (items that are mainly any one of them) or **All of these** (items that combine them). Works together with the NC/NP, Owned, and zone filters. It's marked **Beta** — the color matching is still being refined, so you may spot the odd wrong match for now. Color data from [itemdb](https://itemdb.com.br).
- **Customize:** **Contenders & Combos.** Tap the little ♥ on any petpet color or petpetpet to save it as a contender while you keep browsing — each picker has a ♥ filter to see your shortlist, and contenders save with the outfit. A **Combos** button opens the builder, where you pair your hearted petpets and petpetpets into saved combinations (the same petpet can star in as many combos as you like), then flip through them right on the page with ‹ › arrows. The builder's shelves scroll tall so you can see everything, and you can prune a shelf with the little ✕ (with a few seconds to undo).
- **Everywhere:** **Your petpet picks follow the outfit around.** Once you've chosen a petpet or petpetpet, it shows on the variant cards under the editor, in the Details comparison, on the shared collage image, and on your Your Outfits cards — and outfits without one don't waste any space on it.
- **Pet Styles:** The board now speaks **trade**: your lists and share collage say **Offering** and **Seeking** instead of Owned and Wished, and the offer text flips meaning correctly (on a style you want, it's what you're offering; on a style you're trading away, it's what you're seeking for it). You can also mark styles **Offers welcome**, **Pending trade**, or **Top priority** — the badges print on the share image and copy into your list. The collage includes both your Seeking and Offering sides now, never cuts off offer text, and the copy window counts characters against the neoboards' 500-per-post limit.
- **Customize & Homepage:** The **Pet Style picker got a matching makeover** — the same soft pastel look as the new petpetpet browser: candy-stripe top, pill-shaped search and filters, floatier style cards, and the whole thing now wears the site's warm coral-pink accent instead of teal. Everything works exactly as before.
- **Customize:** A **Shrink canvas** toggle near the top drops your pet preview to roughly its real Neopets size for a truer look, then expands back — no layout jumping either way.
- **Customize:** **Sharing your variants is friendlier.** "Compare variants" is now **Details**, and a **Share as** menu lets you tick exactly what to include — pet data, petpet & petpetpet, and item details — when you copy a set of variants as a collage to your clipboard. Your ticks only change what's copied, never the on-screen view.
- **Customize:** Opening a **custom someone shared with you** now shows a clear banner that it isn't yours, with a one-click **Save a copy** in the usual spot — and once you save, it becomes fully yours.

### Fixes
- **Customize:** Clicking **Pet Styles** in the header from the Customize screen now takes you to the board properly — it used to silently do nothing there.
- **Customize:** Opening someone else's custom no longer wrongly shows **"Autosave on"** as if it were yours — it now says it's a borrowed custom and offers Save a copy.
- **Customize:** The color filter is **more accurate** — pale, mostly-transparent effects (like a Pastel Rainbow Aura) no longer get mistaken for black, and applying a color while a zone is selected now filters right away instead of needing you to reselect the zone.

## July 10, 2026 — The My Pet Styles makeover

### Enhancements
- **Pet Styles:** The **My Pet Styles board got a full makeover.** It now wears the same pretty pastel backdrop as the rest of the site, your Wished and Owned columns have proper labels, and the style cards size themselves to fit the space instead of leaving awkward gaps.
- **Pet Styles:** A new **＋ Add a style** button at the top of the board lets you search every Pet Style by name and file it straight into Wished or Owned.
- **Pet Styles:** The board's clipboard now **splits into Owned and Wished** like the main clipboard does, and you can add an optional note that's included when you copy your list. **Copy list writes plain, paste-ready text** with the same Format and Case options as the main clipboard — no more emoji headers.
- **Pet Styles:** The share collage is simpler and friendlier — instead of fiddly counters and currency buttons, there's **one "Offering" box under each style where you just type what you're offering** (like "3 GBC" or "brushes or swap") and it prints right onto the shared image. Copied lists include your offers too.
- **Customize:** More community-submitted Pet Styles now show their **exact Neoboards Active Box** (thank you to everyone who hit "Send it in"!), and the cap that cut submitters off after 10 styles a day is gone.
- **Customize:** "Send it in" submissions **keep themselves fresh now** — if you sent a style in and it hasn't shipped yet, just load your pet wearing it once and DTI Remix quietly re-checks it in, so it gets measured in the next update without you doing anything else.

### Fixes
- **Import:** NP items now show their **blue NP label** on import cards, matching the item cards everywhere else — it was quietly missing whenever an item had been looked up in an earlier session.
- **Everywhere:** Long-parked **pinned tabs now notice updates** — coming back to a DTI tab you left open for days will show the "an update landed" card if a newer build arrived in the meantime, instead of staying quiet until a manual refresh.

## July 10, 2026 — Preferred Traders & the item-page glow-up

### Enhancements
- **Item page:** A big layout refresh — **Trade Activity now sits on the left**, always exactly as tall as your lists area (it grows and shrinks as you show or hide lists, scrolling inside itself), and every card floats freely on the wallpaper instead of sitting inside one big bordered box.
- **Item page (new!):** **Preferred Traders.** Starred traders are now your *Preferred Traders*, and they earn their keep: open one of your wishlists in your closet and hit **★ Check Preferred Traders' Lists**, or select items on an outfit in the Your Outfits film-strip view and do the same — DTI Remix scans their public trade lists and shows exactly who has the items you're after, so you know who to contact without clicking through everyone's lists one by one.
- **Item page:** Trade statuses got a glow-up — the **+ status** button and the status picker are now soft rounded pills that match the rest of the site, instead of boxy yellow chips.
- **Everywhere:** The little **"seen" eye** is now one cute, consistent icon across the whole site (it used to render as a heavy black glyph in some places).
- **Everywhere:** The **Try On Haul side tab** now wears the same clean white-and-teal look on every page — the old glowing gold version is retired.
- **Inventory:** The **Sync to DTI** tab matches that same style, and **Past imports** is now a pretty pastel log that shows *where* each import came from, with CSV export included.
- **Closet:** The wooden sign on someone's closet now has a **★ button** next to the mail and lookup icons — one click makes them a Preferred Trader (it lights up gold when they are).
- **Closet:** Adding to the **Try On Haul now confirms with a toast** just like the clipboard does, all toasts share one soft style (the bulky green one is gone), and the clipboard button **stays lit on items that are on your clipboard** — it clears itself when you remove them.
- **Closet:** The clipboard and try-on buttons on item cards are **stacked neatly over the item art** (clipboard on top) instead of sitting side by side, and the hanger icon on the Try On Haul side tab is properly centered.
- **Everywhere:** **Manage your Preferred Traders from the ⚙ menu** — a new panel lists everyone you've starred, with one click to open their closet, un-star them, or **add someone new by username** (it checks the name is a real DTI user first). "Your Lists" also tucked itself into a tidy flyout there instead of a mile-long scroll.
- **Everywhere:** **Un-starring a Preferred Trader now gives you a few seconds to hit Undo**, wherever you do it.
- **Item page:** Feeling generous? Flip to **Seeking + ★ Preferred Traders** to see which of your favorite people *want* the item you're looking at — and when none of them do, it says exactly that instead of pretending you have no Preferred Traders at all.
- **Your Outfits:** Fixed item names and pictures **sometimes never loading** — the data was there all along; the page just forgot to repaint once it had it. Big outfit collections also load much more gently now instead of firing every request at once.
- **Everywhere:** The header now **always fits on one row** — no more buttons floating up on their own line; it compresses gracefully in narrow windows.
- **Everywhere:** Import history's **CSV export moved to the top** where you can actually see it.
- **Neopets pages:** The **pet-style tagger got a full makeover** — instead of the big green pop-up pill, it's now the same tidy side tab as everything else: click it to open a soft panel, tag the styles on the page as Owned, and see it logged under **Past imports** (tagged entries show a "Pet Styles" badge).

### Fixes
- **Item page:** Fixed the **star filter getting stuck on an empty list** — the filter quietly stayed on between pages, so Offering/Seeking could show nothing but a lonely "Show next 15" button. The ★ Preferred Traders filter now always starts off, switches off when you pick Offering or Seeking, shows every starred trader it knows about, and when there are none it says so and tells you how to add some.
- **Item page:** The value tag under the item art (like "Dyeworks thru July 15") is properly centered and wraps neatly when it's long.
- **Item page:** The frame around the item art was oddly three-dimensional — it's flat and tidy now, like every other card.
- **Closet:** The clipboard now sorts items onto the **correct side** when the person whose closet you're browsing both owns *and* wants the same item. Grabbing it from their wishlist (or the "wants & you own" column in Comparison Mode) kept landing it under "owns & you want" — the clipboard now goes by the section you actually clicked in.

## July 10, 2026 — The big import tune-up

### Enhancements
<!-- HELD FOR A LATER PUSH (needs the new loader — hidden from users this push):
- **Import (new!):** Bring items into DTI from more places — import what your **pets** are wearing, or everything in your **Safe Deposit Box** or your **Closet**. Each becomes its own resumable import, tracked on your homepage, so no single import gets overwhelming. (Look for the "→ DTI Sync" panel on those Neopets pages.) -->
- **Import & Items:** You can now **type a quantity** straight into any stepper instead of tapping − and + over and over — just click the number and type. The stepper is also cleaner now: a compact − N + split by dividers.
- **Import:** New **items-per-page setting** (30 / 60 / 90 / 120) on the import list — drop it lower if a big import feels sluggish on your computer, and it remembers your choice.
- **Import:** You can now **turn the live pet preview off**. Collapsing the Try-On Preview (or its new power button) fully stops it rendering — not just hides it — so sorting stays smooth on slower machines.
- **Import:** **Smoother keyboard sorting** — Tab now moves between an item's list boxes and then to the next item that still needs attention, instead of tabbing through every little button and scrolling the page.
- **Import:** **NP items** now show the blue **NP** price tag on their cards, matching the homepage.
- **Import:** **Arrange your list tiles your way** — drag a tile by its ⠿ grip to any open spot on the invisible grid. Leave gaps, cluster your favorites, whatever suits you: tiles never shove each other around, and dropping onto another tile simply swaps the two. Every item card follows your layout.
- **Import:** The header now shows **one steady count** — copies to place, items, and pages, across the *whole* import — so "did I miss something on another page?" always has an answer. It only ever ticks down as you sort.
- **Import:** No more bouncing back up the list. Anything you miss while paging through now gathers in a **Stragglers** section at the end of the last page — the same cards, same counts, just waiting for you there — and "Place all" on that page finishes them too. (The "Take me to the next one" button, which yanked you back up the page, is retired.)

### Fixes
- **Import:** Unfinished imports **no longer quietly disappear after a week** — they stay on your homepage until you finish or trash them.
- **Import:** Fixed the maddening **"1 more to place"** that pulled you back to items you'd already sorted — placing copies on an item that was still *looking up* could quietly un-count your placement once the lookup finished. Placed means placed now.
- **Import:** **Your sorting survives a refresh, period.** Assignments used to live only in memory until an item fully saved — so refreshing could quietly lose a handful of items per page (ones still looking up, partially placed, or mid-save). Every assignment is now stored the moment you make it, restored after a refresh, and finishes saving itself.
- **Import:** If you're **not logged in to DTI**, the import now says so and pauses instead of letting you sort into the void, and a red banner appears the moment any save fails.
- **Import:** Item names with **"&"** no longer display as "&amp;" (old imports are cleaned up automatically).
- **Import:** Items that Neopets and DTI **spell differently** (like "Cloud Face Paint" vs "Cloud Facepaint") now match up instead of claiming the item isn't on DTI.
- **Import:** A tidier header — one steady count on the left, the placing controls neatly on the right, and the import date tucked quietly at the bottom of the page.
- **Import:** **Re-importing mid-import no longer duplicates your work.** While an import is open, re-running the export (or re-sending from the source) only adds genuinely new copies — everything you've already placed, kept, or skipped stays put. Once you finish or trash an import, the books close, and your next import is a fresh, complete look at your stuff.
- **Import:** The **Offering / Seeking** popup now opens right at the button you clicked, instead of way off to the left.
- **Import & Items:** Preview images that time out now **retry themselves** — no more broken-image icons or missing pieces in the Try-On Preview.
- **Import:** **Your first click actually works now.** Clicking a stepper, Skip, or a trade count on a card you hadn't focused yet was quietly swallowed (the card refreshed itself mid-click) — this same bug threw the Offering popup into the far corner of the screen.
- **Import:** **Item names are links** — click one to open that item's page in a new tab.
- **Import:** The **"+N hidden" lists toggle** sits on its own line under "OWNED · N lists" instead of crowding beside it.
- **Import:** **Items with "&" in their name now import.** Names like "Black & White Candle Stick Foreground" were quietly failing to match on DTI because of how Neopets encodes the name — fixed (apostrophes and other special characters too).
- **Import:** **Your sorting sticks after a refresh.** If your DTI login had quietly expired mid-import, saves *looked* successful but weren't actually saving, so items came back unsorted. Saves are now verified, retried after a hiccup, and never fooled by a silent login redirect.
- **Import:** **Skipped items stay skipped** — "Place all" was scooping items you'd hit **Skip import** on right back into your lists.
- **Import:** **Bulk placing is faster.**
- **Import:** The **Offering / Seeking** trade counts on item cards no longer get stuck on "…" — they load for every item as it scrolls into view.
- **Import:** Items that **aren't on DTI yet** now show a friendly, helpful note — *"Looks like this item hasn't been uploaded to DTI yet… please model it for us on a pet!"* — instead of a scary red "not found." (And item names no longer occasionally rendered in a serif font.)
- **Customize:** The frame options on the pet preview — rounded, circle, and the new **Active View** viewfinder — are back on hover. They were vanishing on a fresh custom.
- **Customize:** The Color, Species, Mood and Appearance dropdowns now share one clean teal chevron (and the doubled-up arrow on Color/Species is gone).
- **Item page:** Animated items no longer show a faint duplicate of themselves beside the moving copy.
- **Everywhere:** The header's candy stripe now wraps the top corners cleanly, and the nav no longer spills onto a second line on narrower pages.
- **Everywhere:** DTI's native **green hover** can no longer sneak onto any of the reskin's buttons or links — it's now removed at the source instead of patched spot by spot.

## July 7, 2026 — Neoboards Active Box, import tools & a big polish pass

### Enhancements
- **Customize:** The **variants strip can now be collapsed** — click the VARIANTS header to tuck the cards away and get straight to your item list (it remembers your choice, and a little summary shows how many variants are tucked away). Especially handy on half-screen windows.
- **Customize:** New **Neoboards Active Box** viewfinder (Beta!) in the frame picker — see exactly which square of your custom shows up in your board avatar. Built from real measured data for every species and color family (including Baby, Maraquan, Mutant, 8-bit, Origami and Invisible bodies); Pet Styles show a close approximation for now.
- **Homepage:** When the Newest Wearables grid has nothing to show — a brand-new week, or your filters hiding everything — it now says so warmly: *"Looks like you've caught up! Try adjusting your filters or check back tomorrow."*

- **Import:** A new **Try-On Preview** panel parks beside the import list — **click any item's thumbnail** to see just that item on a pet, then click the next thumbnail to swap it. Make your keep-or-skip calls without ever opening the Try On Haul.
- **Customize:** The Active Box viewfinder now knows the **real crop for 9 Pet Styles** — and it grows on its own: load a pet by name wearing an unknown style and a one-click **"Send it in"** shares it (just the pet name + style) so that style's exact box can ship for everyone in a future update.
- **Closet:** **Bulk Remove is fast now** — items dim instantly, a little counter shows progress, and removals run several-at-a-time instead of one… by… one (it used to look frozen for many seconds).
- **Import:** When you scroll to the bottom with work left, a friendly **"You're almost done"** card tells you how many items still need attention and walks you to each one — the finished summary appears the moment the last one is settled.
- **Import:** The two card buttons match now: **"Skip import"** (renamed from "Don't import", in a calm red) throws away that item's edits and skips it, and **"Done · keep N in inventory"** only appears once you've placed at least one copy with more left over.
- **Import:** Item zones read as normal text under a small OCCUPIES label — same as the item page — instead of a lavender badge.
- **Items:** The **Infinite Closet search page** (`/items?q=…`) finally joined the reskin — our header, a proper search pill, konpeito item cards and pagination, no more green.

<!-- HELD FOR A LATER PUSH (needs the loader + more work — hidden from users this push):
- **Import:** New **Import from Pets** — the neolodge page grows an "Import pets → DTI" button that reads all your pets and imports what each is wearing, in one go. -->

- **Everywhere:** Squashed a bug where our styling briefly bled onto Neopets' own pages; the reskin is now strictly DTI-only.
- **Homepage:** If you have an unfinished import, the right panel now opens on the **Imports** tab so you can pick up where you left off.
- **Customize / Import:** The Try-On Preview got a pass — a **collapse** button (just pet + dropdowns), the dropdowns match the Customize style, the item name reads teal, the scrollbar no longer clips the pet, switching pets no longer flickers, and the Tab hint sits out of the way.
- **Import:** The Try-On Preview now starts on **your preferred pet** (from the settings cog) and **remembers your pet** as you preview item after item — no more resetting to a Blue Aisha every click.

### Fixes
- **Items:** The item page **scrolls again** — it was cutting off with no scrollbar, leaving the pet preview at the bottom unreachable.
- **Customize:** Your **starter pack no longer piles onto real pets** — starting a custom from a pet's name loads just that pet's look; packs only apply to fresh, naked customs.
- **Customize:** The Active Box viewfinder is honest about **Pet Styles** now: each style has its own crop (we measured!), so instead of drawing a wrong box it says the style isn't supported yet.

## July 6, 2026 — Customize polish, a bigger board editor & a variants-safety fix

### Enhancements
- **Customize:** The pet preview is **bigger**, and the color/species/mood and appearance/pet-name rows are tidier — Mood sits next to Species, and Appearance and Pet Name share one centered line.
- **Lookbook:** Opening a board now gives you a **full-width working canvas** — the board list tucks away while you edit (use "‹ Outfits" to go back), the tool rail runs the full height, and new boards start square.
- **Items:** The item's info card and your Owned/Wanted lists now sit on the same soft iridescent background as the trade panel.
- **Try On Haul:** Lighter and cleaner — when you switch tabs, the hidden Preview tab stops animating in the background, so only the tab you're using does the heavy work.
- **Details:** When you export a Compare collage, your **crowned variant is now marked** with a gold ring and crown.
- **Everywhere:** Owned/Wishlisted status now **refreshes itself** when you browse items — no more reopening your closet to clear a stale "Wishlisted."

### Fixes
- **Your Outfits:** Your saved **variant groups no longer reset** themselves into separate customs — the most important fix in this update.
- **Customize:** Your **starter pack now actually loads** into the Fitting Room when you start a new custom (items that don't fit the pet's body show flagged so you can still see them).
- **Customize:** Animation now **reliably plays** after you save or refresh (it was showing "Animated" but sitting still), the **Custom Preview** now follows the global Animated toggle, the **Layers** button on variant cards works again, and the crown icon sits straight.
- **Customize:** The settings dropdowns use the proper styled look (not the plain grey/green one), **Variants** sits back under the pet instead of floating low, and the item search reflows so cards stay usable on smaller windows — with a **Clear** button that resets the search and zone filter.
- **Customize (Fitting Room):** Clicking an item to try it on **keeps your scroll position**, the star moved so you stop accidentally starring items, and "Can't wear" items no longer hide their buttons.
- **Try On Haul:** On a short screen the haul now opens **fully visible and centered**, so you can always reach its draggable header.

## July 5, 2026 (evening) — Homepage feed, one settings cog & List Management

### Enhancements
- **Homepage:** The right column is now a real feed with three tabs — **Customs** shows your recent customizations as thumbnails (with any variants tucked under each look; click one to jump back into it), **Imports** tracks your in-progress import, and **What's New** shows the latest release notes.
- **Homepage:** A new **General notes** tile gives you a little notepad that saves as you type, and the redundant color-and-species tile has been retired.
- **Everywhere:** There's now **one settings cog**, at the left end of the header (the brand link is now "Home"). It holds the theme picker, a **Quickstart pet** (with an optional **starter pack**) and full **List Management**.
- **Everywhere:** **List Management** lets you rename any of your lists right from the cog (that's the real name everyone sees), set them Private, Public or Trading, give them a **nickname only you see**, and choose whether each list counts as a match in Comparison Mode — with a clear red warning when it's excluded.
- **Everywhere:** A **+ New Custom** button in the header jumps straight into a fresh customization with your Quickstart pet — and applies your chosen starter pack automatically.
- **Everywhere:** **Animated previews** is now one global setting that every preview follows, and on Customize you can **lock** a custom's Animated/Still state so it always opens the way you saved it.
- **Try On Haul:** **Star your preferred tab** (Preview or Custom Preview) and the haul always opens there, from any page. One merged item list with sorting by recently added, recently released, or name — plus a direction flip.
- **Items:** The item page has a quick **naked-pet preview**: pick a color and species, click through pet portraits (star your favorites to pin them first), and see the item worn — animated too.

### Fixes
- **Try On Haul:** Clicking items in the Preview tab now actually dresses the preview pet (and clicking again undresses it); the stale "Previewing with…" label no longer lingers; the side tab's blurry vertical text is crisp now.
- **Items:** The pet preview sits on a clean white background so colors read true, the trade activity panel got the pastel treatment, the Save button no longer floats in empty space, and the panels stay attached when switching preview modes.
- **Import:** The "Place & Review" bar no longer shifts around when you select items, and it now says plainly whether it will place **ALL** unsorted copies or **only** the selected items'.
- **Your Outfits:** The Lookbook is a slim filmstrip parked on the left at every window size, and the board editor's tools now line up with the canvas.
- **Everywhere:** Opening DTI Remix pages from Neopets (like the inventory export) no longer flashes the old green site on the way in.

## July 5, 2026 — Lookbook board editor, rebuilt

### Enhancements
- **Lookbook:** The board editor is rebuilt around a **left toolbar and an always-open side panel** — every control (Layout, Frames, Title, Backdrop, Floats) is right in front of you instead of tucked behind pop-up menus.
- **Lookbook:** New **Freestyle** mode lets you **drag each pet anywhere** on the board and **resize pets one at a time**; **Grid** mode is still there for neat rows.
- **Lookbook:** A full **Layers panel** — drag any layer to **restack** it, move your pets **in front of or behind** your decorations, **hide** a layer, or **lock** one so it can't be moved or edited by accident.
- **Lookbook:** **Right-click** a decoration to bring it forward, send it backward, or jump it to the very front or back.
- **Lookbook:** **Click a pet to select it** (shift-click to grab several), **edit the title** from its panel or by **double-clicking** it on the board, and **set an exact canvas size in pixels**.

### Fixes
- **Lookbook:** The **delete button** on board thumbnails is a clean round icon again.
- **Everywhere:** The **"an update landed" prompt** now shows on the homepage too (it was being hidden there), and reads more comfortably.

## July 4, 2026 — Lookbook board editor & Customize safety

### Enhancements
- **Lookbook:** Your boards now have a proper editor with a safety net — every change stays a **draft until you hit Save**, so nothing gets altered by accident. Alongside Save there's **Discard** (roll back to your last save) and **Clone** (spin a board off into a new variation).
- **Lookbook:** Dress up a board with **decorations** — drop in any Neopets item as art and place it in front of or behind your pets. Plus more frame shapes (arch, hexagon and more) with an optional border and soft shadow, and independent fonts, sizes and colors for the title and the pet names.
- **Lookbook:** **Download your finished board as an image**, ready to share. And the little board cards in the sidebar now show a real mini-preview of each board's design, so you can tell them apart at a glance.

### Fixes
- **Your Outfits:** Sorting A→Z now places a look by the name of its **crowned** variant, so it lands where you'd expect — before, adding a differently-named variant could bounce the whole look to the wrong spot. When a look does jump position after you crown or group a variant, the page now **scrolls to it and gives it a glow** so you never lose track of it.
- **Your Outfits:** The **delete** button on a look shows up reliably again (it was sometimes rendering blank).
- **Your Outfits:** **Select unowned** on a look's items now selects *only* the ones you don't own, and clears any owned ones you'd already picked — before, it left them selected.
- **Customize:** Opening a custom that **someone shared with you** no longer quietly saves a copy — or a variant of it — into your own outfits. Edit it freely to suggest changes; only your own **Save** keeps a copy, just like starting from scratch.

## July 3, 2026 — Comparison Mode & logged-out fixes

### Enhancements
- **Everywhere:** When a new version of DTI Remix is ready, you'll now get a little "An update landed!" card that shows what changed, with a one-click **Reload** button to jump straight onto it — no more wondering whether you're on the latest.
- **Comparison Mode:** A new gear on the compare panel lets you hide lists you'll never trade from — anything in them stops counting as a match. Your choice sticks across every closet you visit, your lists are split into Trade Lists and Wishlists so they're easy to find, and a "+N hidden lists" toggle lets you peek at what you've tucked away.
- **Lookbook:** Boards have a new **Edit / View** switch — View shows a board big and clean with all the editing controls out of the way.

### Fixes
- **Comparison Mode:** Your side of a comparison now reflects your wishlist as it is right now, however an item got there — including items you wishlisted straight from an item's own page. Before, it only knew about the items from the last time you opened your own closet, so anything added elsewhere was invisible.
- **Everywhere:** Items no longer show as Wishlisted or Owned while you're logged out — it was picking up another user's closet and treating it as yours.
- **Everywhere:** The Try On Haul is now hidden entirely when you're signed out — no side tab, no panel, no add buttons — since it works by staging items into your own account.
- **Your Outfits:** Visiting Your Outfits opens to your outfits again, instead of dropping you into a Lookbook board.
- **Lookbook:** Clicking a pet in a board no longer jumps you into the editor and off the page.

## July 3, 2026 — Lookbook, DTI Sync & item links

### Enhancements
- **Lookbook (new!):** A new space beside Your Outfits for arranging your saved looks into themed boards — mood-board style collages. Make a board, hit **+ Add Outfit**, and pick the looks you want (your search and filters keep working while you pick, so you can grab exactly the variants you're after). Then make it yours: set how many pets per row, left / center / right alignment, square or circle portraits, a backdrop and border color, border thickness, a header title, a font, and how they sort. Drag the portraits to rearrange, and the board grows to fit so you always see the whole collage at once.
- **Lookbook:** Your boards are private to your account and stay put across refreshes and logins. Deleting one gives you a few seconds to undo — and it never touches your actual saved outfits.
- **DTI Sync:** Got more copies of an item in your inventory than you want to list? A new **"Done · keep N in inventory"** button saves the copies you placed and quietly leaves the rest in your inventory — no more being nagged to place every last one.
- **DTI Sync:** Import cards now show which **zones** each item occupies, right under its name — the same info you get on your item cards.

### Fixes
- **Your Outfits:** When the last row of outfits isn't full, the cards now center instead of clinging to the left with an empty gap on the right (in every layout).
- **Everywhere:** Opening an item in its own tab now lands on the item's real web address — bookmarkable and refreshable — instead of leaving the address bar stuck on "about:blank."

## July 3, 2026 — Closet bulk-edit & clipboard isolation

### Enhancements
- **Closet:** When you pick items for bulk editing, they now show a clear **SELECTED** banner and candy-stripe frame — the same cue as Customize and Your Outfits — and the bar along the bottom got a soft pastel makeover.
- **Closet:** Dragging selected items onto a list now moves the *whole stack* of each item, not just one. And when you're viewing several lists at once, it gathers every copy of an item spread across those lists into the one you drop on. Moving a big batch (over 100) shows a heads-up that it may take a minute or two.
- **Closet:** The **+ Add Item** search box got a softer, pastel look to match the rest of the closet.
- **Your Outfits:** Your sort choice and the Show-inactive toggle now stick — they stay how you set them across refreshes and even after logging back in.
- **Everywhere:** Your clipboard, your trade-message draft, and your Try On Haul now stay separate per account — signing into a different Neopets account on the same browser no longer shows the previous account's staged items. And each other person's closet you browse keeps its **own** clipboard and draft, so a running "trade with this person" list never mixes with anyone else's.

### Fixes
- **Your Outfits:** The variant you're currently viewing in the film strip is clearly marked **SELECTED** again, with a banner and frame matching the "currently wearing" look on Customize.
- **Closet:** Your lists now sort alphabetically by name, matching DTI itself — so numeric prefixes (0.0, 0.1, 1.0…) put lists in the order you intend. Before, your public lists were shown first and private ones after, which scrambled the order.
- **Closet:** Confirmation pop-ups (moved / added / removed) now appear right where you're working — next to your cursor, or where you dropped a drag — instead of off in a far corner. The "moved" note also tells you how many items *and* how many total copies moved, and it clears a little quicker.
- **Customize:** The "no zones watched yet" hint moved into the Zone Map panel where it belongs — it used to float over your pet and block the toggle buttons underneath it.
- **Closet:** The **Copy clipboard** window got a polish pass — one consistent font throughout, cleaner copy icons, the "Lebron values" option lined up on its own row, a message box that remembers the size you drag it to, and the site's soft scrollbar. It also no longer closes on you when you drag to select text past its edge.

## July 3, 2026 — Crowns, grouping & Customize

### Enhancements
- **Your Outfits & Customize:** Your favorite variant of a look is now marked with a little golden crown that sits on top of the pet, in place of the heart — and it's one shared setting: crown a variant on either page and it shows up crowned on the other. The crowned variant is the one shown large by default.
- **Customize:** You can flip through the Color and Species pickers with your arrow keys now — focus the field and press ↑ / ↓ to move through the options without even opening the menu, or open the menu and arrow through it (type a letter to jump to a match).
- **Your Outfits:** In the film-strip layout, each variant thumbnail shows its name, and when a look has inactive variants a "+N inactive" chip tells you how many — click it to reveal them. (What used to be called "hidden" is now "inactive.")

### Fixes
- **Your Outfits:** Dragging one outfit onto another to group them as variants works again — it was silently doing nothing when you dropped it. Any outfits left in a tangled grouped state from before now repair themselves automatically.
- **Your Outfits:** Crowning a variant, or clicking to preview one, no longer reshuffles your cards or makes them jump around the page.
- **Your Outfits:** On the film-strip wearable tiles, an item's cap value now shows as the same little pink price tag used everywhere else on the site, and the Owned / Wishlisted labels sit on the item's thumbnail instead of a mismatched tag underneath. Looks with no variants say so instead of leaving a blank gap, variant thumbnails are centered next to the pet, and the wearable checkboxes are plain coral checkboxes.
- **Customize:** Click an item's name in the search results to try it on — the name wasn't a clickable spot before.
- **Customize:** Removing an item from the Fitting Room with the × now sticks; before, it would quietly come back after a refresh.

## July 2, 2026 — Your Outfits & auto-save

### Enhancements
- **Your Outfits:** A brand-new page for browsing everything you've saved. Search your outfits by name, species, color, the items they use, or their Pet Style, and sort by when you made them, when you last changed them, name, species, color, or favorites first. Variants of the same outfit are grouped together so a look and its copies share one card, and you can switch between three layouts: stacked cards, a film strip that lists the items each outfit uses, or every variant as its own card.
- **Your Outfits:** Star an outfit to favorite it (this now actually saves — the old star did nothing), hide the ones cluttering your page, and delete outfits with a 5-second undo in case you change your mind. Each outfit shows when it was created and last updated.
- **Customize:** Saved outfits now save themselves as you edit. The Save button only shows for a brand-new outfit; after the first save, your changes are kept automatically.
- **Customize:** The Fitting Room has a new two-per-row layout (it's list / 2 / 3 / 4 across now), the search box reads "Search this list," and Declutter is always there (greyed until you have unstarred items to clear).
- **Customize:** Dragging tiles on the Zone Map feels much better — a click won't turn into an accidental drag, the tile lands where you aim it, and the others stay put instead of jumping around. Adding zones no longer scrolls the page.
- **Homepage:** The theme menu now highlights Konpeito (recommended) and Milk Tea; the rougher themes are tucked away while they get more polish.
- **Closet:** A "Select all shown" button in the sidebar selects every item on screen at once — in any view, and it respects your current search and filters, so you can grab exactly what you're looking at.
- **Closet:** The "Copy clipboard" window got a friendlier look and a new message box, with a 500-character counter, where you can write up your trade post (paste your list in, tidy it, and copy it straight into the Neoboards).
- **Your Outfits:** Variants of a look are now numbered on their thumbnails, and you can mark the one that leads a group with a heart — kept separate from DTI's own favorite star, so the two never get mixed up. Each outfit's item list now shows only the wearables actually visible on the pet, so stacked or covered pieces no longer clutter it.
- **Customize:** The marker for a variant group's lead is now a heart instead of a star, matching Your Outfits and staying clearly distinct from DTI's favorite.
- **Your Outfits:** The film-strip layout is much richer — your pet and its details sit side by side up top, the variant thumbnails wrap in beside the pet, and every wearable the outfit uses fills a grid below. Each wearable tile shows what it's worth (its cap value, or a blue NP tag), an info button with its zones and how many you own or have wishlisted, and a checkbox — tick the ones you want and add them to any of your Wants lists in one go, with quick "Select all" and "Select unowned" buttons.
- **Your Outfits:** Rename any outfit or variant right where it is — hover its name, click the pencil, and type.
- **Your Outfits:** Reorganize your variants by dragging. Drop one outfit onto another to make it a variant of that look, drag a single variant's thumbnail to move just that one, or drag a variant off onto empty space to split it back into its own outfit. A counter shows how many you're moving, and dragging toward the top or bottom of the screen scrolls the page for you.
- **Customize:** Search results stream in as they load now, instead of leaving the whole list blank while it fetches — browsing a big zone on a slow connection no longer sits empty for minutes.
- **Customize:** In the zone filter, type part of a zone's name and press Enter (or arrow through the matches) to jump straight to it.
- **Closet:** Moving a big batch of items between lists is much faster — they move several at a time behind a "Moving N of M" progress bar, and anything that couldn't be moved is reported instead of quietly skipped.

### Fixes
- **Customize:** Outfits now save only the items actually shown on your pet — not every item you tried on or starred along the way. Before, all your "maybe" picks were saved as worn, which is why an outfit's thumbnail could show a whole pile of wigs stacked on top of each other. Your starred picks are still kept (they live in your Fitting Room now), and re-saving an affected outfit once cleans up its thumbnail.
- **Customize:** Leaving the editor while an outfit is still loading can no longer save a blank or half-loaded version over your real one.
- **Customize:** The search box no longer scrambles the letters while you're still typing, and tabbing through results moves from item to item instead of catching on the ? and note buttons.
- **Your Outfits:** Deleting one variant now deletes only that variant — its sibling variants stay put and stay grouped. Before, deleting a variant could take the rest of the group down with it.
- **Your Outfits:** Owning an item no longer stops you from adding it to a wishlist — Owned and Wishlisted are just labels; you can still add another copy (say, for a different pet). Previewing a different variant no longer reshuffles your list or scrolls the page, and Pet Style tokens show their real artwork on the tiles.
- **Closet:** Removed the duplicate "Select all" from a list's header (use the sidebar's "Select all shown"), and the Clipboard and Try On Haul side tabs no longer overlap the Filters panel.
- **Closet:** Your closet loads right away again — a background sync that keeps Comparison Mode in step was holding up the page from drawing on large, mostly-unsorted closets.
- **Everywhere:** Buttons and cards on Your Outfits and Customize now show a soft mint hover instead of a jarring green one (or none at all).
- **Customize:** In the Details view, long value notes no longer run off the edge of the card.
- **Everywhere:** Opening a page no longer flashes the old green DTI page first — including links that open in a new tab and the Outfits link in the header.
- **Everywhere:** The header now looks the same on every page.
- **Closet:** Comparison Mode now counts the items in your "Not in a list" group. Before, it only matched items you'd filed into a named list, so if most of your stuff was unsorted it could badly undercount what you actually have to offer.
- **Closet:** Clearing the clipboard now shows a "Clipboard cleared" message with a 5-second undo, so an accidental clear is easy to take back, and the clear button is now clearly labeled.
- **Closet:** Fixed the clipboard's copy button sometimes showing up white and invisible.
- **Closet:** List cards no longer cut off the little item preview thumbnails along the bottom.
- **Closet:** The item info (?) tooltip works again after you've moved between pages.
- **Customize:** Clicking into a text field no longer shows a harsh black outline.

## July 1, 2026 — Zone Map & Starter Packs

### Enhancements
- **Customize:** Dock the Zone Map — the old "Hide" button is now "Dock," and it tucks your zone tiles into a tidy grid in the panel instead of floating them over your pet. Drag them to reorder, and "Pop out" returns them to the pet with your arrangement intact.
- **Customize:** Every dropdown in the editor now opens the same tidy white menu — the zone filters, sort menu, Zone Map picker, and species/color pickers included. No more mismatched browser-default dropdowns.
- **Customize:** Starter Packs got a fresh look — browse your packs as cards showing each one's name and a peek at its items, then tap one to open, edit, and apply it. Drag the cards to rearrange, and hover a card for a quick delete. You can also "Save as Starter Pack" from the Zone Map's gear menu to bundle everything on your watched zones into a new pack.
- **Customize:** The Fitting Room has view modes — list, large tiles, or small tiles — and its filter is now three buttons: All, Favorites, and Currently Applied.
- **Customize:** Hearts are now stars — star items in the Fitting Room to prioritize them, and "Declutter" clears the unstarred ones.
- **Customize:** New Pet Name field next to Appearance — type a pet's name to load it straight into the editor, just like the homepage.
- **Customize:** Rename your zone maps from the Zone Map's gear menu, and the map's lock icon is now drag arrows (so it's not mistaken for the per-tile padlocks that protect an item from try-ons).
- **Customize:** Tapping "+ Fill Slot" on a zone tile shows "Searching Zone…" and glides you up to the results, and the "Compare" button on item variants is now "Details" (and shows even for a single variant).
- **Customize:** The Starter Pack and Try On Haul icons got cuter, more cartoonish art.

### Fixes
- **Customize:** The Pet Style field now shows the style your pet loaded with (like from a shared link) instead of sitting empty until you picked one.
- **Customize:** Your Animated / Static choice is remembered instead of resetting to Animated each time you open the editor.

## June 30, 2026

### Enhancements
- **Pet Style picker:** Double-click the bar at the top to pop the picker out into a floating window — drag that bar to move it, drag the corner to resize, and double-click again (or click the pin) to dock it back. Now you can browse styles while watching your pet.
- **Pet Style picker:** The "+ Add to Wants" button moved to the top-left corner of each style, so it's no longer easy to hit by accident while scrolling.
- **Customize:** Pose thumbnails zoom in on your pet's face so each expression is easy to tell apart, and the Mood selector just shows the expression now (Happy, Sad, or Sick).
- **Closet:** If you don't have any lists yet, a hint shows you where to make your first one.

### Fixes
- **Closet:** Your unfiled items now show under "Not in a list," and you can drag them straight into any list.
- **Closet:** The selection toolbar no longer covers the clipboard bar.
- **Everywhere:** The Log out button works.
- **Customize:** Sorting search results by Oldest or Newest first works, and search now finds items even if you type the words out of order or skip punctuation like apostrophes and colons.
- **Customize:** The Fitting Room list stays neatly inside its card instead of spilling over the edge.
