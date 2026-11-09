# KNOWN ISSUES — Obsidixz Commercial

## Open / requires external action

1. **HTTPS not yet enforced; certificate still provisioning.** The site serves over
   HTTP 200 from GitHub Pages. `https://commercial.obsidixz.pp.ua/` does not yet present
   a valid certificate (handshake failure observed; Pages API reports
   `https_certificate.state: "new"`, `https_enforced: false`). Founder actions:
   **Settings → Pages → Check again** (after the poisoned-cache window elapses — see
   `DEPLOYMENT.md` §0), wait for issuance, then tick **Enforce HTTPS**. Live HTTPS can
   only be called done when a fetch of the production domain returns 200 with a valid
   certificate — verify, don't tick-and-claim.
2. **Stale DNS answers in some caches (self-healing).** The `commercial` CNAME is
   stored correctly at the source (`richard-olasehinde.github.io.`, trailing dot —
   confirmed in the nic.ua panel and by 8/8 resolver reads earlier), but a pre-fix
   relative-target answer (`richard-olasehinde.github.io.obsidixz.pp.ua.`) is still
   present in at least one resolver cache shard (TTL ~6750 s when last sampled).
   Google's shared cache will expire it; nothing founder-side shortens that window.
   If GitHub's check is still red after that, delete and re-create the identical
   record at nic.ua (forces republish on all uadns nodes) and Check again.
3. **Commercial email receipt/reply unverified.** No message has been sent to /
   received from `obsidixz.commercial@outlook.com` by this build's author. Requires a
   human test with mailbox access. Not a code defect — outstanding delivery evidence.
4. **Founder/brand review pending.** Visual QA was performed by the build agent, not
   by the founder. Copy, imagery and the lockup application should be approved before
   wide release. No approval is implied anywhere.
5. **Retention claims are policy, not audited fact.** The site states a 24-month
   retention / 12-month review **policy decision**; actual mailbox configuration and
   provider-held copies are not audited and are explicitly not claimed either way.
6. **Hero impact at very wide screens.** Hero photograph is 1408 px wide (source
   limitation); at ≥1600 px it is slightly soft inside its cropped frame.

## Toolchain notes

7. **Astro pinned to 7.3.8.** `astro@7.4.x` requires Node ≥22.23.4; this sandbox has
   22.22.3. Do not bump without a Node upgrade.
8. **Browser checks are now declared dependencies.** `puppeteer-core` and
   `@sparticuz/chromium` are devDependencies — `npm ci` is sufficient on a normal
   machine with common Chromium system libraries. CI (GitHub `ubuntu-latest`) installs
   those libraries with `apt-get` and runs the same script (see
   `.github/workflows/deploy.yml`, `browser` job). The **build sandbox** has no system
   NSPR/NSS, so it used source-built libraries under `/tmp/nssbuild` (NSPR 4.39 via
   codeload tarball, configured with `--enable-64bit` after the default chose `-m32`;
   NSS 3.133 via `build.sh --gcc --opt --disable-tests --with-nspr=…`). Those are
   **not** committed; rebuild per `CONTINUATION.md` if you are in that sandbox again.
9. **`npm run check` hint:** `document.execCommand('copy')` is deprecated (used
   intentionally as fallback when the async Clipboard API is unavailable or denied).
   Success and denial paths are both tested.
10. **Headless "view" limitations.** Screenshots prove the served production DOM
    renders as shown; they do not prove real-user network conditions or every email
    client's mailto handling.
11. **"200% root font-size" is not browser zoom.** The text-size check simulates a
    larger root font size; real browser zoom cannot be driven reliably from
    puppeteer-core and is untested. Do not describe it as a zoom pass.
12. **Inert-based menu isolation.** While the mobile menu is open, background content
    (`main`, `.site-header__inner`, `.site-footer`, `.skip-link`) is marked `inert` +
    `aria-hidden`. Browsers without `inert` support (pre-2022) keep `aria-modal`
    semantics removal and Escape/focus-trap behaviour but lose pointer isolation; this
    is accepted and documented rather than polyfilled.
13. **Headless lazy-loading timing.** Programmatic scrolling produces no frames in
    this Chromium, so scroll-driven lazy images are additionally force-loaded
    (`loading="eager"`) inside the harness before measurement/capture. Real browsers
    lazy-load on scroll normally. The broken-image assertion only counts images that
    participate in layout (elements in the hidden mobile menu are excluded).
14. **Inert click-through nuance.** A physical click on inert background moves focus
    to `<body>` in Chrome; clicks never activate background controls. The harness
    asserts focus never lands *on a background control* and the URL never changes —
    the actual isolation contract.

## Cosmetic / accepted

15. **`.menu-btn` hover border on mobile** — decorative only, no functional impact.
16. **Sitemap contents confirmed** post-build: `dist/sitemap-0.xml` lists exactly the 8
    route pages (no 404). Re-check after any route additions.
17. **`og:image`** points at `/images/og-cover.jpg` (1200×630, crop of hero). Some
    platforms cache aggressively; first share may serve a stale card after any change.
18. **`/how-it-works` inline grid number column** is `3.25rem` at all widths —
    deliberate for the numeral-aligned editorial look.

## Not issues (explicitly ruled out)

- No horizontal scroll at any of the five tested widths (320/390/768/1024/1440) nor at
  200% root font-size — tested, fixed, re-tested (50 route×width combinations pass).
- No console errors or failed requests in any tested route.
- The editorial and hero images load when scrolled into view (forced in headless runs;
  natural load verified in desktop/mobile full-page captures — the earlier "blank
  editorial region" was a harness gap, not a site defect).
- Fonts are confirmed loaded (not merely declared): `document.fonts` reports Montserrat
  and Open Sans as `loaded`.
