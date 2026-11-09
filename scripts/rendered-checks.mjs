/**
 * Rendered-browser checks for the production build.
 * Requires: dist/ served on BASE (default http://127.0.0.1:4321).
 * Uses @sparticuz/chromium + puppeteer-core (system NSS/NSPR via LD_LIBRARY_PATH).
 *
 * Usage:
 *   export LD_LIBRARY_PATH=/tmp/pwtest/nspr-install/lib:/tmp/pwtest/dist/Release/lib
 *   node rendered-checks.mjs            # overflow + console/request checks on 5 widths
 *   node rendered-checks.mjs shots      # capture the screenshot set into verification/screenshots/
 *   node rendered-checks.mjs interact   # menu + copy-button interaction checks
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.env.SHOTS_DIR ?? join(ROOT, 'verification', 'screenshots');
const ROUTES = ['/', '/services', '/how-it-works', '/industries', '/about', '/contact', '/privacy', '/terms', '/404.html'];
const WIDTHS = [320, 390, 768, 1024, 1440];

const mode = process.argv[2] ?? 'check';

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args,
  headless: chromium.headless,
  defaultViewport: { width: 1440, height: 900 },
});

const failures = [];

async function newPage(width, height) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  return page;
}

if (mode === 'check' || mode === 'all') {
  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      const page = await newPage(width, 900);
      const consoleErrors = [];
      const failedRequests = [];
      page.on('console', (msg) => msg.type() === 'error' && consoleErrors.push(msg.text()));
      page.on('requestfailed', (req) => failedRequests.push(`${req.url()} :: ${req.failure()?.errorText}`));
      page.on('response', (res) => res.status() >= 400 && failedRequests.push(`${res.url()} :: HTTP ${res.status()}`));
      const res = await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
      const metrics = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
        bodyZoomFont: getComputedStyle(document.documentElement).fontSize,
      }));
        const overflow = metrics.scrollW - metrics.innerW;
      const status = res.status();
      const bad = [
        !(status === 200 || status === 304),
        overflow > 1,
        consoleErrors.length > 0,
        failedRequests.length > 0,
      ].some(Boolean);
      console.log(`${bad ? 'FAIL' : 'PASS'}  ${width}px ${route}  status=${status} scrollWidth=${metrics.scrollW} innerWidth=${metrics.innerW} overflow=${overflow > 1 ? '+' + overflow : 'none'} consoleErrors=${consoleErrors.length} failedReq=${failedRequests.length}`);
      if (bad) {
        consoleErrors.forEach((e) => console.log(`      console: ${e}`));
        failedRequests.forEach((e) => console.log(`      request: ${e}`));
        failures.push(`${width}px ${route}`);
      }
      await page.close();
    }
  }

  // Text zoom simulation: 200% root font size, watch overflow on key pages
  for (const route of ['/', '/services', '/contact']) {
    const page = await newPage(390, 900);
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    const overflow = await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px'; // 200% of 16px
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    const bad = overflow > 1;
    console.log(`${bad ? 'FAIL' : 'PASS'}  390px+200% text-zoom ${route}  overflow=${bad ? '+' + overflow : 'none'}`);
    if (bad) failures.push(`text-zoom ${route}`);
    await page.close();
  }
}

if (mode === 'shots' || mode === 'all') {
  mkdirSync(SHOTS, { recursive: true });
  const shot = async (route, width, height, name, fullPage = false) => {
    const page = await newPage(width, height);
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.screenshot({ path: join(SHOTS, name), fullPage });
    await page.close();
    console.log('saved', name);
  };
  await shot('/', 1440, 900, 'home-desktop-header-hero-1440x900.png');
  await shot('/', 1440, 900, 'home-desktop-full-1440.png', true);
  await shot('/', 390, 844, 'home-mobile-390x844.png', true);
  await shot('/services', 1440, 900, 'services-desktop-1440x900.png');
  await shot('/how-it-works', 1440, 900, 'how-it-works-desktop-1440x900.png');
  await shot('/contact', 1440, 900, 'contact-desktop-1440x900.png');
  await shot('/contact', 390, 844, 'contact-mobile-390x844.png');

  // Expanded mobile menu
  const page = await newPage(390, 844);
  await page.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  await page.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 450));
  await page.screenshot({ path: join(SHOTS, 'mobile-menu-expanded-390x844.png') });
  console.log('saved mobile-menu-expanded-390x844.png');
  await page.close();
}

if (mode === 'interact' || mode === 'all') {
  // Copy button: success path announcement
  const ctx = browser.defaultBrowserContext();
  await ctx.overridePermissions(BASE, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  const page = await newPage(1280, 900);
  await page.goto(BASE + '/contact', { waitUntil: 'networkidle0', timeout: 45000 });
  await page.click('#copy-email');
  await new Promise((r) => setTimeout(r, 400));
  const status = await page.$eval('#copy-status', (el) => el.textContent.trim());
  const copied = await page.evaluate(async () => {
    try { return await navigator.clipboard.readText(); } catch { return '<unreadable>'; }
  });
  const ok = status === 'Email address copied' && copied === 'obsidixz.commercial@outlook.com';
  console.log(`${ok ? 'PASS' : 'FAIL'}  copy-email success: status="${status}" clipboard="${copied}"`);
  if (!ok) failures.push('copy-email success');
  await page.close();

  // Menu: open, focus, Escape, aria state, focus return
  const m = await newPage(390, 844);
  await m.goto(BASE + '/', { waitUntil: 'networkidle0', timeout: 45000 });
  const expandedBefore = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  await m.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 300));
  const expandedOpen = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const dialogVisible = await m.$eval('#mobile-menu', (el) => getComputedStyle(el).display !== 'none' && el.classList.contains('is-open'));
  const focusedInMenu = await m.evaluate(() => document.activeElement?.closest('#mobile-menu') !== null);
  await m.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));
  const expandedClosed = await m.$eval('.menu-btn', (el) => el.getAttribute('aria-expanded'));
  const dialogClosed = await m.$eval('#mobile-menu', (el) => !el.classList.contains('is-open'));
  const focusReturned = await m.evaluate(() => document.activeElement?.classList.contains('menu-btn'));
  console.log(`menu: expandedBefore=${expandedBefore} -> open=${expandedOpen} dialogVisible=${dialogVisible} focusInMenu=${focusedInMenu} -> esc: expanded=${expandedClosed} closed=${dialogClosed} focusReturned=${focusReturned}`);
  const menuOk = [expandedBefore === 'false', expandedOpen === 'true', dialogVisible, focusedInMenu, expandedClosed === 'false', dialogClosed].every(Boolean);
  console.log(`${menuOk ? 'PASS' : 'FAIL'}  mobile menu open/escape cycle`);
  if (!menuOk) failures.push('mobile menu cycle');
  await m.close();
}

await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} rendered check(s) FAILED`);
  process.exit(1);
}
console.log('\nRendered checks complete.');
