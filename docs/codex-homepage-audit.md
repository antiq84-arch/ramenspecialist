# Codex homepage verification — PR #1

Date: 2026-11-05  
Reviewed source: `codex/homepage-v1` at `487af91`  
Asset/icon/font fix commit on PR branch: `86eb7b6`

## 1. Verification

| Item | Verdict | Evidence |
|---|---|---|
| B1 | CONFIRMED | Git files are 786445/786446/786446 bytes. `PIL.Image.verify()` reports `Truncated File Read`; `load()` reports `broken data stream`. Full local originals decode at 1672×941, 2172×724 and 2149×732, so the Git upload was truncated. |
| B2 | CONFIRMED | Source keeps desktop header until `max-width:900px`. Chromium screenshot at 1365 px with real local fonts shows wrapped nav labels, phone and CTA. |
| I3 | CONFIRMED | Source inspection: anchor clicks do not close nav; label remains `Menu openen`; no `aria-controls`, Escape handler or mobile phone link. Link line box is approximately 22.8 px from `.92rem × 1.55`. Left for Claude. |
| I4 | CONFIRMED | Original menu and all icons depended on Bootstrap Icons CDN. With stylesheet unavailable, the `<i>` elements have no graphic. |
| I5 | CONFIRMED | Original branch shipped 2.36 MB of truncated PNG data; complete originals total about 10 MB. One triptych was referenced five times; hero used CSS background without preload; images had no intrinsic dimensions or lazy loading. |
| I6 | CONFIRMED | White on `#d85b22` = 3.86:1. White on `#b94718` = 5.28:1. White on selected `#c54f1c` = 4.66:1. Byline with opacity approximated below 3:1 depending on compositing. |
| I7 | CONFIRMED | Native `required`/`pattern` validation runs before the submit handler, so malformed input does not reach the custom branch. `0000` matches the pattern. No autocomplete or `aria-invalid`. Left for Claude. |
| I8 | CONFIRMED | FAQ buttons have no `aria-expanded` or `aria-controls`. Left for Claude. |
| I9 | CONFIRMED | Source uses empty colour-only `<i class=status>` elements inside div rows, without a legend. The all-green own column has no illustrative label. Left for Claude. |
| I10 | CONFIRMED | Footer legal labels were plain text. Google Fonts and Bootstrap Icons were third-party requests. |
| I11 | PARTIAL | Claims and brand list are present and need owner confirmation. The project images are already disclosed as temporary atmosphere images, but the heading/captions can still be read as portfolio work. No commercial/legal copy changed. |
| P12 | CONFIRMED | Chromium at 1365 px with DM Serif loaded shows H1 on three lines. Left for Claude because it depends on the header/hero responsive solution. |
| P13 | CONFIRMED | Mobile CTA uses fixed 12 px edges, has no safe-area inset, and remains active through the 600–900 px range. Left for Claude. |
| P14 | CONFIRMED | No `prefers-reduced-motion` rule. Left for Claude. |
| P15 | CONFIRMED | No canonical, OG, JSON-LD or favicon link in reviewed source. A favicon asset is now provided; metadata remains for Claude. |
| P16 | CONFIRMED | One triptych was reused with five different alternative texts and crop meanings. |

## 2. Ownership and action

| Item | Owner/status | Explanation |
|---|---|---|
| B1, I5 | Fixed by Codex | Re-exported from intact originals, added WebP + JPEG fallback, three card crops, `<picture>`, dimensions, lazy decoding and hero preload. |
| I4 | Fixed by Codex | Removed icon CDN and added an inline SVG symbol sprite. No external icon request remains. |
| I6 | Fixed by Codex | Added `--orange-action:#c54f1c` only to orange surfaces carrying white text; brand/accent orange remains `#d85b22`. Replaced translucent byline with explicit `#6f716f`. |
| I10 | Fixed by Codex | Self-hosted DM Sans and DM Serif Display. Added linked placeholder Privacy, Cookies and Algemene voorwaarden pages, visibly marked as concepts requiring final legal approval. |
| P16 | Fixed by Codex | Dedicated crop and matching alt text per card; corrected descriptive alt text for wide images. |
| B2, I3, I7, I8, I9, P12–P15 | Left for Claude | Kept the agreed split. Favicon asset is ready for Claude to reference. |
| I11 | Needs owner | Warranty scope, 24-hour response, brand rights/actual relationships and project-photo presentation require owner confirmation. |

## 3. Colour decision

Original orange `#d85b22` with white is 3.86:1 and fails 4.5:1 for small text. Options checked:

- `#b94718`: 5.28:1, but visibly darker than the approved orange.
- `#c54f1c`: 4.66:1 and passes AA while staying closer to the approved colour.
- Original orange with dark `#292d2f`: 3.60:1 and still fails.
- Keeping original only for large bold text would require two background rules anyway and would not fix badges/step numbers.

Decision: use `#c54f1c` only for `.btn-primary`, `.badge`, `.choice .label` and `.step:before`. Keep `#d85b22` for borders, line art, logo and other non-text accents. This is the smallest visual change that passes. Byline changed from opacity `.55` to solid `#6f716f`, which gives 4.64:1 on `#faf8f4`.

## 4. Files and image sizes

Changed/added:

- `index.html`
- `privacy.html`, `cookies.html`, `algemene-voorwaarden.html`
- `assets/favicon.svg`
- `assets/fonts/dm-sans-latin.woff2` (36,932 B)
- `assets/fonts/dm-serif-display-latin.woff2` (24,744 B)
- WebP/JPEG image set and three dedicated card crops

Modern WebP payload if every unique image is loaded: **548,800 B**. Hero WebP: **183,344 B**. Individual crop WebPs: **48,346–58,210 B**. Every replacement image passes PIL decode verification.

## 5. Re-test status and open owner points

- Chromium visual smoke test passed on the commit-hosted page with real self-hosted fonts/icons.
- `index.html`, `snelleprijs.html`, `configurator.html`, `offerte-vergelijker.html` and all three new legal placeholders return HTTP 200.
- Inline icon and image assets display; no Google Fonts or Bootstrap Icons request remains in source.
- A fresh Chromium screenshot at 1365 px confirms the header/H1 issues remain for Claude, as expected.
- This runtime could not resize the cloud Chromium window, so the requested exact eight-viewport screenshot matrix and Lighthouse run still need to be repeated after Claude's code-only fixes. Do not treat the single 1365 px smoke test as the final responsive acceptance test.

Owner decisions still required:

1. Confirm warranty claims and exact scope.
2. Confirm that “Antwoord binnen 24 uur” is operationally guaranteed.
3. Confirm permission/actual relationship for every brand in the row.
4. Replace temporary AI atmosphere images with real project photography, or approve explicit inspiration wording.
5. Have Belgian legal counsel approve the final privacy, cookie and general-terms text before removing `noindex` and the concept notices.

