# Post-Claude review — commit 2065a23

Reviewed against `origin/codex/homepage-v1` on 2026-11-05.

| Item | Verdict | Evidence |
|---|---|---|
| Header breakpoints | Confirmed | Navigation is collapsed through 1099 px, phone is hidden from 1100–1239 px, and desktop labels are nowrap. Desktop cloud capture at approximately 1365 px showed one clean row without horizontal overflow. |
| Hero heading | Confirmed with reservation | Real DM Serif Display renders the heading in two lines in the desktop capture. The reduced size is acceptable. The image should remain visually checked after deploy because the text/gradient balance depends on the hero crop. |
| Mobile menu | Confirmed in source | Anchor close, Escape close with focus return, `aria-controls`, changing label/expanded state, 44 px rows, mobile phone link and desktop resize close are implemented. |
| Postcode | Confirmed | Belgian postcodes are four digits from 1000 through 9999. Input filtering, `autocomplete=postal-code`, `aria-invalid`, described status, explicit validation and useful official links are present. |
| FAQ | Confirmed | Native buttons already support Enter/Space. Unique ids, expanded/control relationships and labelled regions are present. |
| OfferteCheck example | Confirmed | Table roles, visible glyphs, screen-reader labels, legend and illustrative disclaimer are present. The 20–22 px glyphs no longer rely on colour alone. |
| Sticky CTA | Partial | Safe-area values and IntersectionObserver hiding targets are present. Source logic is sound, but notch/landscape and all mobile target overlap still require a real iOS/WebKit device pass. |
| Reduced motion | Confirmed | Animation, transition and hover transforms are disabled under `prefers-reduced-motion: reduce`. |
| Metadata / JSON-LD | Confirmed with deploy dependency | Organization data contains no invented address, rating or opening hours. Canonical and OG URLs assume the final site is deployed at `https://www.ramenspecialist.com/`. |
| Residual contrast | Confirmed | Updated eyebrow, reviews and accessible action orange remain in the approved palette. |

## Additional finding and fix

The hero was still implemented as a CSS `image-set()` background. That makes LCP discovery less reliable and reproduced as an empty visual image layer on the branch preview even though the WebP asset itself decoded correctly. The hero is now a real `<picture>` with a high-priority 1200×675 image. The existing gradient is preserved as a pseudo-element, so the visual direction and copy layout are unchanged. This is also the safest direct fix for the reported desktop LCP.

## Verification limits

- Local source and asset checks passed (`git diff --check`; WebP and JPEG both decode as 1200×675).
- The branch was inspected in the cloud Chromium browser.
- The local preview proxy could not start because Vite is not installed in this runtime, so post-fix visual QA is marked blocked rather than falsely reported as passed.
- Playwright WebKit/Firefox binaries are not installed in this runtime. Cross-browser claims therefore remain open.
- A new Lighthouse run is also still open.

## Unchanged scope

No calculator, configurator, quotation, pricing, n8n or webhook file was modified by the homepage LCP fix.

## Owner decisions still open

- Approval of the 10-year / 5-year warranty wording.
- Whether “Antwoord binnen 24 uur” is an operational promise.
- Rights to display every brand in the systems row.
- Replacement of temporary AI project imagery with real projects.
- Lawyer approval of privacy, cookie and general-terms text.
- Confirmation that the final production domain and OG image URL are exactly `https://www.ramenspecialist.com/` and `/assets/hero-house.jpg`.
