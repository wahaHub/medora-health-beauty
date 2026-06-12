# Medora Beauty SEO/GEO Master Spec

> Domain: `medorabeauty.com`  
> Project: `medora-health-beauty`  
> Status: Active execution spec  
> Created: 2026-06-11

## Executive Decision

Medora Beauty should treat SEO and GEO as a public-content architecture project, not as a meta-tag patch.

The site already has valuable assets: procedure data, multilingual procedure content, recovery timelines, risks, benefits, surgeon profiles, hospitals, reviews, case media, and video testimonials. The core problem is that much of this value appears only after client-side JavaScript runs. Search engines and AI crawlers receive a thin SPA shell instead of page-specific, structured, crawlable HTML.

The rebuild has two layers:

1. Immediate, low-risk crawl foundation work.
2. Crawlable, answer-ready public pages that expose Medora's content in initial HTML.

The first layer helps discovery. The second layer determines the ceiling.

## Non-Negotiable Principles

- Keep procedure guide pages. Do not replace `ProcedureDetail.tsx` with video cases.
- Treat Cases as the conversion path and Procedure Guides as the SEO/GEO education path.
- Treat Medora Beauty as a global-first platform. Default procedure-guide metadata should not be China-focused; China, Korea, Thailand, Turkey, and other destinations should appear as destination-specific modifiers and landing pages.
- Use real `<a href>` links for public internal links. Avoid button-only navigation for crawl-critical links.
- Generate real `robots.txt`, `sitemap.xml`, and `llms.txt` files.
- Preserve old procedure URLs until redirects and canonical rules are proven.
- Do not claim SEO is complete because `react-helmet-async` or client-side metadata exists.
- JSON-LD, canonical URLs, page titles, descriptions, and body content must be present in initial HTML for target public pages.
- Do not add full hreflang until language-specific URLs exist.

## Current Public Architecture

The current app is a Vite React SPA with React Router routes such as:

- `/`
- `/surgeons`
- `/gallery`
- `/travel`
- `/reviews`
- `/video-cases`
- `/procedures/:category`
- `/procedure/videos`
- `/procedure/:procedureName`
- `/procedure/:procedureName/gallery`
- `/procedure/:procedureName/videos`
- `/procedure/:procedureName/case/:caseId`
- `/surgeon/:surgeonName`
- `/hospital/:hospitalSlug`

These routes are user-visible and valuable, but they currently depend on client-side rendering for most page-specific content.

## Target Information Architecture

Top navigation:

- Doctors
- Cases
- Gallery
- Travel
- Resources
- Contact

During the current Vite transition, Cases navigation and sitemap video-case URLs should use implemented, prerendered path routes:

- `/procedure/Rhinoplasty/videos`
- `/procedure/Liposuction/videos`
- `/procedure/Hair%20Transplant/videos`

The future target Cases URLs are:

- `/procedures/face/rhinoplasty/video-cases`
- `/procedures/body/liposuction/video-cases`
- `/procedures/hair/hair-transplant/video-cases`

During the current Vite transition, Resources, footer, sitemap, and editorial guide links may use implemented guide routes:

- `/procedure/Rhinoplasty`
- `/procedure/Liposuction`
- `/procedure/Hair%20Transplant`

The future target guide URLs are:

- `/procedures/face/rhinoplasty`
- `/procedures/body/liposuction`
- `/procedures/hair/hair-transplant`

Legacy routes remain valid during migration:

- `/procedure/Rhinoplasty`
- `/procedure/rhinoplasty`
- `/procedure/rhinoplasty/videos`
- `/procedure/videos?procedure=Rhinoplasty&area=face`

The query-filter video route is compatibility-only. Do not promote it in sitemap or crawl-critical Header/Footer links. Use `/procedure/:procedureName/videos` as the current SEO/internal-link route until the future `/procedures/:category/:slug/video-cases` routes exist.

## Phase Overview

## Current Implementation Status

| Phase | Status | Notes |
| --- | --- | --- |
| P0 crawl foundation | Done | `robots.txt`, `llms.txt`, generated sitemap, real Header/Footer procedure links, and current URL preservation are implemented. |
| P1 URL cleanup | Done for current Vite routes | Current SEO/internal-link route is `/procedure/:procedureName/videos`; query-filter video URLs remain compatibility-only. Future slugged routes are not implemented yet. |
| P1 prerender pipeline | Done for first wave | Build generates initial HTML for priority static pages, procedure guides, procedure video pages, surgeon pages, and hospital pages. |
| P1 metadata/schema | Partially done | Page-specific metadata and JSON-LD are implemented for priority routes. Video pages now use R2 v4 manifest data when available and fallback manifest data otherwise. |
| P1 video case data quality | Partially done | Initial HTML includes privacy-safe video case summaries and `VideoObject` schema. Per-video thumbnails, transcripts, richer outcome summaries, and duration from source metadata are still not done. |
| P2 answer-ready procedure content | Partially done | Priority prerendered procedure guides now include short-answer summaries, overview, candidacy, conservative avoidance guidance, techniques, recovery timeline/tips, risks, cost factors, FAQs, and a medical disclaimer in initial HTML. Medical reviewer fields, last-updated fields, related surgeons/destinations, case galleries, destination hubs, and guide hubs are still not done. |
| P3 multilingual/authority | Not started | URL-level language routing, hreflang, editorial policy, medical review policy, and authority workflows still need implementation. |

### P0: Crawl Foundation

Fix discovery and crawl basics:

- `public/robots.txt`
- `public/llms.txt`
- sitemap generation
- Vercel rewrite validation
- real Header/Footer links
- canonical slug utilities
- old URL preservation

Detailed spec: `SEO_GEO_P0_CRAWL_FOUNDATION.md`

### P1: Prerender, Metadata, Schema

Make the first wave of public pages return meaningful HTML:

- prerender or SSG for public routes
- page-specific metadata
- canonical URLs
- Open Graph and Twitter cards
- JSON-LD in initial HTML
- route-level SEO data loaders

Detailed spec: `SEO_GEO_P1_PRERENDER_METADATA_SCHEMA.md`

### P2: Answer-Ready Content Architecture

Make content extractable and citable by search engines and AI systems:

- short answer summaries
- FAQs
- medical reviewer and last updated fields
- cost factors
- avoidance criteria
- case/video text summaries
- destination and guide hubs

Current implementation note: priority procedure guide pages now expose the first wave of answer-ready content in initial HTML using existing procedure content and conservative planning guidance. Destination pages, standalone guide hubs, reviewer fields, last-updated fields, and richer case/gallery text remain future work.

Detailed spec: `SEO_GEO_P2_CONTENT_ARCHITECTURE.md`

### P3: Multilingual and Authority

Expand language and trust systems:

- language-specific URLs
- hreflang
- editorial policy
- medical review policy
- patient safety policy
- before-and-after consent policy
- Search Console and external authority loops

Detailed spec: `SEO_GEO_P3_MULTILINGUAL_AUTHORITY.md`

## Success Definition

The SEO/GEO rebuild is successful when:

- Crawl files return correct content types and are not rewritten to the SPA shell.
- Public internal links are visible as real anchors in HTML.
- Priority procedure, surgeon, hospital, case, and video pages are included in sitemap.
- Priority public pages return page-specific title, description, canonical, H1, body content, and JSON-LD in initial HTML.
- Procedure guides answer common questions clearly enough for AI systems to cite.
- Case/video pages include text summaries, privacy notes, descriptive media text, and structured data.
- Multilingual SEO is only launched after URL-level language separation exists.
