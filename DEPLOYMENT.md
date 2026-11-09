# DEPLOYMENT — Obsidixz Commercial

**Intended production domain:** https://commercial.obsidixz.pp.ua/
**Build output:** `dist/` (static HTML/CSS/JS + assets). **No secrets, no environment
variables and no server code are required to serve the site.**

> Status: **not deployed.** No pp.ua DNS or hosting credentials were available during the
> build. Do not claim the domain is live until the checks in this file are done.

## 1. Build locally (reproducible)

```bash
git clone https://github.com/Richard-Olasehinde/obsidixz-commercial.git
cd obsidixz-commercial
git checkout arena/5a9708cf-obsidixz-commercial   # or merge to main first
npm ci
npm run build        # → dist/
npm run preview      # serves dist/ on 0.0.0.0:4321
```

Node ≥22.12 (repo pins `astro@7.3.8`; 7.4.x needs Node ≥22.23.4).

## 2. Hosting options

Any static host works. Recommended: **Cloudflare Pages** (the sibling Obsidixz
`obsidixz-forms` project already runs on Pages, and `*.pp.ua` subdomains commonly CNAME
to Pages; choosing it keeps one operational model). Alternatives: Netlify, Vercel static,
GitHub Pages (then confirm custom-domain support for the pp.ua subdomain), or any object
storage + CDN.

### Cloudflare Pages (recommended)

1. Dashboard → Workers & Pages → Create → Pages → **Connect to Git** (or Direct upload).
2. Build command: `npm run build` · Output directory: `dist` · Node version: `22`.
3. After first deploy, add custom domain `commercial.obsidixz.pp.ua` under the Pages project.
   Cloudflare will display a target hostname (e.g. `<project>.pages.dev`).
4. DNS for the `pp.ua` domain (pp.ua apex/subdomain editor): CNAME
   `commercial` → the `*.pages.dev` hostname Pages provides (for apex-ish setups use the
   ALIAS/CNAME flattening pp.ua offers for subdomains). PP.UA panel: login at
   https://pp.ua → your domain → DNS records. Deactivate conflicting A/AAAA/CNAME records
   on the `commercial` name first.
5. Wait for propagation (usually minutes; pp.ua + Cloudflare proxy can take longer).
6. Verify: HTTPS on `https://commercial.obsidixz.pp.ua/`, all eight routes return 200,
   `/sitemap-index.xml` and `/robots.txt` return 200, canonical URLs match
   `https://commercial.obsidixz.pp.ua/...` (they already do — `site` is fixed in
   `astro.config.mjs`).

### Staging ≠ production (avoid accidental indexing)

- The committed `robots.txt` **allows** crawling and references the production sitemap —
  correct **only** for the real domain.
- Any staging/preview deployment should instead block indexing. Options: serve a staging
  `robots.txt` (`User-agent: *\nDisallow: /`), or set `X-Robots-Tag: noindex` header on the
  staging host, or put basic auth in front. Do not point staging robots at the production
  sitemap.
- `*.pages.dev` previews inherit the same `dist/`; add a Pages `_headers` file or use a
  separate build if previews must remain unindexed. (Current build sets no headers file.)

## 3. Preview host allowlist (local only)

`scripts/` dev/preview on this machine honour an env var:

```bash
PREVIEW_ALLOWED_HOSTS="preview.example.com,localhost" npm run preview
```

Comma-separated hosts only; never contains secrets. Not needed for production hosting.

## 4. Post-deploy checklist

- [ ] `curl -I https://commercial.obsidixz.pp.ua/` → 200, correct cert
- [ ] All routes: `/ /services /how-it-works /industries /about /contact /privacy /terms` → 200
- [ ] `/sitemap-index.xml` → 200; submit to Google Search Console / Bing Webmaster
- [ ] Open Graph card renders (Share to a link preview tool)
- [ ] Header logo and dark footer logo render (correct variant each)
- [ ] `CONTACT`: click **Email your enquiry** from a clean browser — confirm the mail
      client opens with subject **Obsidixz Commercial — Website enquiry**
- [ ] **Send a real test message** to `obsidixz.commercial@outlook.com`; confirm receipt;
      reply to the sender mailbox; record both in `PROJECT_STATUS.md`
- [ ] Confirm no analytics/cookies (none are configured) if a compliance review is done

## 5. External prerequisites (not in this workspace)

- pp.ua account access for DNS (or the DNS host currently managing `obsidixz.pp.ua`)
- A hosting account (Cloudflare Pages recommended) authorised for `commercial.obsidixz.pp.ua`
- Access to the `obsidixz.commercial@outlook.com` mailbox for the send/receipt test
- No paid services are required by the site itself (free tiers suffice); nothing was purchased or provisioned during the build
