# Supplied delivery campaign integration

The supplied `Wholesales.m4v` replaces the former browser animation. The master remains unchanged outside the public website.

## Runtime assets

- `dist/assets/wholesale-gods-arrival.mp4`: the complete 31.375-second H.264 film, 1280 × 720, approximately 5.5 MB. Audio and the embedded thumbnail stream are omitted from this muted background export. MP4 metadata is placed first for streaming.
- `dist/assets/wholesale-gods-arrival-poster.jpg`: a frame at 4.5 seconds showing the branded truck. Used while loading, for reduced motion and as the fallback.
- `dist/hero.js`: native video controller for automatic inline looping, reduced motion, offscreen/background pausing, playback rejection and media errors.
- `dist/hero.css`: contained full-frame layouts. Copy and links stay outside the mobile film area. No face, package or truck branding is intentionally cropped.

No old demo MP4 is referenced by the active hero. The main page no longer loads the former GSAP animation library. Legacy files remain available in history or as inactive local references.

## Playback contract

Autoplay, muted, loop, playsinline; no playback buttons, speed selection, scrubbing, elapsed time, picture-in-picture or fullscreen controls. Reduced motion shows the poster without initially downloading the film. If the browser disallows autoplay, retain the poster and keep the showroom usable.

The single supplied landscape film remains complete on mobile. A separately composed portrait version can be added later if the client prefers more screen coverage.

## Verification

The source and web-export frames were inspected; the web export was decoded end-to-end. Application tests simulate native media events, blocked autoplay and delayed playback, and check that the catalog, buyer bag, filters and elevator continue working. Streaming tests cover byte ranges and HEAD requests. These do not replace an actual browser/device playback review; localhost browser automation remains blocked by a saved user permission.
