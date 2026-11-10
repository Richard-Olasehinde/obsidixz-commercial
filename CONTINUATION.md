# CONTINUATION — Obsidixz Commercial

_Pick-up guide. Read this first if the session is lost._

## State in one line

Buyer-journey homepage redesign (question → Supplier Discovery scope → tangible
illustrative report → discussion-to-report process; CTAs site-wide read "Discuss your
research needs") on branch `arena/7c77ed96-obsidixz-commercial`, open as a PR against
`main`. **Not merged, not deployed — the preview the founder reviews is this branch's
served production build (or the CI `dist` artifact); `main` alone deploys.** HTTPS was
independently confirmed working by the founder on 2026-11-10 (record is the founder's
report, not a sandbox re-verification). Commercial email receipt/reply remains
unevidenced. Visual/brand sign-off pending.

## Repo & branch

- Remote: `https://github.com/Richard-Olasehinde/obsidixz-commercial.git`
- Working branch: `arena/7c77ed96-obsidixz-commercial` (do not rename; Arena tracks sessions by branch)
- Reproduce locally:

```bash
git clone https://github.com/Richard-Olasehinde/obsidixz-commercial.git
cd obsidixz-commercial
git checkout arena/7c77ed96-obsidixz-commercial
npm ci
npm run build
npm run preview
```

## Verification tooling (actual)

| Command | What it does | Result on this revision |
|---|---|---|
| `npm run build` | Astro static build → `dist/` (9 pages) | PASS |
| `npm run check` | `@astrojs/check` type/content | PASS, 0 errors (5 pre-existing hints) |
| `npm run verify` | Parse-based checks on `dist/` | PASS |
| `npm run test:render` | served `dist/`: 5 widths × 10 routes + 200% root font-size | PASS (53/53) |
| `node scripts/rendered-checks.mjs interact` | menu open/Escape/focus-return/isolation/resize; copy success + denial + legacy fallback | PASS (5/5) |
| `node scripts/rendered-checks.mjs nojs` | JS disabled: static nav, exact mailto, no dialog semantics | PASS (2/2) |
| `node scripts/rendered-checks.mjs shots` | screenshot set → `verification/screenshots/` (incl. new `home-packaging-rows`, `home-report-exhibit`; `home-lower-editorial` renamed) | captured |

Browser checks need the preview running (`npm run preview`, or `npx astro preview
--port 4321`), or set `BASE_URL`. All browser-test dependencies are declared
devDependencies (`puppeteer-core`, `@sparticuz/chromium`) — CI installs Chromium system
libraries via apt and runs the same checks in the `browser` job.

### Re-running the browser checks on a normal machine

```bash
npm ci
npx astro preview --port 4321 &
node scripts/rendered-checks.mjs all
```

### In this build sandbox (no system NSPR/NSS)

```bash
# one-time library build (already done this session; rebuild if /tmp/nssbuild is gone)
cd /tmp && rm -rf nssbuild && mkdir nssbuild && cd nssbuild
curl -sL https://codeload.github.com/mozilla/nspr/tar.gz/refs/heads/NSPR_4_39_BRANCH -o nspr.tar.gz && mkdir nspr-src && tar -xzf nspr.tar.gz -C nspr-src --strip-components=1
curl -sL https://codeload.github.com/mozilla/nss/tar.gz/refs/heads/NSS_3_133_BRANCH -o nss.tar.gz && mkdir nss-src && tar -xzf nss.tar.gz -C nss-src --strip-components=1
cd nspr-src && ./configure --prefix=/tmp/nssbuild/nspr-install --disable-debug --enable-optimize --enable-64bit && make -j2 && make install
cd ../nss-src && python3 -m venv /tmp/nssbuild/pyenv && /tmp/nssbuild/pyenv/bin/pip install -q ninja gyp-next
PATH=/tmp/nssbuild/pyenv/bin:$PATH ./build.sh --gcc --opt --disable-tests --with-nspr=/tmp/nssbuild/nspr-install/include/nspr:/tmp/nssbuild/nspr-install/lib
# the cmd/signtool sub-build fails without zlib and that is fine — the libraries the
# browser needs (libnss3/libnssutil3/libsmime3/libssl3/libsoftokn3/libfreebl3/libsqlite3 +
# NSPR) are produced regardless; ninja stops only at the CLI utilities.
# then, per run:
cd /home/user/obsidixz-commercial
LD_LIBRARY_PATH=/tmp/nssbuild/nspr-install/lib:/tmp/nssbuild/dist/Release/lib \
  node scripts/rendered-checks.mjs all
```

Gotchas: NSPR's configure silently selects `-m32` without `--enable-64bit`; NSS `build.sh`
needs `gyp`/`ninja` on `PATH`; missing zlib.h stops only the `cmd/signtool` utility
(`--disable-tests` does not skip it) — harmless. Note the sandbox's stale `dist` can
report stale results — rebuild (`npm run build`) before trusting any served-page check.

## Evidence

`verification/screenshots/` — refreshed this revision (desktop hero/header, full desktop
page, packaging rows, report exhibit, mobile full page, menu, services, how-it-works,
contact). `verification/baseline/` — genuine before-renders captured from the served
build at `ae0f6cf` before any edits (desktop hero/header, full desktop, mobile full page,
lower-editorial section, report-panel close-up).

## Recovery instructions

| Situation | Recovery |
|---|---|
| `npm run build` fails on Node version | Use Node ≥22.12 with `astro@7.3.8` (pinned). Do not upgrade Astro past 7.3.x without Node ≥22.23.4 |
| Rendered checks can't launch a browser | `npm ci` on a normal machine. In the sandbox, rebuild NSPR/NSS per above. Do not hand-download random browsers |
| Section headings slide under the sticky header on fragment links | `[id]` carries `scroll-margin-top: 8rem` (the sticky header is ~115px tall at desktop because of the approved 112px lockup) — do not lower it |
| Criteria table clips on mobile | Intentionally stacked <48rem with `data-label` cells; wrapper overflow-x is a desktop fallback, not the mobile mechanism |
| Menu does not isolate background | Confirm the `.mnav` has no static `role`/`aria-modal`; the script adds them on open. If broken, see `DECISION_LOG.md` 28 |
| Logo looks wrong | Check `public/brand/` hashes vs `IMAGE_SOURCES.md` (never replace with redrawn art) |
| CTA wording reverts | `"Discuss your research needs"` is the approved CTA (2026-11-10); `verify.mjs` asserts it on the homepage |

## Remaining work, in order

1. Founder: review the PR (screenshots before/after inside it); request changes or
   authorise merge. Merge is the only publish path (deploy gated to `main`).
2. Founder/tester: send a real enquiry to `obsidixz.commercial@outlook.com`; confirm
   receipt and a reply from that account; record both in `PROJECT_STATUS.md`.
3. Founder or any session post-merge: run the live HTTPS verification pass (all 8 routes
   + sitemap + robots + canonicals + a real browser look) and record results in
   `PROJECT_STATUS.md`.
4. Founder visual/brand review of the redesigned homepage.
5. Optional: Search Console / Bing sitemap submission.

## What this project deliberately did NOT build (correct)

Enquiry form/server/database, transactional email, Outlook/SMTP/Brevo/Zoho integrations,
customer accounts, supplier directory, checkout, packages/pricing, verification services,
analytics/pixels. All intentionally out of scope per the brief.
