# Medora SEO/GEO Documentation Design

> Created: 2026-06-11  
> Project: `medora-health-beauty`  
> Outcome: Documentation-only design for the SEO/GEO execution system.

## Context

Medora Beauty has strong procedure, doctor, hospital, case, video, and multilingual content assets. The key search problem is not lack of content; it is that much of the content is hidden behind client-side rendering and inconsistent crawl architecture.

The archived `docs/seo/archive/SEO_STRATEGY_2026-01-26.md` contains useful keyword direction, but its technical execution guidance is outdated. The newer audit and GPT 5.5 Pro review agree that the project needs crawl files, real links, canonical URL rules, prerendered public pages, page-specific metadata, JSON-LD, answer-ready content, and eventually multilingual URL architecture.

## Approved Design

Create a complete SEO/GEO documentation system under `docs/seo/`:

- `README.md`
- `SEO_GEO_MASTER_SPEC.md`
- `SEO_GEO_P0_CRAWL_FOUNDATION.md`
- `SEO_GEO_P1_PRERENDER_METADATA_SCHEMA.md`
- `SEO_GEO_P2_CONTENT_ARCHITECTURE.md`
- `SEO_GEO_P3_MULTILINGUAL_AUTHORITY.md`
- `SEO_GEO_URL_CANONICALS.md`
- `SEO_GEO_SCHEMA_LIBRARY.md`
- `SEO_GEO_MONITORING.md`
- `MEDORA_SEO_GEO_AUDIT.md`
- `archive/SEO_STRATEGY_2026-01-26.md`

The master spec becomes the active source of truth. The audit remains evidence. The old strategy is archived and deprecated.

## Key Rules

- Preserve old procedure pages and use them as guide/SEO/GEO pages.
- Use Cases navigation for case-first conversion pages.
- Use Footer/Resources navigation for guide pages.
- Do not rely on `react-helmet-async` alone.
- Do not add full hreflang until language URLs exist.
- Do not use `href="#"` or button-only navigation for crawl-critical links.
- Include metadata and JSON-LD in initial HTML for priority public pages.

## Phase Model

P0 fixes crawl discovery and internal link basics.

P1 makes public pages prerendered or otherwise available in initial HTML with metadata and schema.

P2 turns procedure, case, video, destination, and guide content into answer-ready pages.

P3 adds multilingual URL architecture, hreflang, authority pages, and ongoing monitoring.

## Approval

The user approved the complete documentation system approach, with the understanding that this turn writes and commits docs only. Implementation planning follows after user review.
