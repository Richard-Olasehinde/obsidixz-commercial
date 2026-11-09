# Obsidixz Commercial

**International Procurement Intelligence.**

Obsidixz Commercial helps businesses identify potential suppliers, assess available commercial information and make better-informed procurement decisions through structured supplier research and sourcing intelligence. Flagship service: **Supplier Discovery**. Initial industry focus: **packaging**. Audience: SMEs, importers, distributors, growing consumer brands, product developers and sourcing businesses. Operated remotely from Nigeria; serving clients internationally.

- **Site (intended production domain):** https://commercial.obsidixz.pp.ua/
- **Enquiries:** obsidixz.commercial@outlook.com
- **Privacy contact:** obsidixz@outlook.com
- **Repository:** https://github.com/Richard-Olasehinde/obsidixz-commercial

Obsidixz Commercial is a business expression of the Obsidixz parent brand (an unregistered business brand operated by Richard Oluwadunmininu Olasehinde). It is not a marketplace, supplier directory, verification/inspection provider, or procurement outsourcer.

## Stack

- [Astro 7](https://astro.build) (`7.3.8`, pinned — see `KNOWN_ISSUES.md`) static site generation → plain HTML/CSS/JS in `dist/`, deployable to any static host
- No UI framework, no client-side enquiry pipeline, no database
- Self-hosted fonts: Montserrat 600/700, Open Sans 400/600 (`@fontsource/*`, SIL OFL)
- Plain hand-written CSS (`src/styles/global.css`) — no utility framework, no runtime CSS-in-JS
- Node 22 (works on 22.12+; development sandbox used 22.22.3)

## Commands

```bash
npm install          # install dependencies
npm run dev          # local dev server (0.0.0.0:4321)
npm run build        # production build → dist/
npm run preview      # serve the production build (0.0.0.0:4321)
npm run check        # astro check (types/content)
npm run verify       # structural checks against dist/ (single h1, canonicals, mailto, …)
npm run test:render  # rendered-browser checks against a served build (needs preview running)
npm run test:render:all  # + interaction, no-JS and screenshot modes
```

## Testing

Structural checks: `npm run check` (types/content) and `npm run verify` (parse-based assertions
on `dist/`). Browser checks: `scripts/rendered-checks.mjs` (declared dependencies
`puppeteer-core` + `@sparticuz/chromium`), which requires a served build
(`npm run preview` first, or `BASE_URL=http://host:port`). It verifies: layout at five
widths × 10 routes (including an unmatched-route 404 returning HTTP 404 and the branded
404 page), horizontal overflow, console errors, failed requests, visible lazy images,
a 200% **root font-size** simulation (not real browser zoom), menu open/isolation/
Escape/focus-return/breakpoint-reset, clipboard success + denial + legacy fallback
paths, and the no-JavaScript experience (static navigation, exact mailto literal, no
dialog semantics). CI separates `structural` and `browser` jobs; production deploys
only from `main`. See `CONTINUATION.md` for re-running on a normal machine and for the
sandbox NSPR/NSS procedure.

## Documentation

| File | Purpose |
|---|---|
| `PROJECT_STATUS.md` | Stage-by-stage status and what is/ isn't verified |
| `DECISION_LOG.md` | Design and technical decisions with rationale |
| `PROJECT_STRUCTURE.md` | File map |
| `KNOWN_ISSUES.md` | Known limitations, engine notes, open items |
| `DEPLOYMENT.md` | Build/deploy/DNS instructions for `commercial.obsidixz.pp.ua` |
| `CONTINUATION.md` | How to pick this up, verify it and what remains |
| `IMAGE_SOURCES.md` | Image provenance and licences |

## Verification snapshot

- `npm run build` ✓ · `npm run check` — 0 errors ✓ · `npm run verify` — all checks pass ✓
- Rendered checks at 320/390/768/1024/1440 px × 10 routes: no horizontal overflow, no console errors, no failed requests, no broken visible images ✓
- 200% root font-size pass (text-size simulation, not browser zoom) ✓
- Interaction suite (menu isolation/focus return, copy success/denial/fallback) ✓ · no-JS suite ✓
- Browser screenshots in `verification/screenshots/` (identified in `PROJECT_STATUS.md`)

## Licence & use

Code and content: © Obsidixz Commercial. Parent-brand artwork is the authentic Obsidixz identity and is used as supplied (see `IMAGE_SOURCES.md`). Do not redistribute brand assets without permission.
