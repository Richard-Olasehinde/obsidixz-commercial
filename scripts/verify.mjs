/**
 * Post-build verification for the static site in dist/.
 * Checks structural, metadata, link and brand invariants across all pages.
 * Run after `npm run build`. Exits non-zero on any failure.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';

const DIST = new URL('../dist/', import.meta.url).pathname;
const EXACT_MAILTO =
  'mailto:obsidixz.commercial@outlook.com?subject=Obsidixz%20Commercial%20%E2%80%94%20Website%20enquiry';

const pages = [
  'index.html',
  'services/index.html',
  'how-it-works/index.html',
  'industries/index.html',
  'about/index.html',
  'contact/index.html',
  'privacy/index.html',
  'terms/index.html',
  '404.html',
];

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures += 1;
};

const titles = new Set();
const descriptions = new Set();

for (const page of pages) {
  const file = join(DIST, page);
  ok(existsSync(file), `${page} exists in dist/`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const { document } = parseHTML(html);

  // Single h1, unique title/description
  const h1s = document.querySelectorAll('h1');
  ok(h1s.length === 1, `${page}: exactly one h1 (found ${h1s.length})`);

  const title = document.querySelector('title')?.textContent?.trim() ?? '';
  ok(title.length > 10, `${page}: title present`);
  titles.add(title);

  const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
  ok(desc.length > 40, `${page}: meta description present`);
  descriptions.add(desc);

  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
  ok(canonical.startsWith('https://commercial.obsidixz.pp.ua'), `${page}: canonical on production domain`);

  // Images: alt attributes present
  const imgs = [...document.querySelectorAll('img')];
  const missingAlt = imgs.filter((img) => !img.hasAttribute('alt'));
  ok(missingAlt.length === 0, `${page}: all <img> have alt (${imgs.length} images)`);

  // Exact mailto must appear wherever the enquiry email link is used with a subject
  const mailtoLinks = [...document.querySelectorAll('a[href^="mailto:"]')].map((a) => a.getAttribute('href'));
  const withSubject = mailtoLinks.filter((h) => h.includes('subject='));
  for (const h of withSubject) {
    ok(h === EXACT_MAILTO, `${page}: mailto with subject is the exact required literal`);
  }

  // Internal links resolve to built pages
  const internal = [...document.querySelectorAll('a[href^="/"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h) => !h.startsWith('//'));
  for (const href of new Set(internal)) {
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '') continue;
    const target = clean.endsWith('/') ? join(DIST, clean, 'index.html') : join(DIST, clean);
    const asDir = join(DIST, clean.replace(/\/$/, ''), 'index.html');
    ok(existsSync(target) || existsSync(asDir) || existsSync(join(DIST, '404.html')),
      `${page}: internal link resolves — ${href}`);
  }

  // Brand lockup invariants: logo image + Commercial label, correct link name
  const lockups = [...document.querySelectorAll('a[aria-label="Obsidixz Commercial home"]')];
  ok(lockups.length >= 1, `${page}: brand lockup link present`);
  for (const lockup of lockups) {
    const img = lockup.querySelector('img');
    ok(img && img.getAttribute('aria-hidden') === 'true', `${page}: lockup image aria-hidden`);
    const label = lockup.querySelector('.lockup__label');
    ok(label && label.textContent.trim() === 'Commercial', `${page}: Commercial label present`);
  }

  // No accidental placeholder text
  ok(!/lorem ipsum/i.test(html), `${page}: no lorem ipsum`);
}

ok(titles.size === pages.length, `titles unique across pages (${titles.size}/${pages.length})`);
ok(descriptions.size === pages.length, `descriptions unique across pages (${descriptions.size}/${pages.length})`);

// Contact page specifics
const contactHtml = existsSync(join(DIST, 'contact/index.html'))
  ? readFileSync(join(DIST, 'contact/index.html'), 'utf8')
  : '';
ok(contactHtml.includes(EXACT_MAILTO), 'contact: exact mailto href present');
ok(contactHtml.includes('mailto:obsidixz.commercial@outlook.com?'), 'contact: mailto prefix intact');
ok(contactHtml.includes('Copy email address'), 'contact: copy button present');
ok(contactHtml.includes('obsidixz.commercial@outlook.com'), 'contact: visible address present');
ok(contactHtml.includes('Please do not include banking credentials'), 'contact: caution notice present');

// Home page essentials
const homeHtml = readFileSync(join(DIST, 'index.html'), 'utf8');
ok(homeHtml.includes('International Procurement Intelligence.'), 'home: positioning line present');
ok(homeHtml.includes('Request Supplier Research'), 'home: primary CTA present');

// Error summary
if (failures > 0) {
  console.error(`\n${failures} verification check(s) FAILED`);
  process.exit(1);
}
console.log('\nAll verification checks passed.');
