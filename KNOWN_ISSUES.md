# KNOWN ISSUES — Obsidixz Commercial

## Open / requires external action

1. **Deployment not performed.** No hosting or DNS credentials for `commercial.obsidixz.pp.ua` exist in this workspace. Until an authorised deploy happens, the domain may not resolve to this build. See `DEPLOYMENT.md`.
2. **Commercial email receipt/reply unverified.** No message has been sent to / received from `obsidixz.commercial@outlook.com` by this build's author. Requires a human test with mailbox access. Not a code defect — flagged as outstanding delivery evidence.
3. **Founder/brand review pending.** Visual QA was performed by the build agent, not by the founder. Copy, imagery choices and the parent-brand lockup application should be approved by Richard Olasehinde before wide release.
4. **Retention claims are policy, not audited fact.** The site and docs state a 24-month retention / 12-month review **policy decision**; actual Microsoft mailbox settings and provider-held copies were not audited and are explicitly not claimed either way. If mailbox-level deletion is ever questioned, that needs a Microsoft 365 admin check — ideally raise with the account owner.
5. **Hero impact at very wide screens.** Hero photograph is 1408 px wide (source limitation); at ≥1600 px it is slightly soft inside its cropped frame. Accepted for this build; regenerate at higher resolution when a larger generator output is available (record in `IMAGE_SOURCES.md`).

## Toolchain notes

6. **Astro pinned to 7.3.8.** `astro@7.4.x` requires Node ≥22.23.4; sandbox Node is 22.22.3. `npm warn EBADENGINE` appears only if someone bumps the pin — do not.
7. **No system browser in the build sandbox.** Rendered verification used `@sparticuz/chromium` with NSPR/NSS compiled from source (`mozilla/nspr`, `mozilla/nss`) under `/tmp`. These libraries are **not** committed and **not** needed on normal machines — install any Chromium and run `scripts/rendered-checks.mjs` (details in `CONTINUATION.md`).
8. **`npm run check` hint:** `document.execCommand('copy')` is deprecated (used intentionally as fallback when the async Clipboard API is unavailable). Behaviour verified working in the shipped code path.
9. **Headless "view" limitations.** Screenshots prove the served production DOM renders without overflow/console errors; they do not prove real-user network conditions (3G throttling) or every email client's mailto handling.

## Cosmetic / accepted

10. **`.menu-btn` hover border on mobile** — decorative only, no functional impact.
11. **Sitemap contents confirmed** post-build: `dist/sitemap-0.xml` lists exactly the 8 route pages (no 404). Re-check after any route additions.
12. **`og:image`** points at `/images/og-cover.jpg` (1200×630, crop of hero). Some platforms cache aggressively; first share may serve a stale card after any later change.
13. **`/how-it-works` inline grid number column** is `3.25rem` at all widths — deliberate for the numeral-aligned editorial look.

## Not issues (explicitly ruled out)

- No horizontal scroll at any of the five tested widths (320/390/768/1024/1440) nor at 200% text zoom — tested, fixed, re-tested.
- No console errors or failed requests in any tested route.
- Fonts are confirmed loaded (not merely declared): `document.fonts` reports Montserrat and Open Sans as `loaded`.
