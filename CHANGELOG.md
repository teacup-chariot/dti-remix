# DTI Remix — Changelog

## July 2, 2026

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

## July 1, 2026

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
