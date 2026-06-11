# P0 Crawl Foundation Spec

> Goal: Make Medora Beauty discoverable and navigable to search engines and AI crawlers before deeper rendering work begins.

## Scope

P0 covers low-risk, high-impact crawl foundations:

- real crawl files
- generated sitemap
- Vercel rewrite behavior
- crawlable internal links
- canonical slug utilities
- legacy URL preservation

P0 does not solve the SPA rendering ceiling. That belongs to P1.

## Required Files

Create or generate:

- `public/robots.txt`
- `public/llms.txt`
- `scripts/generate-sitemap.mjs`
- `public/sitemap.xml`, generated during build or before deploy

Minimum `robots.txt`:

```txt
User-agent: *
Allow: /

Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /login
Disallow: /packages

Sitemap: https://medorabeauty.com/sitemap.xml
```

Minimum `llms.txt` sections:

- what Medora Beauty is
- core public URLs
- procedure guides
- cases and gallery
- doctors and hospitals
- editorial standards
- medical disclaimer
- contact information

## Sitemap Sources

Generate from these sources, in order:

1. Supabase public data when environment variables are available.
2. `src/data/procedureTaxonomy.ts` as the stable fallback.
3. Static route definitions for marketing pages.

Sitemap generation must only publish URLs that have real route handlers and either current SPA support or prerendered/static output. Canonical deep procedure URLs such as `/procedures/:category/:procedureSlug` should be added only after the corresponding routes and prerender output exist. Until then, P0 may list current static/category routes and, if needed, legacy `/procedure/:procedureName` URLs that already resolve.

Sitemap should include:

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
- procedure guide pages
- procedure gallery pages
- procedure video case pages
- surgeon pages
- hospital pages
- case pages when public IDs are available
- destination and guide pages as they launch

## Header and Footer Links

Crawl-critical navigation must use real anchors:

```tsx
<a href="/procedures/face/rhinoplasty">Rhinoplasty</a>
```

Avoid these for SEO-critical links:

```tsx
<button onClick={...}>Rhinoplasty</button>
<a href="#">Rhinoplasty</a>
```

Cases menu links should point to case-first pages. Footer and Resources links should point to guide pages.

## Canonical Slug Utilities

Add shared helpers for:

- normalizing procedure labels
- mapping labels to area/category
- creating guide URLs
- creating case/video URLs
- mapping legacy `/procedure/:procedureName` URLs to canonical destinations

These helpers should become the source of truth for Header, Footer, sitemap, and canonical tags.

## Vercel Rewrite Requirements

Verify these paths return actual static files:

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`

They must not be caught by the SPA fallback rewrite.

## Validation

```bash
curl -sI https://medorabeauty.com/robots.txt | grep -E "HTTP/|content-type"
curl -sI https://medorabeauty.com/sitemap.xml | grep -E "HTTP/|content-type"
curl -sI https://medorabeauty.com/llms.txt | grep -E "HTTP/|content-type"
curl -sL https://medorabeauty.com/sitemap.xml | grep -i "<urlset"
curl -sL https://medorabeauty.com/robots.txt | grep -i "sitemap"
curl -sL https://medorabeauty.com/llms.txt | grep -i "Medora Beauty"
```

Expected:

- each crawl file returns `200`
- `robots.txt`: `text/plain`
- `llms.txt`: `text/plain`
- `sitemap.xml`: `application/xml` or `text/xml`
- sitemap includes priority public routes
- Header/Footer links expose real URLs
