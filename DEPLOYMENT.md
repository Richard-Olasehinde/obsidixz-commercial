# DEPLOYMENT — Obsidixz Commercial

**Intended production domain:** https://commercial.obsidixz.pp.ua/
**Build output:** `dist/` (static HTML/CSS/JS + assets). **No secrets, no environment
variables and no server code are required to serve the site.**

> Status: **not deployed.** No pp.ua DNS or hosting credentials were available during the
> build. Do not claim the domain is live until the checks in this file are done.

## 0. GitHub Pages path (primary, chosen 2026-11-09)

The build ships `.github/workflows/deploy.yml` (check → build → verify → deploy to Pages).
Before the first green deploy, three one-time settings are required — all need an
administrator of the repository (the sandbox integration token gets HTTP 403 for these):

1. **Make the repository public** (free-plan Pages requirement)
   - UI: repo → **Settings** → **General** → scroll to **Danger Zone** →
     **Change repository visibility** → **Make public** → type
     `Richard-Olasehinde/obsidixz-commercial` to confirm.
   - CLI (your own authenticated token, not the integration):
     `gh repo edit Richard-Olasehinde/obsidixz-commercial --visibility public`
   - Public means the code, docs and commit history are world-readable; no secrets are
     present in the tree (verified by scan) and `.gitignore` excludes env files.

2. **Enable Pages from GitHub Actions**
   - UI: repo → **Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions**
     (leave the suggested workflow; the committed one is used).
   - CLI equivalent: `gh api -X POST repos/Richard-Olasehinde/obsidixz-commercial/pages -f build_type=workflow`
   - Then trigger a run: repo → **Actions** → “Deploy to GitHub Pages” → **Run workflow**
     (or push any commit).

3. **Point Pages at the custom domain**
   - UI: repo → **Settings** → **Pages** → **Custom domain** → enter
     `commercial.obsidixz.pp.ua` → **Save**.
   - CLI equivalent: `gh api -X PUT repos/Richard-Olasehinde/obsidixz-commercial/pages -f cname=commercial.obsidixz.pp.ua`
   - DNS check may warn until the CNAME below exists; afterwards tick **Enforce HTTPS**
     (cert provisioning can take minutes to ~24h):
     `gh api -X PUT repos/Richard-Olasehinde/obsidixz-commercial/pages -f https_enforced=true`

### pp.ua DNS records (exact)

At https://pp.ua → your domain **obsidixz.pp.ua** → DNS editor, create/replace exactly:

| Type | Host / Name | Value / Points to | TTL |
|---|---|---|---|
| CNAME | `commercial` | `richard-olasehinde.github.io` | 3600 (or Auto) |

- Some pp.ua panels want the FQDN in the Host field instead of the short name:
  `commercial.obsidixz.pp.ua` → target `richard-olasehinde.github.io`
- Delete any competing `A`/`AAAA`/`CNAME` on the `commercial` name first — one CNAME per
  host, and it must not coexist with address records.
- Do **not** touch apex (`obsidixz.pp.ua`) or the `realestate` name — the parent sites live there.
- No MX/TXT changes are needed for Pages itself.
- Verification (after save): `dig commercial.obsidixz.pp.ua CNAME +short` →
  `richard-olasehinde.github.io.`
- Then: `curl -sI https://commercial.obsidixz.pp.ua/` → `HTTP/2 200`.

### After the domain resolves

- Enforce HTTPS (above) and confirm the certificate is issued.
- All eight routes + `/sitemap-index.xml` + `/robots.txt` → 200.
- Submit the sitemap in Search Console / Bing Webmaster Tools (optional).
- Record the outcome (date, URL, verification) in `PROJECT_STATUS.md`.
- The 404 page is served by Pages automatically for unknown paths.

---

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
