# P1 Prerender, Metadata, and Schema Spec

> Goal: Make priority public pages return meaningful, page-specific HTML before client-side JavaScript runs.

## Core Decision

Short term: keep the Vite app and add a prerender/SSG pipeline for priority public routes.

Long term: consider splitting public marketing/content pages into Astro, Next.js, or Remix while keeping dashboard, admin, chat, and patient flows in the current app.

The short-term Vite prerender path is preferred first because it has lower migration risk.

## Why Client-Side Metadata Is Not Enough

React head libraries can update metadata after JavaScript runs, but they do not solve the initial HTML problem on their own. Search engines can sometimes render JavaScript; many AI crawlers are less reliable. Priority SEO/GEO pages must expose content, metadata, and schema in returned HTML.

## Initial Prerender Route Set

Start with:

- `/`
- `/surgeons`
- `/gallery`
- `/travel`
- `/reviews`
- `/video-cases`
- `/procedures/face`
- `/procedures/body`
- `/procedures/nonsurgical`
- `/procedures/hair`
- `/procedures/dental`
- first 20 priority procedure guide pages, selected from the seed list below
- first 20 priority procedure video case pages, selected from the seed list below
- public surgeon pages
- public hospital pages

The implementation plan must choose exactly 20 initial procedure guide/video-case routes. Start from this priority seed list unless analytics or Search Console data shows a better order:

- rhinoplasty
- facelift
- eyelid surgery
- neck lift
- brow lift
- revision rhinoplasty
- nose tip refinement
- mini facelift
- cheek augmentation
- chin augmentation
- liposuction
- tummy tuck
- breast augmentation
- breast lift
- BBL
- mommy makeover
- arm lift
- thigh lift
- botox
- dermal fillers
- hair transplant
- veneers

P1 uses the current implemented route family:

- procedure guides: `/procedure/:procedureName`
- procedure video cases: `/procedure/:procedureName/videos`
- generic video cases: `/procedure/videos`

Do not use query-filter URLs such as `/procedure/videos?procedure=Rhinoplasty&area=face` as sitemap URLs, Header Cases links, or page-specific static canonical pages. They remain compatibility/filter URLs only.

Do not emit future slugged deep URLs such as `/procedures/face/rhinoplasty` or `/procedures/face/rhinoplasty/video-cases` until real routes, prerender output, sitemap support, and canonical/redirect behavior exist.

## Metadata Requirements

Every prerendered public page needs:

- title
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image where available
- Twitter card metadata
- JSON-LD

Do not add hreflang until P3 language URLs exist.

Default metadata should be global-first. Generic procedure guide titles should not default to `in China`; destination modifiers such as China, Korea, Thailand, and Turkey belong on dedicated destination landing pages or destination-specific guide variants.

## Data Flow

Create a public SEO data layer that can run in build-time scripts:

- procedure taxonomy from source files
- procedure content from static JSON or Supabase when available
- surgeon and hospital records from Supabase or generated data
- case/video metadata from public JSON, Supabase, or R2 indexes

The build should fail loudly only for broken code. Missing optional SEO data should produce warnings and fallback metadata so deployment is not blocked.

Current status:

| Item | Status | Notes |
| --- | --- | --- |
| Build-time public SEO data layer | Done | `loadPublicSeoData` combines procedure taxonomy/content, generated surgeon data, Supabase public data when configured, and video case data. |
| R2 v4 video manifest ingestion | Done | Build-time video SEO data tries `SEO_VIDEO_CASE_MANIFEST_URL`, `VIDEO_CASE_MANIFEST_URL`, `VITE_R2_CUSTOM_DOMAIN`, `VITE_R2_PUBLIC_URL`, `R2_PUBLIC_URL`, then the default Medora video domain. |
| Checked-in video manifest fallback | Done | If the remote R2 manifest is unavailable, build falls back to `public/video-cases.json` and emits a warning rather than failing deployment. |
| Procedure-specific video case summaries | Done | Priority procedure video pages include privacy-safe case summaries in initial HTML. |
| `VideoObject` schema for video pages | Done for manifest-level data | Procedure video pages and generic video case collection pages emit `VideoObject` JSON-LD from manifest data. |
| Manifest-derived case context | Partial | Video case records include stable case ids, project/provider names when available, video URLs, neutral manifest/media context, media alt text, and privacy notes. Richer source set/source kind/classification confidence appears only when a manifest provides it. True patient concern, treatment approach, and outcome details are not inferred. |
| Per-video thumbnails | Not done | The v4 manifest does not currently provide thumbnail URLs; schema uses the brand case-collage fallback image. |
| Transcripts | Not done | Manifest data does not yet include real transcripts. Summaries are not labeled as transcripts. |
| Source duration metadata | Partial | SEO uses source duration only when the manifest provides it. It no longer fabricates duration from the case id. |

## JSON-LD Requirements

JSON-LD must be included in initial HTML for prerendered routes.

Schema requirements are defined in `SEO_GEO_SCHEMA_LIBRARY.md`.

## Validation

```bash
curl -sL https://medorabeauty.com/procedure/Rhinoplasty | grep -i "rhinoplasty"
curl -sL https://medorabeauty.com/procedure/Rhinoplasty | grep -i "canonical"
curl -sL https://medorabeauty.com/procedure/Rhinoplasty | grep -i "application/ld+json"
curl -sL https://medorabeauty.com/procedure/Rhinoplasty/videos | grep -i "Video Cases"
curl -sL https://medorabeauty.com/surgeon/example | grep -i "Physician"
```

Expected:

- returned HTML contains page-specific H1/body content
- returned HTML contains page-specific title and description
- returned HTML contains canonical and JSON-LD
- old URLs still work and point to canonical destinations
