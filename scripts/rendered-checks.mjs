/**
 * Rendered-browser checks for the production build.
 *
 * Dependencies (declared in package.json, installed by `npm ci`):
 *   - @sparticuz/chromium   (bundled Chromium binary — no browser CDN download)
 *   - puppeteer-core        (drives that binary)
 *
 * Linux system libraries are required for the bundled Chromium to start.
 *   - CI (GitHub-hosted ubuntu-latest) installs them with apt-get — see
 *     .github/workflows/deploy.yml, "browser" job.
 *   - A developer machine with a normal desktop/browser environment normally
 *     already has them.
 *   - A minimal sandbox without NSPR/NSS: build them from Mozilla sources
 *     (codeload.github.com mirrors) and export
 *       LD_LIBRARY_PATH=<nspr-install>/lib:<dist>/Release/lib
 *     The exact sandbox procedure is documented in README.md → "Testing".
 *
 * Prerequisites:
 *   - `dist/` built (`npm run build`) and served locally, e.g.
 *       npm run preview -- --port 4321
 *     or `npx astro preview --port 4321` (add `--host 0.0.0.0` in containers).
 *
 * Usage:
 *   node scripts/rendered-checks.mjs check      # 5 widths × 9 routes + 200% root font-size simulation
 *   node scripts/rendered-checks.mjs interact   # menu (open/Escape/focus return/background isolation/resize),
 *                                               # copy button (success + clipboard-denied failure paths),
 *   node scripts/rendered-checks.mjs nojs       # JavaScript disabled: static nav, exact mailto, no dialog semantics
 *   node scripts/rendered-checks.mjs shots      # screenshot set into verification/screenshots/
 *   node scripts/rendered-checks.mjs all        # check + interact + nojs + shots
 *
 * Environment:
 *   BASE_URL    target origin (default http://127.0.0.1:4321)
 *   SHOTS_DIR   screenshot output dir (default ./verification/screenshots)
 *
 * Scope notes (honest limits):
 *   - "200% root font-size" simulates text-size preference; it is NOT a
 *     substitute for real browser zoom, which cannot be driven reliably from
 *     puppeteer-core and is untested here.
 *   - This harness cannot verify the live GitHub Pages deployment; point
 *     BASE_URL at any reachable instance to check another environment.
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.env.SHOTS_DIR ?? join(ROOT, 'verification', 'screenshots');
const ROUTES = ['/', '/services', '/how-it-works', '/industries', '/about', '/contact', '/privacy', '/terms', '/404.html'];
const WIDTHS = [320, 390, 768, 1024, 1440];
const EXACT_MAILTO = 'mailto:obsidixz.commercial@outlook.com?subject=Obsidixz%20Commercial%20%E2%80%94%20Website%20enquiry';

const mode = process.argv[2] ?? 'check';
const failures = [];
const fail = (msg) => {
  failures.push(msg);
  console.error(`FAIL  ${msg}`);
};

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: chromium.headless,
  defaultViewport: { width: 1440, height: 900 },
});

const newPage = (width, height) => browser.newPage().then(async (p) => {
  await p.setViewport({ width, height });
  return p;
});

/** Scroll the page so lazily-loaded images load; returns VISIBLE broken images. */
async function settleLazy(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.75));
    const max = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0);
    for (let y = 0; y < max; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo({ top: max, behavior: 'instant' });
    // Headless Chromium does not always paint between programmatic scrolls, so
    // scroll-driven lazy loading is not guaranteed to fire. Force any remaining
    // lazy images to load now — this still verifies fetchability and decoding,
    // which is what the broken-image assertion below checks.
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      img.loading = 'eager';
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  // Only count images that actually participate in layout — images inside the
  // hidden mobile menu are display:none, lazy and legitimately unloaded.
  const isVisible = (img) => img.offsetParent !== null || img.getClientRects().length > 0;
  await page.evaluate(async (visSource) => {
    const isVisible = eval(visSource);
    const pending = Array.from(document.images)
      .filter(isVisible)
      .filter((img) => !img.complete || img.naturalWidth === 0);
    await Promise.all(
      pending.map(
        (img) =>
          new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
            setTimeout(res, 4000);
          })
      )
    );
  }, isVisible.toString());
  return page.evaluate((visSource) => {
    const isVisible = eval(visSource);
    return Array.from(document.images)
      .filter(isVisible)
      .filter((img) => img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src);
  }, isVisible.toString());
}

