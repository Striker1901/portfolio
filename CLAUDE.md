# Portfolio Website — Project Context

Francisco Martins' personal design portfolio (visual identity, branding, packaging, typography, web, motion). Hybrid one-page site (hero, work index, photography, about, contact) plus separate case-study / gallery pages. Plain HTML/CSS/JS, no build step, no framework.

Read this file at the start of every session — it's the whole context, no need to re-explain the project.

## File Map

- `index.html` — home: hero, numbered work index (01–06), photography teaser, about, contact
- `poliempreende.html`, `litet_snitt.html`, `1543.html`, `clube_de_xadrez_do_barreiro.html`, `beah.html`, `filipa.html` — individual case/gallery pages
- `photography.html` — photography section
- `assets/css/style.css` — all styling
- `assets/js/main.js` — scroll-reveal animations, scroll progress indicator, sidebar tracking
- `assets/images/` — 56 optimized images (EXIF-corrected)
- `assets/fonts/` — PP Neue Montreal (Book/Medium/SemiBoldItalic/Bold/Italic woff2) + Inter (Regular/Bold, fallback)

## Design System

- **Background:** white
- **Accent:** blue `#00f`
- **Typeface:** PP Neue Montreal — weights 400 (Book)/500 (Medium)/700 (Bold), Inter as fallback
- **Layout:** 16-column grid
- **Home work index:** numbered 01–06, fixed scroll-tracking sidebar work-list
- **Global:** scroll progress indicator, scroll-reveal animations on all pages
- **Copy:** English throughout (case studies translated from Portuguese)
- **Inspiration reference:** gregorylalle.com (overall design direction)

## Conventions

- Keep all 8 pages structurally consistent — a layout/CSS change usually needs to be checked across all of them, not just one
- Images live in `assets/images/`; if adding new ones, optimize + fix EXIF orientation (CR2/iPhone sources) before placing
- New copy in English; translate from Portuguese if source content is PT

## After Any Visual/Layout Change

Run a quick check on the page(s) you touched (and home, if shared components changed):
- Desktop ~1512×900 and mobile ~390×844
- Console errors, broken images/requests
- Grid/layout integrity on the work index (watch for stray `display:block` overrides)

No need to re-check all 8 pages unless you touched something shared (style.css, main.js, header/sidebar markup).

## Current Status

> **Last updated:** 2026-06-23

Edit pass 2026-06-23 #5 — **frosted-glass menu bar** (verified headless-Chrome, desktop 1512×900 + mobile 390×844; clean console bar the pre-existing `favicon.ico` 404):
- **Blur back on `.site-header`.** Replaced the near-opaque fading gradient scrim with a **frosted-glass bar**: translucent fill + `backdrop-filter: blur(14px)` (`-webkit-` too) + a hairline `border-bottom` to define the edge. Light state `rgba(255,255,255,0.72)` / border `rgba(0,0,0,0.06)`; `.on-dark` state `rgba(13,13,13,0.6)` / border `rgba(255,255,255,0.08)` (keeps the inherited blur). Content now frosts under the bar instead of hitting a solid block.
- **Bar slightly larger + balanced.** Symmetric vertical padding `22px` top & bottom (was 18 / 24, asymmetric for the old fade); bar height ~64px, the three groups (nav · name · socials) sit balanced on one line. `align-items: baseline` kept. JS `on-dark` toggle unchanged and still flips correctly over hero/work-with-me.

