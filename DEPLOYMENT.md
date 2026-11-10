# DEPLOYMENT — Obsidixz Commercial

**Intended production domain:** https://commercial.obsidixz.pp.ua/
**Build output:** `dist/` (static HTML/CSS/JS + assets). **No secrets, no environment
variables and no server code are required to serve the site.**

> Status (2026-11-10): **deployed to GitHub Pages from `main`; HTTPS independently
> confirmed working by the founder on 10 November 2026.** This session did not
> re-verify the live domain; the founder's confirmation is the record. A full live
> HTTPS verification pass (routes, assets, canonicals) is still outstanding — see
> PROJECT_STATUS.md. §0.1 is kept for the record of how HTTPS was activated.

## 0. GitHub Pages path (current decision — retained by the founder 2026-11-09)

The build ships `.github/workflows/deploy.yml`. **Deploys happen only from `main`** —
pushes to `main` and manual "Run workflow" selected on the `main` branch. Pushes and PRs
from any other branch run the `structural` and `browser` checks but never deploy.

Pages state as last checked via the Pages API (2026-11-09): source `build_type:
workflow`, branch `main`; custom domain `commercial.obsidixz.pp.ua` saved and verified;
certificate `state: "new"`, `https_enforced: false` — **this reading is superseded by
the founder's 2026-11-10 confirmation that HTTPS is independently confirmed working.**
The InvalidDNSError banner was a stale-cache artefact at the time (see §0.1 and
DECISION_LOG.md 31–32); DNS at the source was correct.

### 0.1 Finishing HTTPS (founder; completed 2026-11-10 per founder confirmation)

1. Wait until the stale answers expire (the sampled shard pointed at ~2026-11-09 15:30 UTC;
   worst case 4 h from whenever the bad entry was cached) — or simply try now; the check is
   idempotent.
2. Repo → **Settings** → **Pages** → **Check again** (domain row).
3. When the warning clears and the certificate shows issued (the banner reads "Resuming the
   process" — it resumes automatically; there is no separate "request" button to click),
   tick **Enforce HTTPS**.
4. Verify (from anywhere, not just this sandbox):
   - `curl -sI https://commercial.obsidixz.pp.ua/` → `HTTP/2 200`
   - All 8 routes + `/sitemap-index.xml` + `/robots.txt` → 200
   - Canonical/OG/sitemap URLs (they already point at `https://commercial.obsidixz.pp.ua/`)
5. Record the outcome here and in `PROJECT_STATUS.md`.
6. **If the check stays red after the cache window:** delete the `commercial` CNAME in
   nic.ua and re-create the identical record (`commercial` / CNAME /
   `richard-olasehinde.github.io.` / TTL 14400). This forces all uadns nodes to republish
   (bumps SOA serial) and costs nothing. Then Check again. If it *still* fails, open a
   nic.ua support ticket asking them to confirm all three nodes
   (`ns10/11/12.uadns.com`) serve SOA `2026110904` (or newer) — a backend may be pinned to
   a pre-fix zone version.
7. Do **not** "fix" anything else in the zone (apex/realestate/wordquest/MX/TXT all work).

## 0.2 Original activation (already completed — kept for the record)

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
   - Then trigger a run: repo → **Actions** → “CI & Deploy” → **Run workflow** (on `main`)
     (or push any commit to `main`). Feature branches never deploy.

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
git checkout main   # or the revision branch under review
npm ci
npm run build        # → dist/
npm run preview      # serves dist/ on 0.0.0.0:4321
```

Node ≥22.12 (repo pins `astro@7.3.8`; 7.4.x needs Node ≥22.23.4).

## 2. Hosting options

Any static host works. **Current decision (founder, 2026-11-09): GitHub Pages is the
host; do not migrate.** The Cloudflare Pages notes below are kept as a documented
alternative only — they were the earlier recommendation, superseded by the founder's
retention decision and are not an outstanding task. (Sibling `obsidixz-forms` project
also runs on Pages; if migration is ever wanted, the reasoning is here.)

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
- GitHub Pages enabled from `main` (done — retained decision) authored by the repository admin
- Access to the `obsidixz.commercial@outlook.com` mailbox for the send/receipt test
- No paid services are required by the site itself (GitHub Pages is free for public repos); nothing was purchased or provisioned during the build
