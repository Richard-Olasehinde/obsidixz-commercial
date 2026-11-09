# DECISION LOG — Obsidixz Commercial

All decisions 2026-11-09 unless dated.

## Stack & build

1. **Astro, static output, no UI framework.** Eight largely static pages; Astro gives file-based routing, build-time image optimisation (`astro:assets` → WebP, responsive `widths`, reserved `width`/`height` → no layout shift), `@astrojs/sitemap`, near-zero client JS. Rejected: Next.js (heavier, SSR features unused), Vite+React SPA (weaker SEO/no-JS story), plain hand-written HTML (no maintained layout reuse).
2. **Astro pinned to 7.3.8, not ^7.4.7.** Astro 7.4.x declares `node >=22.23.4`; sandbox has 22.22.3 and only 22.22.3 is installable (npmjs is the only registry; no system package upgrade possible). 7.3.8 declares `node >=22.12.0` and is API-identical for everything used. `package.json` shows exact version; do not bump without upgrading Node.
3. **No Tailwind / no utility framework.** A bespoke two-font, six-colour visual identity with a small number of layout primitives; hand-written CSS keeps the file set visible and reviewable. Roughly matches Real Estate reference ethos without copying it.
4. **`@fontsource` self-hosted fonts.** Montserrat 600/700 (headings), Open Sans 400/600 (body). No Google Fonts runtime request; works offline; no third-party tracking; SIL OFL licensed (see `IMAGE_SOURCES.md`).
5. **Images shipped as generated photography, optimised at build.** Hero 1408×768 → three responsive WebP variants (22/46/77 kB); notebook scene 768×1376 → two variants. `<img>` used directly (no CSS background) with explicit dimensions; hero is `loading=eager fetchpriority=high`; second image lazy.
6. **Verification tooling in `scripts/`.** `verify.mjs` (parse-based checks on `dist/`, no browser) and `rendered-checks.mjs` (real headless Chromium via `@sparticuz/chromium` + `puppeteer-core`). Browser executed is Chromium 120ish; NSPR/NSS built from Mozilla sources in-sandbox because Debian mirrors are unreachable.

## Branding

7. **Concept 02 — The Interlock, unmodified.** Supplied artwork copied byte-for-byte into `public/brand/`; no redraw/crop/recolour/rotation; transparency preserved; intrinsic 931×785 kept (`width`/`height` attributes). Header lockup: image + live `Commercial` label, Montserrat 600, `0.02em`, `#315C9B`, `6px` gap, inline-flex, `align-items:center`; widths 80/96/112 px and labels 12/12→14 px at `<640 / 640–1023 / ≥1024` per the approved sizes.
8. **Footer uses the dark-surface variant** of the complete logo with `#7FA9DD` label (real-estate-derived treatment, adopted per brief; explicitly not a new brand colour).
9. **Favicon = supplied standalone emblem**, trimmed-of-transparent-margin and square-padded only (16/32/48 px transparent; 180/192/512 px on white for OS/browser chrome). No invented "C" or new mark.
10. **No Commercial sub-brand.** Header/footer say "Commercial" beside the parent lockup only; no separate logo, icon or wordmark anywhere.

## Design

11. **Direction: professional research desk with editorial rhythm.** Dark photographic hero (text-led, anchored right image, gradient blend), light problem section, structured Supplier Discovery report panel (document-style, numbered 01–07), packaging editorial section, dark process section with distinct outlined numerals (01–06), fit/anti-fit panels, royal closing band. Fine rules and one gold rotated-square motif (Interlock geometry) used sparingly. No icon-per-paragraph, no three-card-grid repetition, no neon.
12. **Generated photography chosen over scraped stock.** Licence uncertainty of arbitrary search-result images, plus brief allows generation. Prompts specified arrangement, palette and "no text/logos/people". Subject-based alt text; captions disclose "illustrative photograph — not our office / not client work". Recorded in `IMAGE_SOURCES.md`.
13. **Layout metrics:** `min(1160px, 100% − 2×gutter)` (1160 target, 20 px mobile gutter, 24 px from 480 px); section padding ≈ 40–88 px fluid (mobile → desktop), hero min-height 42 rem desktop; centred content. Mobile hero = image below text block, `object-position: 62–68%` so the subject survives the crop.

## Behaviour & honesty