Edit pass 2026-06-23 #4 — **footer split out + hero scroll glow** (verified headless-Chrome, desktop 1512×900 + mobile 390×844; clean console bar the pre-existing `favicon.ico` 404):
- **Footer separated from the "Work with me" section.** The old `.wm-foot` (LinkedIn/Instagram + copyright) lived inside the dark `.work-with-me` (`#contact`) section with its `14vh` padding + grid/glow/grain, leaving a big empty band below it. Moved it out into a standalone `<footer class="page-footer">` after `</section>` (before `</main>`): **plain black `#0a0a0a`, no grid/glow/grain, compact** (single padded row `1.6rem var(--pad)`, `.pf-inner` flex `space-between`, `.pf-links` left + `.pf-meta` right, wraps on mobile). `.work-with-me` padding trimmed `14vh→12vh` and `row-gap` dropped (single child now). Removed the old `.wm-foot`/`.wm-links`/`.work-with-me .site-footer*` rules. `.site-footer` left intact (case pages still use it). `main.js` header on-dark selector extended to `.dark-section, .page-footer` (safety; footer never spans the header band in practice).
- **Hero scroll cue → orange neon glow.** `.hero-scroll` ("scroll ↓") recolored from muted white `rgba(255,255,255,0.45)` to `var(--accent)` (#FF5C00) with a `text-shadow` neon bloom (`0 0 8px rgba(255,92,0,0.7), 0 0 18px rgba(255,92,0,0.45)`); keeps the bob animation. Verified orange + glow at both viewports.

Edit pass 2026-06-23 #2 — **single terminal hero** (verified headless-Chrome, desktop 1512×900 + mobile 390×844; clean console bar the pre-existing `favicon.ico` 404):
- **Hero background** (added after the terminal): a restrained layered field on `.hero` — a faint blueprint **grid** (two `linear-gradient` line sets, 44px cells, white @3.5%), a soft **accent glow** (`radial-gradient` orange @12% behind the window), and **film grain** (`::after`, inline SVG `feTurbulence`, opacity 0.05). `.hero` got `overflow:hidden; isolation:isolate`; `.term`/`.hero-scroll` pinned to `z-index:1` above the grain. Pure CSS, no deps, no animation.
- **Polish (3 tweaks):** (a) `.works` `padding-top` (breathing room below the dark hero) — set to **25px**; (b) the Clube de Xadrez black-on-white logo now has a `1px solid var(--line)` outline so it stops merging with the page — applied to `.we-4 .img-a` (home) and `.case-img img[src$="xadrez-symbol.png"]` (case lead); the home box stretches to the tall img-b beside it, so `.we-4 .img-a` is now `display:flex; align-items/justify-content:center` to **center the mark** in the frame (verified gapTop≈gapBottom); (c) the header scrim is more solid (gradient opaque 0→58% then fades, `padding-bottom` 14→24px, both white + on-dark states) so the menu bar reads as a clean bar instead of mixing with the hero glow/grain — no blur added; `background` now transitions with the dark/light swap.
- **Hero vibrancy — syntax palette + neon glow** (CSS only, on the existing `.term-*` classes): prompt `.t-prompt` orange + bloom `text-shadow`; `.t-cmd .t-typed` soft white; **`.term-name` warm amber `#ffb24d` + glow** (the focal beat); `.t-out` light; `.t-comment` editor-green `#6a9c6a`; `.term-caret` gets an orange `box-shadow` glow. Background accent glow nudged `0.12→0.15`. Reduced-motion unaffected.
- **"Work with me" offer section** (replaces the old Contact section; one of the `(C) Positioning.md` edits): a dark, terminal-styled closing block reusing the hero's look. The hero's dark background (grid+glow+grain) was factored out of `.hero` into a shared **`.dark-section`** class now on both `.hero` and `.work-with-me`. New section `#contact` (id kept) = a `.term` window with `# what I do` (outcome line), `$ ls packages/` → essential/complete/custom (`.wm-pkg`, amber `.pk-name` + light `.pk-scope`, **no prices** per decision), `$ ./start --project` + the email CTA (`.wm-cta`, orange glow), and a merged dark footer (`.wm-foot`: LinkedIn/Instagram + the shared `.site-footer` recolored for dark). Nav `Contact` → **"Work with me"**. Header `on-dark` toggle generalised in `main.js` to **any `.dark-section`** behind the header band (so it stays light over the new bottom section too). Copy is no-numbers; swap to ranges/"from €X" later if desired. Verified desktop + mobile, header adapts at all scroll depths, console clean.
- **Consolidated the two intro panels + old hero into ONE terminal-style hero** (`.hero#hero` → `.term`). Near-black `#0d0d0d`, a faux terminal window (traffic-light dots + "francisco — zsh" bar) that **types out** after the intro wipes: `$ whoami` → **Francisco Martins** (big bold — the design beat), `$ cat role` → **Brand & Web Designer**, `$ cat location` → **Lisbon, Portugal · ESAD.CR**, then `# Welcome to my Portfolio` with a blinking orange caret. Sequencer in `main.js` (`startHeroType`), markup keeps the full text in the DOM (no-JS/SEO safe; typing only when motion allowed).
- **Role copy changed: "Graphic Designer" → "Brand & Web Designer"** (moves toward the positioning).
- **Removed the ARCANE SVG handwriting panel entirely** (markup `<svg>`, `.ih-sig*`/`.ih-*` CSS, and the signature-draw JS all gone).
- **Restored the project-thumbnail intro overlay** exactly as before (6 thumbnails flash, black field, wipe up; once per session via `sessionStorage`, reduced-motion skip). Its `finish()` now calls `startHeroType()` so the terminal types in *after* the wipe.
- **Header adapts to the background:** `.site-header.on-dark` (light text + dark gradient) toggled by a scroll-position check in `main.js` (`scrollY < hero.offsetHeight − header.offsetHeight`) — light over the dark hero, dark over the white sections. Guarded on `#hero`, so case pages keep the default dark header.
- The orange `--accent: #ff5c00` from edit #1 stays. The pre-existing mobile hero-title overflow bug is now moot on the home (the giant uppercase hero title was replaced by the terminal).

Edit pass 2026-06-23 (verified via headless-Chrome screenshots, desktop 1512×900 + mobile 390×844; zero console errors, only the pre-existing `favicon.ico` 404):
- **Accent recolored blue → orange, site-wide.** `--accent: #0000ff` → `#ff5c00` (the single token drives every hover + `::selection` across all 8 pages). Also repointed `.work-list a:hover/.is-active` from `var(--ink)` → `var(--accent)` so the fixed work-index sidebar hovers orange too. Confirmed settled hover color is `rgb(255,92,0)` on links, work-entry titles, and the sidebar.
- **New two-panel intro hero added at the top of `index.html`** (above the existing "Francisco Martins — Graphic Designer" hero):
  - **Panel 1 `.ih-welcome`** — full-viewport grey (`#2b2b2b`) field; "Welcome to my Portfolio" typed char-by-char (JS typewriter, ~60ms/char) in orange monospace with a blinking caret; a "Scroll ↓" cue at the bottom.
  - **Panel 2 `.ih-name`** — full-viewport dark (`#1a1a1a`) field; the first name **"Francisco"** drawn stroke-by-stroke as an inline SVG (9 per-glyph paths, staggered left-to-right) in orange with an ember `drop-shadow` glow — ARCANE-style neon handwriting. Draws on scroll-into-view via IntersectionObserver; dasharray/offset set from `getTotalLength()`.
  - SVG was pre-generated offline (fonttools + macOS **Dancing Script**, `Francisco` glyph outlines, `scale(1,-1)` flip) and inlined — no runtime/web dependency, site stays build-free.
  - Reduced-motion: welcome shows fully typed, signature shows its final drawn state, no animation.
- **Removed the old thumbnail-flash intro overlay** (now redundant — the welcome→name sequence is the intro): deleted its markup + pre-paint skip script from `index.html`, the `.intro*` CSS, and the intro block in `main.js`.
- Note: the intro panels are **permanent top-of-page**, so they replay on every load (incl. returning to the home from a case page). A `sessionStorage` skip can be added later if that friction bites. The pre-existing mobile hero-title overflow bug is unchanged (out of scope).

Edit pass 2026-06-16 #2 (verified via headless-Chrome screenshots, desktop 1512×900 + mobile 390×844):
- Header alignment fix: the three header groups (`Works/About/Contact`, `Francisco Martins`, `Ig/In/Em`) no longer sit on different rows. Root cause: `.header-name` (cols 5/12) overlaps `.header-nav` (cols 1/6) at col 5, so grid auto-placement bumped the name + social to row 2. Pinned all three to `grid-row: 1` and added `align-items: baseline` on `.site-header`.
- Hero meta now visible on load: `.hero` changed from `align-content: space-between` + `padding-top:30vh/8vh` (which glued the meta to the bottom edge, below the fold) → `align-content: start`, `padding-top:20vh`, `padding-bottom:10vh`, with `.hero-meta { margin-top: 3.5rem }`. Still `min-height:100vh` so only the hero shows above the fold.
- Copy: "six projects" → "five projects" (`.section-note`).
- Clube de Xadrez lead image → the club symbol mark `xadrez-symbol.png` (new, from `../Portfolio-IMG/Business_card_final.png`, 1075×721) in both the home work-04 `img-a` and the case-page first `.case-img.full` (replaced `xadrez-thumb.jpg` and `xadrez-card.png` respectively; old files left on disk).
- Footer: `.site-footer` converted flex → subgrid so the three spans land at cols 1/5/12; "Lisbon, Portugal" now aligns under "Francisco Martins" (col 5). Reverts to flex-wrap at ≤810px.
- 1543 bottle: replaced the studio render with Francisco's real photo (rotated 90° CW → upright, 3:4). New `1543-photo.jpg` (1500×2000, case page) + `1543-photo-thumb.jpg` (675×900, home work-03 `img-b`). Old `1543-01.jpg`/`1543-thumb.jpg` left on disk.
- Intro overlay is now negative: `.intro` background `var(--bg)` → `var(--ink)` (black) with `color: var(--bg)` (white name); counter also white (`.intro-count` accent → `var(--bg)`).
- PRE-EXISTING bug noticed (not introduced here, reproduced with these header changes reverted): on narrow widths the oversized uppercase hero title overflows horizontally, which drags the fixed header's right-aligned social links (and the footer's right item) off-screen. Needs a hero-title sizing/overflow fix if mobile matters.

