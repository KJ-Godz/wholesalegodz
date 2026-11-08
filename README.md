# Wholesale Gods

A static wholesale showroom with a black-and-gold identity, the supplied delivery campaign film, department elevator transitions, and a source-backed clothing collection.

## Run locally

Requires Node.js 22.13 or later (or Node.js 24+) and Python 3.9 or later.

```sh
npm ci
npm start
```

Open [the showroom](http://127.0.0.1:4173), [the dispatch sequence](http://127.0.0.1:4173/?play=1#campaign), [the logo collection](http://127.0.0.1:4173/brand.html), or [the supplied-photo library](http://127.0.0.1:4173/sources.html).

The server serves `dist/` on port 4173 with caching disabled for local review. No API keys, accounts, or environment variables are required. To deploy, serve `dist/` as the static website root; there is no compilation step. The committed `vercel.json` sets this output directory and skips installation/build commands, so GitHub-connected Vercel deployments publish the website instead of the repository root. It contains no account credentials.

## Project files

- `dist/`: complete website, local animation library, SVG logos, and product imagery.
- `catalog/`: portable product records, supplied-photo inventory, curation decisions, and individual garment preparation records.
- `scripts/build_catalog.py`: rebuilds the two public JavaScript datasets using the committed catalog records and existing studio images.
- `scripts/check_showroom.cjs`: application and animation-controller regression checks.
- `scripts/serve.py`: local preview server.
- `brand/build_identity.py`: vector logo generation source; regenerating the logos requires fontTools and macOS Bodoni 72. The exported SVGs work independently of installed fonts.

## Collection and features

The collection includes 97 records, 99 prepared studio images, and 52 supplied originals for comparison. Shared garments are unisex. Kids awaits confirmed children's products and sizing. Fragrance and Tech remain accessible categories with no supplied stock.

Department transitions, category and style filters, global search, product details, source-photo comparisons, persistent selection bags, and CSV selection requests are included. The branded hoodie design reference cannot be added to a selection request. Prices, sizes, materials, authenticity, and availability require confirmation; this is a selection showroom, not a payment checkout.

Studio images were prepared from supplied photographs and may reconstruct obscured details. Compare the originals for exact artwork and construction. Production packshots and verified catalog data are still needed before commerce use.

## Delivery campaign

The active hero plays the supplied 31.375-second film using a native HTML video element. Its web export is H.264, 1280 × 720, muted, and about 5.5 MB, with the MP4 metadata placed first for streaming. The original `.m4v` master is preserved outside the public website. A real frame from the film is used for the poster and reduced-motion presentation.

The film starts automatically, loops, and plays inline without playback buttons, speed controls, scrubbing, time counters, picture-in-picture or fullscreen controls. Scrolling and shopping remain available. The controller pauses video offscreen or in background tabs and resumes it when visible. Reduced motion shows the poster without loading video initially. Autoplay rejection and media errors retain the poster and the working collection.

Desktop and mobile both show the complete 16:9 frame, with contained video against the brand background. Mobile editorial copy and navigation sit outside the action rather than covering faces, the package or truck branding. A separate portrait edit could fill more phone height, but is not required to see the complete supplied film.

Earlier CSS 3D, Canvas and video implementations remain in Git history or inactive reference files. The main page no longer loads GSAP.

The final crown/WG/globe/truck artwork is preserved unchanged in `dist/assets/logo-final-approved.png`. Native SVG web adaptations provide compact, full and single-ink placements. `brand.html` distinguishes the approved original from these adaptations. Manufacturing artwork and physical foil/print finishes need specialist verification.

The phone layout uses larger touch targets, compact navigation, horizontally scrollable filters, responsive product dialogs, and a reframed delivery scene.

## Development checks

```sh
npm run build:catalog
npm test
```

Checks cover catalog assets, all three showroom modes, department routing, empty Kids, search and filtering, original-photo comparison, bag persistence, CSV output, source-library grouping, native video settings, repeated loops, delayed playback races, autoplay rejection, MP4 streaming layout, visibility resume, reduced-motion preferences, asset failures, and focus restoration. These use jsdom and do not replace a visual review in a real browser.

`npm run test:legacy-render` optionally renders the archived Canvas implementation into ignored local review files; it does not verify the active native-video hero.

Hosting account settings, credentials, installed dependencies, local generation logs, and review archives are excluded from Git. Preserve the bundled GSAP copyright and license notice; see `dist/vendor/README.md`.

The production deployment was checked at `https://wholesalegodz.vercel.app`, including the homepage, animation files, mobile styles, product imagery, and supporting pages. A Chrome iPhone SE preview was used to review navigation, collection layout, and product details. Physical iOS/Android performance still benefits from device testing.

## Current campaign integration

The approved final logo, consistent native SVG arrows, supplied delivery film, customer-facing department copy, and stronger elevator transitions are integrated together. See `docs/campaign-video-handoff.md` for media details.

The lift lives outside the inert browsing page, preloads its department imagery, masks previous sections during travel, and releases focus/scroll locks on normal arrival, the Enter department shortcut, Escape, reduced-motion changes, tab visibility changes and image-load failures. Regression checks exercise those paths.

The local server supports complete, partial, suffix and open-ended byte requests so native video can stream in the local preview. `npm test` includes those protocol checks with isolated synthetic media.

Browser visual testing of this edit remains pending because a saved localhost browser permission blocks agent access. The film and poster were inspected offline, the complete media file decoded successfully, and the application/controller and streaming checks passed. Native iPhone/Safari and Android/Chrome playback still require device verification.
