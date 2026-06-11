# SEO/GEO URL and Canonical Rules

> Goal: Define stable URL rules for users, search engines, sitemap generation, redirects, and internal links.

## Canonical URL Families

### Procedure Guides

Target:

```txt
/procedures/:category/:procedureSlug
```

Examples:

```txt
/procedures/face/rhinoplasty
/procedures/body/liposuction
/procedures/hair/hair-transplant
```

Use this path for:

- Footer procedure links
- Resources procedure library
- guide hubs
- sitemap guide URLs
- canonical tags for guide content

### Procedure Video Cases

Target:

```txt
/procedures/:category/:procedureSlug/video-cases
```

Examples:

```txt
/procedures/face/rhinoplasty/video-cases
/procedures/body/liposuction/video-cases
/procedures/hair/hair-transplant/video-cases
```

Use this path for:

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

Legacy URLs:

- `/procedure/Rhinoplasty`
- `/procedure/rhinoplasty`
- `/procedure/:procedureName/gallery`
- `/procedure/:procedureName/videos`
- `/procedure/videos?procedure=Rhinoplasty&area=face`

Migration rule:

1. Keep old URLs working.
2. Add canonical tags pointing to the new URL.
3. After verification, consider 301 redirects for simple one-to-one mappings.
4. Do not redirect query-filtered pages until clean replacements exist and analytics risk is understood.

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