Edit pass 2026-06-16 (Playwright-clean, desktop + mobile, zero console/asset errors):
- Home work index: removed the Filipa (05) and Beah (06) entries and the old photography teaser; replaced with a single project-style "Photography" entry (05 → `photography.html`) using the same two-image layout (`.we-5` folded into the shared `.we-1..5` rule). This resolved the previous filipa-06 open item. `filipa.html`/`beah.html`/`photography.html` pages unchanged.
- Hero is now full-viewport (`min-height:100vh`, `align-content:space-between`) so only the home/hero shows on entry — Selected Work sits below the fold.
- Alignment: header name "Francisco Martins" and hero "Currently…" now both align at grid col 5, matching the "Selected Work" note ("Visual identity… — six projects"). `header-name` moved 6/12 → 5/12 (global), `.m-current` → 5/12, `.m-based` → 1/5.
- Poliempreende home entry: `img-a` poster (`poli-thumb-2.jpg`) → the symbol logo (`poli-logo.png`, crisp 1000² PNG, 27 KB).
- Clube de Xadrez case-page lead: storefront (`xadrez-01.jpg`) → the business-card design (`xadrez-card.png`), rendered from page 2 (back) of `../Portfolio-IMG/Business_card_final.ai` via a Swift/PDFKit rasteriser (no Ghostscript/Illustrator on machine).
- Note left intact per request as the alignment anchor; copy still reads "six projects" though the home now lists 4 projects + Photography — wording is a pending copy decision.

