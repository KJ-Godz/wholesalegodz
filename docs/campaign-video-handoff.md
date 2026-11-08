# Replacement delivery campaign — pending asset

Deployment is on hold at the client’s request. Keep the existing continuous GSAP sequence working until the new video is supplied. Do not push these local changes to `KJ-Godz/wholesalegodz` until the replacement is integrated and reviewed, because `main` automatically deploys to Vercel.

## Media integration

Use the actual new video, not either legacy MP4 in `dist/assets`. Inspect its dimensions, duration, audio and the position of the truck, logo, halo, package and final reveal before selecting a layout. Preserve the final approved logo.

- Keep autoplay, muted, loop and playsinline. Do not expose controls, playback speed, scrubbing, time counters or replay buttons.
- Use an H.264 MP4 with a fast-start layout for broad browser compatibility; add WebM only if useful. Keep the supplied master outside public runtime assets.
- Desktop: size the scene to preserve the meaningful action and final typography.
- Mobile: prefer a separately composed portrait export when available. With a single landscape video, show the full frame or a gentle crop within a dedicated video area, using the brand background to fill unused space. Avoid a full-height cover crop that removes the truck, parcel or reveal text. Do not stretch the frame.
- Place readable editorial copy and navigation outside the mobile action area; respect notch/safe areas and portrait/landscape changes.
- Use a real poster frame for reduced motion, slow connections, playback rejection and media errors. Keep the collection usable throughout. Pause video offscreen and in background tabs; resume automatically when visible.
- Verify actual iPhone/Safari and Android/Chrome behavior where available, alongside desktop. Check complete loops, touch scrolling, reduced motion and fallback states before a production push.

No placeholder video source or nonfunctional player has been added in advance.
