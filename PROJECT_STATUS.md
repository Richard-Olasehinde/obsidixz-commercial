# PROJECT STATUS — Obsidixz Commercial

**Date:** 2026-11-10 · **Branch:** `arena/7c77ed96-obsidixz-commercial` (PR open, not merged) · **Repo:** `Richard-Olasehinde/obsidixz-commercial`
**Date context:** all dates 2026-11-10 UTC unless stated otherwise.

## Revision under review

Buyer-journey redesign of the homepage (see `DECISION_LOG.md` 33–37): the page is
organised around the buyer's four questions, in order — sourcing question → Supplier
Discovery scope/boundaries → the report (tangible, labelled *Illustrative report
structure*) → the discussion-to-report process. The packaging section is structured rows
with per-category research detail; the notebook/workbench photograph was removed from
the homepage (retained on /industries). CTAs site-wide now read "Discuss your research
needs" (discussion, not purchase). Approved scope, palette, Montserrat/Open Sans, logo
lockup, enquiry subject, mailto literal, copy-button behaviour and routes are unchanged.

## Stage results

| Stage | Status | Evidence |
|---|---|---|
| 1. Foundation | **PASS** | Astro 7.3.8, 8 routes + 404, authentic assets, self-hosted fonts (unchanged) |
| 2. Homepage redesign | **PASS** | Served production build inspected at 1440/390; screenshots in `verification/screenshots/` (after) vs `verification/baseline/` (genuine before, same build at `ae0f6cf`) |
| 3. Interior pages | **PASS** | CTA wording only; routes build and render; Services/How/Industries/About/Contact/Privacy/Terms copy unchanged in substance |
| 4. Navigation & contact | **PASS** | Menu isolation/Escape/focus-return; copy success + denial + legacy fallback; no-JS static nav; re-verified this revision |
| 5. Responsive/a11y polish | **PASS** | 5 widths × 10 routes (incl. expected-404) — no overflow, no console errors, no failed requests, no broken visible images; criteria table stacks on <48rem with labelled cells; 200% root font-size clean |
| 6. Discoverability | **PASS** | Unique titles/descriptions (home description rewritten for the redesign; contact title updated), canonicals, OG/Twitter, favicon set, sitemap (unchanged) |
| 7. Rendered verification | **PASS** | Served production build under headless Chromium: `check` 53/53, `interact` 5/5, `nojs` 2/2, `verify` all-pass, `astro check` 0 errors (5 pre-existing hints) |
| 8. Delivery | **PARTIAL** | HTTPS **independently confirmed working by the founder (2026-11-10)**. Formal live-verification pass on all routes over HTTPS not yet run. Feature branch never deploys; `main` alone deploys after founder merge authorisation |

## Required delivery statuses

1. **Code implementation & tests run — DONE.** `npm run build` ✓, `npm run check`
   (0 errors) ✓, `npm run verify` ✓, rendered sweep 53/53 ✓, interaction suite ✓,
   no-JS suite ✓, 200% root font-size pass ✓, screenshots refreshed ✓. Not run:
   Lighthouse/axe (not available in this environment).
2. **Visual acceptance — PASS, founder review pending.** Evidence:
   `verification/screenshots/` (after, this revision) vs `verification/baseline/`
   (before, same build at `ae0f6cf`): desktop full page, mobile full page, hero/header,
   packaging rows, report exhibit (desktop + mobile), services, how-it-works, contact
   (1440/390), expanded mobile menu. No founder approval has been given or implied.
3. **Deployment & domain verification — HTTPS CONFIRMED WORKING (founder-confirmed
   2026-11-10).** The founder reports the HTTPS destination independently confirmed
   working on 10 November 2026. This session did not re-verify the live domain; the
   record is the founder's report. A full live HTTPS pass (routes, assets, canonicals,
   headers) remains worthwhile after merge and is recorded as outstanding here until run.
   The redesign itself is **not deployed**: pushes from this branch run CI but never
   deploy; `main` deploys only after the founder merges.
4. **Commercial email receipt/reply — NOT DONE.** A real message to and reply from
   `obsidixz.commercial@outlook.com` has not been evidenced. Do not cite mailto as proof.

## Outstanding items (owner)

- Founder: review the PR preview (before/after screenshots in the PR), then merge or
  request changes. Merge = the only publish path (`main`-gated workflow).
- Founder/tester: send a real enquiry; record receipt and reply here.
- Founder: run or authorise the live HTTPS verification pass post-merge (routes, sitemap,
  sitemap-index.xml, robots.txt, canonicals) and record results here.
- Founder: visual/brand sign-off on the redesigned homepage.
