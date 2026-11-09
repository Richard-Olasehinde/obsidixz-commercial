# CONTINUATION — Obsidixz Commercial

_Pick-up guide. Read this first if the session is lost._

## State in one line

Corrected build (terms/services/privacy/contact/about copy, menu isolation, reproducible
browser tests, main-only deploy workflow) on branch `arena/70494f4e-obsidixz-commercial`,
open as a PR against `main`. Site live over HTTP from `main`; HTTPS pending certificate;
email receipt test outstanding; founder review pending.

## Repo & branch

- Remote: `https://github.com/Richard-Olasehinde/obsidixz-commercial.git`
- Working branch: `arena/70494f4e-obsidixz-commercial` (do not rename; Arena tracks sessions by branch)
- Reproduce locally:

```bash
git clone https://github.com/Richard-Olasehinde/obsidixz-commercial.git
cd obsidixz-commercial
git checkout arena/70494f4e-obsidixz-commercial
npm ci
npm run build
npm run preview
```

## Verification tooling (actual)

| Command | What it does | Result on this revision |
|---|---|---|
| `npm run build` | Astro static build → `dist/` (9 pages) | PASS |
| `npm run check` | `@astrojs/check` type/content | PASS, 0 errors |
| `npm run verify` | Parse-based checks on `dist/` | PASS |
| `npm run test:render` | served `dist/`: 5 widths × 10 routes + 200% root font-size | PASS (50/50 + 3/3) |
| `node scripts/rendered-checks.mjs interact` | menu open/Escape/focus-return/isolation/resize; copy success + denial + legacy fallback | PASS |
| `node scripts/rendered-checks.mjs nojs` | JS disabled: static nav, exact mailto, no dialog semantics | PASS |
| `node scripts/rendered-checks.mjs shots` | screenshot set → `verification/screenshots/` | captured |

Browser checks need the preview running (`npm run preview`, or `npx astro preview --port 4321`),
or set `BASE_URL`. All browser-test dependencies are declared devDependencies
(`puppeteer-core`, `@sparticuz/chromium`) — CI installs Chromium system libraries via apt
and runs the same checks in the `browser` job.

### Re-running the browser checks on a normal machine

```bash
npm ci                       # installs the declared devDependencies
npx astro preview --port 4321 &
node scripts/rendered-checks.mjs all
```

### In this build sandbox (no system NSPR/NSS)

```bash
# one-time library build (already done; rebuild if /tmp/nssbuild is gone)
cd /tmp && rm -rf nssbuild && mkdir nssbuild && cd nssbuild
curl -sL https://codeload.github.com/mozilla/nspr/tar.gz/refs/heads/NSPR_4_39_BRANCH -o nspr.tar.gz && mkdir nspr-src && tar -xzf nspr.tar.gz -C nspr-src --strip-components=1
curl -sL https://codeload.github.com/mozilla/nss/tar.gz/refs/heads/NSS_3_133_BRANCH -o nss.tar.gz && mkdir nss-src && tar -xzf nss.tar.gz -C nss-src --strip-components=1
cd nspr-src && ./configure --prefix=/tmp/nssbuild/nspr-install --disable-debug --enable-optimize --enable-64bit && make -j2 && make install
cd ../nss-src && python3 -m venv /tmp/nssbuild/pyenv && /tmp/nssbuild/pyenv/bin/pip install -q ninja gyp-next
PATH=/tmp/nssbuild/pyenv/bin:$PATH ./build.sh --gcc --opt -j 2 --disable-tests --with-nspr=/tmp/nssbuild/nspr-install/include/nspr:/tmp/nssbuild/nspr-install/lib
# then, per run:
cd /home/user/obsidixz-commercial
LD_LIBRARY_PATH=/tmp/nssbuild/nspr-install/lib:/tmp/nssbuild/dist/Release/lib \
  node scripts/rendered-checks.mjs all
```

Gotchas: NSPR's configure silently selects `-m32` without `--enable-64bit` (fails on
missing 32-bit libc headers); NSS `build.sh` needs `gyp`/`ninja` on `PATH` and fails
building the `cmd/` utilities without zlib headers — `--disable-tests` skips them and the
libraries we need are produced regardless. Note `/tmp/pwtest` from the previous session is
gone; this procedure rebuilds everything under `/tmp/nssbuild`.

## Evidence

`verification/screenshots/` — refreshed on this revision: desktop hero/header (1440×900),
full desktop page, packaging/editorial section, mobile full page (390×844), expanded
mobile menu, Services, How It Works, Contact (1440×900, 390×844). Produced from the
**served production build** (`astro preview` on :4321), with the tested revision and
viewport recorded in each file's context in `PROJECT_STATUS.md`.

## Recovery instructions

| Situation | Recovery |
|---|---|
| `npm run build` fails on Node version | Use Node ≥22.12 with `astro@7.3.8` (pinned). Do not upgrade Astro past 7.3.x without Node ≥22.23.4 |
| Rendered checks can't launch a browser | `npm ci` on a normal machine (devDependencies declared). In the sandbox, rebuild NSPR/NSS per above. Do not hand-download random browsers |
| CSS/fonts "not applied" after pull | `npm ci` then `npm run build`; check `dist/_astro/*.woff2` exists; hard-refresh (304s are cache hits, not errors) |
| Menu does not isolate background | Confirm the `.mnav` has no static `role`/`aria-modal`; the script adds them on open. If broken, see `DECISION_LOG.md` 28 |
| Logo looks wrong | Check `public/brand/` hashes vs `IMAGE_SOURCES.md` (never replace with redrawn art) |
| Sitemap stale | `npm run build` regenerates `dist/sitemap-index.xml` from `site` in `astro.config.mjs` |

## Remaining work, in order

1. Founder: merge the PR for this revision; feature branches never deploy (workflow gates
   deploy to `main`).
2. Founder: Settings → Pages → **Check again** once the stale-cache window (TTL ≤4 h from
   the pre-fix record) has elapsed; wait for certificate issuance; tick **Enforce HTTPS**;
   then run live HTTPS verification (routes, sitemap, assets, canonicals) — see
   `DEPLOYMENT.md` §0.
3. Founder/tester: send a real enquiry to `obsidixz.commercial@outlook.com`; confirm
   receipt and a reply from that account; record both in `PROJECT_STATUS.md`.
4. Founder visual/brand review of the eight pages.
5. Optional: Search Console / Bing sitemap submission.

## What this project deliberately did NOT build (correct)

Enquiry form/server/database, transactional email, Outlook/SMTP/Brevo/Zoho integrations,
customer accounts, supplier directory, checkout, packages/pricing, verification services,
analytics/pixels. All intentionally out of scope per the brief.