Edit pass 2026-06-15 (Playwright-clean, desktop + mobile, zero console/asset errors):
- Replaced `poli-01.jpg` (case-page lead) with the clean Poliempreende symbol logo (blue-on-yellow, square 1600×1600), sourced from `../Portfolio-IMG/Poliempreende_Logo_Símbolo-01.jpg`.
- Filipa: removed the red studio session (`filipa-04/05/06/08` references) — page now shows the seaside session only; tagline trimmed. Image files left on disk (still referenced: `filipa-06.jpg` is the home Filipa teaser — see open item).
- Home work index: branding entries 01–04 now share the Poliempreende two-image layout (`.we-1..4` unified in CSS). Added a 2nd thumb to Clube de Xadrez (`xadrez-thumb-2.jpg`, portrait crop of `xadrez-04`); swapped 1543 so the landscape is `img-a`.
- Hero meta: removed "Freelance availability July 2026"; "Currently…" now aligns under the header name "Francisco Martins" (cols 6–12).
- Added a first-visit intro overlay on the home: flashes the 6 project thumbnails (counter + name) then wipes away. Once per session (`sessionStorage 'fm-intro-seen'`); skipped on reduced-motion. Logic in `main.js`, styles in `style.css`, markup + pre-paint skip script in `index.html`.

Major redesign (this design system) shipped and verified 2026-06-11 — all 8 pages rewritten, Playwright-clean on desktop + mobile, zero console errors/broken assets. Previous version backed up at `../Portfolio-HTML-backup-2026-06-11.zip`.

<!-- TODO: define what's left before this is "live"/shareable with employers & clients -->

## Notes

- Planning/history for this project also lives in the Obsidian vault: `03 Projects/Portfolio Website/` (not accessible from this repo — informational only for Francisco).
- End of session: update the "Current Status" section above with what changed, so the next session starts with zero re-explaining.
