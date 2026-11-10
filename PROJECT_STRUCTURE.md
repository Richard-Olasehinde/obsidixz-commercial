# PROJECT STRUCTURE — Obsidixz Commercial

```
.
├─ README.md                    # overview, commands, status pointer
├─ PROJECT_STATUS.md            # stage results, 4 delivery statuses
├─ DECISION_LOG.md              # numbered decisions with rationale
├─ PROJECT_STRUCTURE.md         # this file
├─ KNOWN_ISSUES.md              # limitations & open items
├─ DEPLOYMENT.md                # build/deploy/DNS runbook
├─ CONTINUATION.md              # pick-up guide & recovery steps
├─ IMAGE_SOURCES.md             # image provenance & licences
├─ .gitignore                   # node_modules, dist, .astro, logs
├─ package.json                 # scripts: dev/build/preview/check/verify/test:render/test:render:all
├─ package-lock.json            # reproducible installs
├─ astro.config.mjs             # site=https://commercial.obsidixz.pp.ua, sitemap,
│                               # server.allowedHosts via PREVIEW_ALLOWED_HOSTS
├─ tsconfig.json                # astro/tsconfigs/strict
│
├─ public/
│  ├─ brand/
│  │  ├─ obsidixz-parent-logo-on-light.png   # authentic, 931×785 — light header
│  │  ├─ obsidixz-parent-logo-on-dark.png    # authentic, 931×785 — dark footer
│  │  └─ obsidixz-parent-symbol-transparent.png  # standalone emblem, 2000×1500
│  ├─ images/og-cover.jpg        # 1200×630 crop of generated hero (social cards)
│  ├─ favicon-16x16.png / favicon-32x32.png / favicon-48x48.png   # from emblem
│  ├─ apple-touch-icon.png       # 180×180 on white
│  ├─ android-chrome-192x192.png # on white
│  ├─ android-chrome-512x512.png # on white
│  ├─ site.webmanifest
│  └─ robots.txt               # Allow all + Sitemap: sitemap-index.xml
│
├─ src/
│  ├─ assets/images/
│  │  ├─ hero-packaging-desk.jpg   # generated hero (1408×768)
│  │  └─ research-notebook-desk.jpg # generated editorial (768×1376)
│  ├─ styles/global.css        # tokens, layout, components, responsive, reduced-motion
│  ├─ components/
│  │  ├─ LogoLockup.astro      # parent emblem + "Commercial" label (tone light|dark)
│  │  ├─ SiteHeader.astro      # sticky light header, nav + active states,
│  │  │                         # accessible mobile overlay + inline JS
│  │  └─ SiteFooter.astro      # dark footer: lockup, nav, emails, legal strip
│  ├─ layouts/BaseLayout.astro # head meta/canonical/OG/favicons/noscript fallback,
│  │                            # skip link, header/footer, slot
│  └─ pages/
│     ├─ index.astro           # buyer journey: Q1 question → Supplier Discovery scope →
│     │                         # packaging rows → illustrative report exhibit → dark process →
│     │                         # audience fit → royal CTA
│     ├─ services.astro        # Supplier Discovery, Preliminary Screening, RFQ-conditional,
│     │                         # quotations, scope limits
│     ├─ how-it-works.astro    # 6 numbered steps, no-authorisation notice, FAQ
│     ├─ industries.astro      # packaging categories + criteria; beyond-packaging honesty
│     ├─ about.astro           # emerging business, parent-brand relationship, limits
│     ├─ contact.astro         # exact mailto, selectable address, copy button + status
│     ├─ privacy.astro         # handling, retention, caveats
│     ├─ terms.astro           # scope, exclusions, per-project terms
│     └─ 404.astro             # on-brand dark not-found
│
├─ scripts/
│  ├─ verify.mjs               # structural checks on dist/ (npm run verify)
│  └─ rendered-checks.mjs      # rendered-browser sweep & interactions (check|interact|nojs|shots|all)
│
├─ .github/workflows/
│  └─ deploy.yml               # structural + browser jobs; deploy gated to main
│
└─ verification/
   ├─ screenshots/             # browser evidence PNGs (build served from dist/) — after
   │  ├─ home-desktop-header-hero-1440x900.png
   │  ├─ home-desktop-full-1440.png
   │  ├─ home-packaging-rows-1440x900.png   # replaces home-lower-editorial (renamed)
   │  ├─ home-report-exhibit-1440x900.png
   │  ├─ home-report-caption-320x700.png
   │  ├─ home-report-caption-390x844.png
   │  ├─ home-mobile-390x844.png
   │  ├─ mobile-menu-expanded-390x844.png
   │  ├─ services-desktop-1440x900.png
   │  ├─ how-it-works-desktop-1440x900.png
   │  ├─ contact-desktop-1440x900.png
   │  ├─ contact-mobile-390x844.png
   │  ├─ contact-email-panel-after-1440x900.png
   │  └─ contact-questions-panel-after-1440x900.png
   ├─ baseline/                # redesign before-renders (build at ae0f6cf, captured pre-edit)
   │  ├─ home-desktop-header-hero-1440x900.png
   │  ├─ home-desktop-full-1440.png
   │  ├─ home-lower-editorial-1440x900.png
   │  ├─ home-mobile-390x844.png
   │  └─ home-report-before-1440x900.png
   └─ baseline-cleanup/        # cleanup before-renders (build at 5116058, pre-edit)
      ├─ home-report-caption-before-320x700.png
      ├─ home-report-caption-before-390x844.png
      ├─ home-report-caption-before-1440x900.png
      ├─ contact-email-panel-before-1440x900.png
      ├─ contact-questions-panel-before-1440x900.png
      ├─ home-desktop-full-before.png
      └─ home-mobile-full-before.png
```

## Rendered output (dist/)

`astro build` emits static HTML per route plus:
`/_astro/*.webp` (optimised photos), `/_astro/*.woff2` (self-hosted fonts),
`sitemap-index.xml` + `sitemap-0.xml`, `404.html`. No server-side code, no env secrets.