const watch = (page, consoleErrors, failedRequests, expected404Url = null) => {
  page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
  page.on('requestfailed', (req) => failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`));
  page.on('response', (res) => {
    if (res.status() >= 400) {
      // A document that is *supposed* to be a 404 page is not a failed asset.
      if (expected404Url && res.url() === expected404Url) return;
      failedRequests.push(`${res.url()} :: HTTP ${res.status()}`);
    }
  });
};
const report = (tag, consoleErrors, failedRequests) => {
  consoleErrors.forEach((e) => console.log(`      console: ${e}`));
  failedRequests.forEach((e) => console.log(`      request: ${e}`));
};

/* ---------------------------------- check ---------------------------------- */
if (mode === 'check' || mode === 'all') {
  for (const width of WIDTHS) {
    for (const route of [...ROUTES, '/this-route-does-not-exist-9f3b2']) {
      const expect404 = route.startsWith('/this-route-does-not-exist');
      const page = await newPage(width, 900);
      const consoleErrors = [];
      const failedRequests = [];
      watch(page, consoleErrors, failedRequests, expect404 ? BASE + route : null);

      const routeIsExpected404 = expect404;
      const res = await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
      if (routeIsExpected404) {
        // The document itself 404s — drop the resulting console noise for this line.
        for (let i = consoleErrors.length - 1; i >= 0; i--) {
          if (/Failed to load resource/.test(consoleErrors[i])) consoleErrors.splice(i, 1);
        }
      }
      const status = res.status();
      const brokenImages = await settleLazy(page);
      const metrics = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      const overflow = metrics.scrollW - metrics.innerW;

      // Expected 404s: the route must serve HTTP 404 AND the branded 404 page.
      const statusOk = expect404 ? status === 404 : status === 200 || status === 304;
      let branded404 = true;
      if (expect404) {
        const h1 = await page.$eval('h1', (el) => el.textContent ?? '').catch(() => '');
        branded404 = h1.toLowerCase().includes('catalogue');
      }

      const bad = !statusOk || !branded404 || overflow > 1 || consoleErrors.length > 0 || failedRequests.length > 0 || brokenImages.length > 0;
      console.log(`${bad ? 'FAIL' : 'PASS'}  ${width}px ${route}  status=${status}${expect404 ? ' (expected 404)' : ''} overflow=${overflow > 1 ? '+' + overflow : 'none'} consoleErrors=${consoleErrors.length} failedReq=${failedRequests.length} brokenImgs=${brokenImages.length}`);
      if (!statusOk) fail(`${width}px ${route}: status ${status}${expect404 ? ' (wanted 404)' : ''}`);
      if (!branded404) fail(`${width}px ${route}: 404 page rendered but branded h1 missing`);
      if (overflow > 1) fail(`${width}px ${route}: horizontal overflow +${overflow}px`);
      if (consoleErrors.length) { report(null, consoleErrors, []); fail(`${width}px ${route}: console errors`); }
      if (failedRequests.length) { report(null, [], failedRequests); fail(`${width}px ${route}: failed requests`); }
      brokenImages.forEach((src) => fail(`${width}px ${route}: image failed to load: ${src}`));
      await page.close();
    }
  }

  // Text-size preference simulation: 200% root font-size (≈200% of 16px).
  // NOT equivalent to real browser zoom — see scope notes in header.
  for (const route of ['/', '/services', '/contact']) {
    const page = await newPage(390, 900);
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    const overflow = await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px'; // 200% of the 16px default
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    const bad = overflow > 1;
    console.log(`${bad ? 'FAIL' : 'PASS'}  390px + 200% root font-size ${route}  overflow=${bad ? '+' + overflow : 'none'} (text-size simulation, not browser zoom)`);
    if (bad) fail(`200% root font-size ${route}: horizontal overflow +${overflow}px`);
    await page.close();
  }
}

/* --------------------------------- interact --------------------------------- */
if (mode === 'interact' || mode === 'all') {
  const ctx = browser.defaultBrowserContext();
  await ctx.overridePermissions(BASE, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

  // --- Copy button, success path ---
  const ok_page = await newPage(1280, 900);
  await ok_page.goto(BASE + '/contact', { waitUntil: 'networkidle0', timeout: 45000 });
  await ok_page.click('#copy-email');
  await new Promise((r) => setTimeout(r, 400));
  const status = await ok_page.$eval('#copy-status', (el) => el.textContent.trim());
  const isError = await ok_page.$eval('#copy-status', (el) => el.classList.contains('is-error'));
  const copied = await ok_page.evaluate(async () => {
    try { return await navigator.clipboard.readText(); } catch { return '<unreadable>'; }
  });
  const ok = status === 'Email address copied' && !isError && copied === 'obsidixz.commercial@outlook.com';
  console.log(`${ok ? 'PASS' : 'FAIL'}  copy-email success: status="${status}" isError=${isError} clipboard="${copied}"`);
  if (!ok) fail('copy-email success path');
  await ok_page.close();

  // --- Copy button, clipboard API denial → failure announcement + fallback shown ---
  const deny_page = await newPage(1280, 900);
  await deny_page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) },
      configurable: true,
    });
    document.execCommand = () => false;
  });
  await deny_page.goto(BASE + '/contact', { waitUntil: 'networkidle0', timeout: 45000 });
  await deny_page.click('#copy-email');
  await new Promise((r) => setTimeout(r, 400));
  const denyStatus = await deny_page.$eval('#copy-status', (el) => el.textContent.trim());
  const denyIsError = await deny_page.$eval('#copy-status', (el) => el.classList.contains('is-error'));
  const denyOk = denyIsError && denyStatus.length > 0 && denyStatus !== 'Email address copied';
  console.log(`${denyOk ? 'PASS' : 'FAIL'}  copy-email denial: status="${denyStatus}" isError=${denyIsError}`);
  if (!denyOk) fail('copy-email denial path: failure announcement missing');
  await deny_page.close();

  // --- Copy button, no clipboard API at all, execCommand works (legacy fallback) ---
  const leg_page = await newPage(1280, 900);
  await leg_page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    document.execCommand = () => true;
  });
  await leg_page.goto(BASE + '/contact', { waitUntil: 'networkidle0', timeout: 45000 });
  await leg_page.click('#copy-email');
  await new Promise((r) => setTimeout(r, 400));
  const legStatus = await leg_page.$eval('#copy-status', (el) => el.textContent.trim());
  const legOk = legStatus === 'Email address copied';
  console.log(`${legOk ? 'PASS' : 'FAIL'}  copy-email legacy fallback: status="${legStatus}"`);
  if (!legOk) fail('copy-email legacy fallback path');
  await leg_page.close();

  // --- Menu: open → isolation → Escape → focus return ---
  const m = await newPage(390, 844);
  await m.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  const expandedBefore = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const bodyClassBefore = await m.evaluate(() => document.body.classList.contains('menu-open'));
  await m.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 300));

  const expandedOpen = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const dialogVisible = await m.$eval('#mobile-menu', (el) => getComputedStyle(el).display !== 'none' && el.classList.contains('is-open'));
  const dialogRole = await m.$eval('#mobile-menu', (el) => el.getAttribute('role'));
  const dialogModal = await m.$eval('#mobile-menu', (el) => el.getAttribute('aria-modal'));
  const focusedInMenu = await m.evaluate(() => document.activeElement?.closest('#mobile-menu') !== null);
  const inertMain = await m.evaluate(() => document.querySelector('main')?.hasAttribute('inert'));
  const inertFooter = await m.evaluate(() => document.querySelector('.site-footer')?.hasAttribute('inert'));
  const inertHeaderInner = await m.evaluate(() => document.querySelector('.site-header__inner')?.hasAttribute('inert'));
  const bodyOpen = await m.evaluate(() => document.body.classList.contains('menu-open'));
  // Background interaction attempt: a click landing on inert background (or on the
  // overlay) must neither navigate nor move focus onto a background control.
  const urlBefore = m.url();
  await m.mouse.click(5, 5).catch(() => {});
  const focusInBackground = await m.evaluate(() => {
    const bg = ['main', '.site-header__inner', '.site-footer', '.skip-link']
      .map((s) => document.querySelector(s))
      .filter(Boolean);
    const a = document.activeElement;
    return bg.some((el) => el.contains(a));
  });
  const urlUnchanged = m.url() === urlBefore;
  const bgIsolated = !focusInBackground && urlUnchanged;
  await m.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));
  const expandedClosed = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const dialogClosed = await m.$eval('#mobile-menu', (el) => !el.classList.contains('is-open'));
  const roleRemoved = await m.$eval('#mobile-menu', (el) => el.getAttribute('role'));
  const inertReleased = await m.evaluate(() => !document.querySelector('main')?.hasAttribute('inert') && !document.querySelector('.site-footer')?.hasAttribute('inert'));
  const focusReturned = await m.evaluate(() => document.activeElement?.classList.contains('menu-btn'));
  const bodyClassAfter = await m.evaluate(() => document.body.classList.contains('menu-open'));
  console.log(`menu: expanded ${expandedBefore}→${expandedOpen} role=${dialogRole} aria-modal=${dialogModal} focusInMenu=${focusedInMenu} inert(main/footer/inner)=${inertMain}/${inertFooter}/${inertHeaderInner} bodyOpen=${bodyOpen} bgClickIsolated=${bgIsolated} urlUnchanged=${urlUnchanged}`);
  console.log(`menu after Escape: expanded=${expandedClosed} closed=${dialogClosed} roleRemoved=${roleRemoved === null} inertReleased=${inertReleased} focusReturned=${focusReturned} bodyMenuOpen=${bodyClassAfter}`);
  const menuOk = [
    expandedBefore === 'false', !bodyClassBefore, expandedOpen === 'true', dialogVisible,
    dialogRole === 'dialog', dialogModal === 'true', focusedInMenu,
    inertMain, inertFooter, inertHeaderInner, bodyOpen, bgIsolated,
    expandedClosed === 'false', dialogClosed, roleRemoved === null, inertReleased,
    focusReturned, !bodyClassAfter,
  ].every(Boolean);
  console.log(`${menuOk ? 'PASS' : 'FAIL'}  mobile menu open/isolate/escape/focus-return cycle`);
  if (!menuOk) fail('mobile menu cycle');
  await m.close();

  // --- Menu open at 390px, resize to desktop: must close and release isolation ---
  const rz = await newPage(390, 844);
  await rz.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  await rz.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 300));
  await rz.setViewport({ width: 1440, height: 900 });
  await new Promise((r) => setTimeout(r, 400));
  const rzOpen = await rz.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const rzClosed = await rz.$eval('#mobile-menu', (el) => !el.classList.contains('is-open'));
  const rzInert = await rz.evaluate(() => document.querySelector('main')?.hasAttribute('inert'));
  const resizeOk = rzOpen === 'false' && rzClosed && !rzInert;
  console.log(`${resizeOk ? 'PASS' : 'FAIL'}  breakpoint resize closes menu: expanded=${rzOpen} closed=${rzClosed} mainInert=${rzInert}`);
  if (!resizeOk) fail('menu breakpoint resize behaviour');
  await rz.close();
}

/* ----------------------------------- nojs ---------------------------------- */
if (mode === 'nojs' || mode === 'all') {
  const p = await newPage(390, 844);
  await p.setJavaScriptEnabled(false);
  await p.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });

  const btnDisplay = await p.$eval('.menu-btn', (el) => getComputedStyle(el).display);
  const menuVisible = await p.$eval('#mobile-menu', (el) => getComputedStyle(el).display !== 'none');
  const navLinks = await p.$$eval('.mnav__links a', (els) => els.length);
  const dialogRoles = await p.$$eval('[role="dialog"]', (els) => els.length);
  const modalAttrs = await p.$$eval('[aria-modal]', (els) => els.length);
  const mainLinksVisible = await p.$$eval('.site-nav a', (els) => els.filter((el) => getComputedStyle(el).display !== 'none').length);
  const noJsOk = [btnDisplay === 'none', menuVisible, navLinks >= 6, dialogRoles === 0, modalAttrs === 0].every(Boolean);
  console.log(`${noJsOk ? 'PASS' : 'FAIL'}  no-JS mobile: menu-btn display=${btnDisplay} mnav visible=${menuVisible} links=${navLinks} dialogRoles=${dialogRoles} aria-modal attrs=${modalAttrs} (desktop inline nav links visible: ${mainLinksVisible})`);
  if (!noJsOk) fail('no-JS static navigation fallback');

  // Contact page without JS: exact mailto literal and selectable address
  await p.goto(BASE + '/contact', { waitUntil: 'networkidle0', timeout: 45000 });
  const hrefs = await p.$$eval('a[href]', (els) => els.map((el) => el.getAttribute('href')));
  const hasExactMailto = hrefs.includes(EXACT_MAILTO);
  const addressVisible = await p.evaluate(() => document.body.innerText.includes('obsidixz.commercial@outlook.com'));
  const primaryHref = await p.$eval('.email-panel a.btn--primary', (el) => el.getAttribute('href')).catch(() => '');
  const copyHidden = await p.$eval('#copy-email', (el) => getComputedStyle(el).display === 'none' || getComputedStyle(el).visibility === 'hidden').catch(() => null);
  const contactNoJsOk = hasExactMailto && addressVisible && primaryHref === EXACT_MAILTO;
  console.log(`${contactNoJsOk ? 'PASS' : 'FAIL'}  no-JS contact: exact-mailto=${hasExactMailto} primaryHrefExact=${primaryHref === EXACT_MAILTO} addressVisible=${addressVisible} copyButtonHidden=${copyHidden}`);
  if (!contactNoJsOk) fail('no-JS contact page mailto/address');
  await p.close();
}

/* ---------------------------------- shots ---------------------------------- */
if (mode === 'shots' || mode === 'all') {
  mkdirSync(SHOTS, { recursive: true });
  const shot = async (route, width, height, name, { fullPage = false, scroll = false, target = null } = {}) => {
    const page = await newPage(width, height);
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    await settleLazy(page); // lazy images must be fetched before capture
    if (target) {
      const el = await page.$(target);
      if (el) {
        await page.evaluate((target) => {
          document.querySelector(target)?.scrollIntoView({ behavior: 'instant', block: 'center' });
        }, target);
        await new Promise((r) => setTimeout(r, 350));
      } else {
        console.log(`WARN target ${target} not found on ${route}`);
      }
    } else if (scroll && !fullPage) {
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await new Promise((r) => setTimeout(r, 250));
    }
    await page.screenshot({ path: join(SHOTS, name), fullPage });
    await page.close();
    console.log('saved', name);
  };
  await shot('/', 1440, 900, 'home-desktop-header-hero-1440x900.png');
  await shot('/', 1440, 900, 'home-desktop-full-1440.png', { fullPage: true, scroll: true });
  await shot('/', 1440, 900, 'home-lower-editorial-1440x900.png', { target: '#packaging-heading' });
  await shot('/', 390, 844, 'home-mobile-390x844.png', { fullPage: true, scroll: true });
  await shot('/services', 1440, 900, 'services-desktop-1440x900.png');
  await shot('/how-it-works', 1440, 900, 'how-it-works-desktop-1440x900.png');
  await shot('/contact', 1440, 900, 'contact-desktop-1440x900.png');
  await shot('/contact', 390, 844, 'contact-mobile-390x844.png');

  const page = await newPage(390, 844);
  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  await page.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: join(SHOTS, 'mobile-menu-expanded-390x844.png') });
  console.log('saved mobile-menu-expanded-390x844.png');
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} rendered check(s) FAILED`);
  process.exit(1);
}
console.log('\nRendered checks complete.');