14. **Exact mailto literal** everywhere the enquiry action appears:
    `mailto:obsidixz.commercial@outlook.com?subject=Obsidixz%20Commercial%20%E2%80%94%20Website%20enquiry` (decoded subject: "Obsidixz Commercial — Website enquiry"). No draft generator, no enquiry form, no backend endpoint, no tracking pixel, no "Message sent" state. Copy button announces "Email address copied" only after `navigator.clipboard.writeText` (or `execCommand` fallback) resolves; failure state shows the exact required fallback text and keeps the plain mailto usable.
15. **No false claims.** No supplier network, verification, inspection, testing, QA, escrow/payment protection, purchasing authority, logistics, client results, testimonials, statistics, turnaround or supplier-count guarantees anywhere. Preliminary Screening explicitly labelled "not independent Supplier Verification". Conditional RFQ coordination described as feasibility-dependent with guaranteed-nothing language.
16. **Privacy page states real handling** (Microsoft Outlook inbox; providers process in transit/storage; no automatic forwarding; 24-month retention after closure; 12-month inactive review; explicit statement that these are policy decisions, not audited mailbox facts; no deletion promises beyond our control; no cookies/analytics configured on the site — host server logs only).
17. **Terms deliberately omit invented binding specifics** — payment schedules, refund conditions, governing law/jurisdiction are described as per-project written terms; no liability caps invented; unregistered-brand status disclosed.
18. **No-JS fallback** via `<noscript>` block: hamburger hidden, mobile menu exposed as a plain static list beneath the header; email access never depends on JS.

## Verification approach

19. **Three layers, all actually run:** (a) `astro check` (types, 0 errors); (b) parse-based `verify.mjs` over built HTML (single h1, unique metadata, canonicals, alts, exact mailto, internal-link targets, lockup invariants, placeholder scan); (c) real Chromium over the served production build — 45 route×width checks, console/network monitoring, 200% text zoom, interaction tests (menu, copy), screenshot set. Two overflow bugs were found and fixed at source (grid-track `1fr` minimums → `minmax(0,1fr)`; implicit-column `display:grid` lists → same; `min-width:0` on grid children).
20. **In-sandbox browser obtained manually.** System has no Chromium and CDN/browser downloads are blocked; `@sparticuz/chromium` provides a self-contained binary needing only `libnspr4/libnss3/libnssutil3`, which were built from `mozilla/nspr` and `mozilla/nss` sources (codeload tarballs, gcc/make). `LD_LIBRARY_PATH` points Chromium at them. This is a sandbox quirk — on a normal machine, any Chromium + the two scripts work (see `CONTINUATION.md`).

## Deployment

21. **No deploy performed.** No pp.ua DNS or hosting credentials were provided or are discoverable; `gh` is authenticated only for the repository. `DEPLOYMENT.md` gives exact steps (Cloudflare Pages recommended by precedent of the sibling `obsidixz-forms` Pages project, or any static host) plus staging-noindex guidance. Domain is NOT live/verified; do not claim otherwise.

## Addendum — hosting decision (2026-11-09, second pass)

22. **GitHub Pages chosen as the deployment path (supersedes decision 21's Cloudflare-first phrasing).**
    Rationale: the only credential available in this workspace is the GitHub integration;
    GitHub Pages deploys static output with zero extra secrets and supports the custom
    domain with enforced HTTPS. Cloudflare Pages remains a valid alternative if the founder
    prefers it, but requires a Cloudflare login this session does not have.
23. **Deploy workflow committed but Pages activation is a human step.** The integration
    token in this workspace receives HTTP 403 ("Resource not accessible by integration")
    for repo-visibility changes and for all Pages administration (create/update site,
    custom domain, HTTPS enforcement). The workflow file
    (`.github/workflows/deploy.yml`) runs `check → build → verify → deploy` on pushes to
    `arena/5a9708cf-obsidixz-commercial` (and future `main`). The founder must (a) make the
    repo public (free-plan Pages requirement), (b) set Pages source to "GitHub Actions",
    (c) enter the custom domain. Exact clicks and CLI equivalents are in `DEPLOYMENT.md`.
24. **Deployment to `commercial.obsidixz.pp.ua` is not live until the founder completes
    (a)–(c) and the pp.ua CNAME exists.** No claim of live status is made anywhere.

