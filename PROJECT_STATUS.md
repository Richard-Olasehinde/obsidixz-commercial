# PROJECT STATUS — Obsidixz Commercial

**Date:** 2026-11-09 · **Branch:** `arena/70494f4e-obsidixz-commercial` (pushed) · **Repo:** `Richard-Olasehinde/obsidixz-commercial`
**Date context:** all dates 2026-11-09 UTC.

## Revision under review

Independent-review corrections (see `DECISION_LOG.md` 25–31): Terms scope/liability
cleanup; services copy (no negotiation/purchasing-authority expansion, no categorical
fee ban); privacy rewritten to actual GitHub Pages hosting + Microsoft Outlook handling;
contact response-time claim removed; about equity claim removed; mobile menu background
isolation via `inert` + no dialog semantics without JS; reproducible browser testing
declared in `devDependencies`; CI split structural/browser jobs; production deploy gated
to `main` (including manual dispatch selected on main); rendered checks extended
(focus-return assertion, clipboard denial/legacy fallback paths, no-JS suite, expected-404
handling, deterministic lazy-image loading, honest "200% root font-size" labelling).

## Stage results

| Stage | Status | Evidence |
|---|---|---|
| 1. Foundation | **PASS** | Astro 7.3.8, 8 routes + 404, authentic assets, self-hosted fonts (unchanged) |
| 2. Homepage | **PASS** | Photographic hero + editorial notebook image; screenshots re-captured on this revision (`home-*`, `home-lower-editorial-1440x900.png`) |
| 3. Seven interior pages | **PASS** | Services/How/Industries/About/Contact/Privacy/Terms — copy corrected; routes build and render |
| 4. Navigation & contact | **PASS** | Menu open/isolate/Escape/focus-return; breakpoint reset closes menu; inert background (main/header-inner/footer/skip-link); copy success + denial + legacy fallback all pass; no-JS static nav + exact mailto literal pass |
| 5. Responsive/a11y polish | **PASS** | 5 widths × 10 routes (incl. expected-404) — no overflow, no console errors, no failed requests, no broken visible images; 200% root font-size clean |
| 6. Discoverability | **PASS** | Unique titles/descriptions, canonicals, OG/Twitter, favicon set, sitemap (8 URLs), robots (unchanged) |
| 7. Rendered verification | **PASS** | Served production build under headless Chromium; screenshots identified below; dev-server smoke pass (200s on `/`, `/services`, `/contact`) |
| 8. Delivery | **PARTIAL** | Live over HTTP from `main` (deployed earlier after PR #1 merge). HTTPS **not** yet verified — certificate pending provisioning; GitHub reports only workflow-based deployment should occur from `main`; feature branches never deploy |

## Four required delivery statuses

1. **Code implementation & tests run — DONE.** `npm run build` ✓, `npm run check` (0 errors) ✓,
   `npm run verify` ✓, rendered-browser sweep 50/50 ✓, interaction suite ✓, no-JS suite ✓,
   200% root font-size pass ✓. Not run: Lighthouse/axe suites (not available in this
   environment; manual contrast/focus checks documented in the build record).
2. **Visual acceptance — PASS, founder review pending.** Evidence:
   `verification/screenshots/` — each produced from the served **production** build at the
   revision of this branch: desktop hero/header 1440×900; full desktop page; packaging
   editorial section; mobile full page 390×844 (editorial image and footer now render);
   expanded mobile menu; Services; How It Works; Contact desktop 1440×900; Contact mobile
   390×844. No founder approval has been given or implied.
3. **Deployment & domain verification — PARTIAL/NOT DONE (HTTPS).** Site is reachable over
   HTTP from `main`. DNS CNAME is correct at the source; a stale pre-fix relative-expansion
   answer persists in at least one cache shard (sampled TTL ~6750 s) and the sandbox's own
   resolver fails lookups entirely right now. Pages API: certificate `state: "new"`,
   `https_enforced: false`, domain verified for the account. **Founder actions:** Settings →
   Pages → **Check again** (once the cache window elapses), wait for issuance, tick
   **Enforce HTTPS**; a live HTTPS fetch of the domain must return 200 with a valid
   certificate before this status can be called done. HTTP-only evidence is documented,
   not rounded up.
4. **Commercial email receipt/reply — NOT DONE.** Send a real message to
   `obsidixz.commercial@outlook.com` and receive a reply from that account; record here.
   Do not reuse Real Estate evidence. Nobody should click-test mailto and call it proof.

## Outstanding items (owner)

- Founder: merge this revision's PR (deploys from `main` only — this branch itself never deploys).
- Founder: **Check again** in Pages settings after the stale-cache TTL elapses (or once GitHub
  reports DNS healthy), wait for certificate issuance, tick **Enforce HTTPS**; then a live HTTPS
  verification pass on all routes (any helper can do this once DNS is clean).
- Founder/tester: send a real enquiry; record receipt and reply here.
- Founder: visual/brand sign-off.
