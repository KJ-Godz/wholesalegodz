# Wholesale Gods

A static wholesale showroom with a black-and-gold identity, a GSAP delivery campaign, department elevator transitions, and a source-backed clothing collection.

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

The active hero uses locally bundled GSAP and a six-face CSS 3D package, with separate truck, headlight, halo, mist, and typography layers. The sequence starts automatically and loops continuously, fading through darkness between deliveries. There are no playback, replay, speed, seek, or time controls. It pauses offscreen or in background tabs and resumes when visible. The reduced-motion option respects the operating-system setting and retains an explicit preference; elevator transitions use the same preference.

The truck is a photographic plane. Fully realistic camera movement, tire contact, suspension, and cargo-door motion still need a rigged 3D truck or production footage. Earlier Canvas code and video assets are retained as inactive references; they are not the main hero.

The crown-and-globe logo is supplied as standalone scalable SVGs for website, packaging, and truck use. Physical foil and print finishes need a manufacturing proof.

The phone layout uses larger touch targets, compact navigation, horizontally scrollable filters, responsive product dialogs, and a reframed delivery scene.

## Development checks

```sh
npm run build:catalog
npm test
```

Checks cover catalog assets, all three showroom modes, department routing, empty Kids, search and filtering, original-photo comparison, bag persistence, CSV output, source-library grouping, GSAP timeline states, repeated autoplay loops, visibility resume, reduced-motion preferences, asset failures, and focus restoration. These use jsdom and do not replace a visual review in a real browser.

`npm run test:legacy-render` optionally renders the archived Canvas implementation into ignored local review files; it does not verify the active GSAP hero.

Hosting account settings, credentials, installed dependencies, local generation logs, and review archives are excluded from Git. Preserve the bundled GSAP copyright and license notice; see `dist/vendor/README.md`.

The production deployment was checked at `https://wholesalegodz.vercel.app`, including the homepage, animation files, mobile styles, product imagery, and supporting pages. A Chrome iPhone SE preview was used to review navigation, collection layout, and product details. Physical iOS/Android performance still benefits from device testing.
