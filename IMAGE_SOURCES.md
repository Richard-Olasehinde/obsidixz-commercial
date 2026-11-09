# IMAGE SOURCES — Obsidixz Commercial

All dates 2026-11-09. Nothing fetched from general search results is used in the site.

> **Scope note on rights.** The two photographs are **AI-generated** (Arena's image
> generation tool, this session). They are recorded here with their actual provenance and
> the usage terms that apply to them: generated output is provided under the generating
> service's terms, which grant the requesting user broad rights to use the output. We
> make **no universal guarantee** that AI-generated imagery is free of every third-party
> right or claim in every jurisdiction — no such guarantee is possible for generated
> content, and we do not print one on the site or here. Nothing in the prompts or
> outputs depicts identifiable real brands, logos or persons; outputs were reviewed as
> photo-realistic and suitable for their roles; captions in the site describe both as
> illustrative. The business accepted this approach explicitly.

## Photography (both required images)

| Asset | Path in repo | Origin | Licence / terms | Modifications |
|---|---|---|---|---|
| Packaging still-life (hero) | `src/assets/images/hero-packaging-desk.jpg` | **AI-generated** with Arena's image-generation tool, this session (2026-11-09) | Generated output under the generating service's terms; requested by and generated for this project; no third-party stock licence applies, and no universal rights guarantee is made (see scope note above) | Build-time responsive WebP variants via `astro:assets` (22/46/77 kB); used also to derive `public/images/og-cover.jpg` (1200×630 center crop) |
| Notebook & packaging samples (editorial) | `src/assets/images/research-notebook-desk.jpg` | **AI-generated** with Arena's image-generation tool, this session (2026-11-09) | Same as above | Build-time WebP variants (89/135 kB) |

Generation prompts specified: editorial still-life photography; arranged packaging
subjects (corrugated board, paperboard, glass containers, material swatches, notebook
with non-legible sketches); dark/warm workbench lighting; muted natural palette;
**no text, no real brands, no logos, no people**. Output reviewed and accepted as
photo-realistic and suitable for the two required roles.

**Captions in the site state "Illustrative photograph — not our office / not client work"**
so the imagery is never misread as documentation of Obsidixz facilities, staff or projects.

Alt text describes visible subject matter only (decorative counting of objects avoided).

## Brand artwork (authentic, supplied)

| Asset | Path | Source | Licence | Modifications |
|---|---|---|---|---|
| Parent logo for light backgrounds | `public/brand/obsidixz-parent-logo-on-light.png` (931×785) | **Supplied by the business** as chat attachments (2026-11-09) — authentic Obsidixz Concept 02 artwork | Owner's artwork; used with the owner's instruction | None. Dimensions and ratio preserved; displayed at 80/96/112 px widths |
| Parent logo for dark backgrounds | `public/brand/obsidixz-parent-logo-on-dark.png` (931×785) | Same | Same | None |
| Standalone emblem | `public/brand/obsidixz-parent-symbol-transparent.png` (2000×1500) | Same | Same | Used unmodified; **derivative favicon files only** listed below |

The wireframe public URLs named in the brief (`https://realestate.obsidixz.pp.ua/brand/…`)
were **not** used — the supplied files were the canonical source and take precedence.

### Derived favicon files (resizing/padding only — no redraw, crop or recolour)

| File | Derivation |
|---|---|
| `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | Emblem trimmed of transparent margin, square-padded transparent canvas, nearest-neighbour/standard resize |
| `apple-touch-icon.png` (180), `android-chrome-192x192.png`, `android-chrome-512x512.png` | Same, composited on white background for OS chrome |
| `public/images/og-cover.jpg` | Centre-crop of the generated hero photograph, resized to 1200×630, quality 85 |

## Fonts

| Family | Files | Source | Licence |
|---|---|---|---|
| Montserrat 600/700 | `@fontsource/montserrat` (npm) | Fontsource · original by Julieta Ulanovsky | SIL Open Font License 1.1 |
| Open Sans 400/600 | `@fontsource/open-sans` (npm) | Fontsource · original by Steve Matteson | SIL Open Font License 1.1 |

Self-hosted at build time (hashed `/_astro/*.woff2`); no external font CDN.

## Icons & graphics

Inline SVG line icons only (arrow, close cross), drawn in-repo, no third-party icon set.
Rotated-square motif (gold) is CSS, echoing the Interlock emblem geometry.

## Not used

- No stock photography of any kind; no hotlinked third-party images
- No imagery from `realestate.obsidixz.pp.ua` (reference for tone only)
- No images from the earlier `image-search/` scratch folder — deleted before commit
- No fabricated dashboards, report mock-ups or supplier data visuals
