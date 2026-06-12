# SEO/GEO URL and Canonical Rules

> Goal: Define stable URL rules for users, search engines, sitemap generation, redirects, and internal links.

## Current Implemented URL Families

These are the SEO-safe URLs for the current Vite SPA/prerender phase. They have real route handlers and can be generated into static HTML today.

### Current Procedure Guides

```txt
/procedure/:procedureName
```

Examples:

```txt
/procedure/Rhinoplasty
/procedure/Liposuction
/procedure/Hair%20Transplant
```

Use this path for current guide canonical tags, sitemap guide URLs, Footer procedure links, Resources guide links, and related guide links until the future slugged routes exist.

### Current Procedure Video Cases

```txt
/procedure/:procedureName/videos
```

Examples:

```txt
/procedure/Rhinoplasty/videos
/procedure/Liposuction/videos
/procedure/Hair%20Transplant/videos
```

Use this path for the current Header Cases menu, sitemap video-case URLs, procedure-guide "Video Cases" links, and page-specific prerendered video-case metadata.

### Current Generic Video Cases

```txt
/procedure/videos
```

This is the generic all-video-cases route. Query-filter URLs such as `/procedure/videos?procedure=Rhinoplasty&area=face` may remain available for compatibility and interactive filtering, but they should not be promoted in sitemap or crawl-critical internal links.

## Future Target URL Families

### Procedure Guides

Future target:

```txt
/procedures/:category/:procedureSlug
```

Examples:

```txt
/procedures/face/rhinoplasty
/procedures/body/liposuction
/procedures/hair/hair-transplant
```

After real routes, prerender output, redirects, and canonical behavior are implemented, use this path for:

- Footer procedure links
- Resources procedure library
- guide hubs
- sitemap guide URLs
- canonical tags for guide content

### Procedure Video Cases

Future target:

```txt
/procedures/:category/:procedureSlug/video-cases
```

Examples:

```txt
/procedures/face/rhinoplasty/video-cases
/procedures/body/liposuction/video-cases
/procedures/hair/hair-transplant/video-cases
```

After real routes, prerender output, redirects, and canonical behavior are implemented, use this path for:

- top navigation Cases menu
- homepage search when a user is looking for cases
- case-first conversion pages
- sitemap video case URLs

### Procedure Gallery

Target:

```txt
/procedures/:category/:procedureSlug/before-after
```

Legacy gallery URLs should continue to work during migration:

```txt
/procedure/:procedureName/gallery
```

### Case Detail

Target:

```txt
/procedures/:category/:procedureSlug/cases/:caseId
```

Legacy case URLs should continue to work during migration:

```txt
/procedure/:procedureName/case/:caseId
```

## Legacy URL Handling

Legacy and compatibility URLs:

- `/procedure/Rhinoplasty`
- `/procedure/rhinoplasty`
- `/procedure/:procedureName/gallery`
- `/procedure/:procedureName/videos`
- `/procedure/videos?procedure=Rhinoplasty&area=face`

Migration rule:

1. Keep old URLs working.
2. During P1, use current implemented canonical URLs such as `/procedure/Rhinoplasty` and `/procedure/Rhinoplasty/videos`.
3. Add future canonical tags pointing to slugged URLs only after those real routes and static/prerendered outputs exist.
4. After verification, consider 301 redirects for simple one-to-one mappings.
5. Do not redirect query-filtered pages until clean replacements exist and analytics risk is understood.
6. Do not put query-filter URLs in sitemap once path video-case URLs exist.

## Slug Rules

Procedure slugs should:

- be lowercase
- remove trademark symbols
- replace `&` with `and`
- convert slash-separated labels to words
- collapse whitespace
- use hyphens
- preserve stable mappings for renamed labels

Examples:

| Label | Slug |
| --- | --- |
| Rhinoplasty | `rhinoplasty` |
| BOTOX® & Neurotoxins | `botox-and-neurotoxins` |
| Brazilian Butt Lift (BBL) | `brazilian-butt-lift-bbl` |
| Temples Lift / Temporofrontal Lift | `temples-lift-temporofrontal-lift` |

## Link Ownership

One shared URL helper module should power:

- Header
- Footer
- homepage search
- sitemap generation
- canonical tags
- redirects, if implemented

Avoid separate ad hoc URL builders.

## Metadata Positioning

Medora Beauty is global-first, not China-focused. Generic procedure guide metadata should use procedure-first language such as `Rhinoplasty Procedure Guide | Medora Beauty`. Destination modifiers belong on destination landing pages and guide variants, for example:

- `Rhinoplasty in Korea`
- `Hair Transplant in Turkey`
- `Plastic Surgery in Thailand`
- `Cosmetic Surgery in China`
