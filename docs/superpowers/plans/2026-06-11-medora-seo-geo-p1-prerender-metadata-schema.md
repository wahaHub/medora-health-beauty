# Medora SEO/GEO P1 Prerender Metadata Schema Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Medora's priority public pages return page-specific HTML, metadata, canonical tags, Open Graph/Twitter tags, and JSON-LD before client-side JavaScript runs.

**Architecture:** Keep the current Vite SPA and add a build-time public SEO generation pipeline. P1 uses implemented public URLs as canonical output: `/procedure/:procedureName` for procedure guides and `/procedure/:procedureName/videos` for procedure video pages. The existing `/procedure/videos?...` query route remains a compatibility/filter URL, but P1 must not claim query-specific static HTML is served unless a tested rewrite exists. The future `/procedures/:category/:procedureSlug` URL migration stays deferred to P2/P3 unless real routes are added in the same change. Build-time SEO payloads are authoritative; any React `SeoHead` is only a runtime mirror for client navigation.

**Tech Stack:** Vite, React, React Router, TypeScript, Vitest, Node ESM scripts, Supabase JS, static HTML post-build generation, Schema.org JSON-LD.

---

## Scope Boundary

This plan implements `docs/seo/SEO_GEO_P1_PRERENDER_METADATA_SCHEMA.md`.

In scope:

- build-time public SEO route selection
- exactly 20 initial priority procedure guide routes
- exactly 20 initial priority procedure video-case routes
- page-specific metadata model
- JSON-LD builders for required P1 page types
- Node-safe public SEO data loading with warnings and fallbacks
- Node-runnable post-build HTML generation/injection for priority public routes
- tests that inspect generated HTML, metadata, canonical tags, and JSON-LD

Out of scope:

- hreflang and language URL routing
- full Next/Astro/Remix migration
- private routes: `/admin`, `/api`, `/dashboard`, `/login`, `/packages`
- CRM/patient/chat data
- fabricated ratings, reviews, credentials, patient outcomes, video durations, or upload dates
- destination and guide content hubs beyond current public routes
- broad UI redesigns or unrelated brand cleanups

Dirty-worktree rule:

- Before editing any P1-touch file, inspect `git diff -- <file>`.
- Preserve existing uncommitted changes in `index.html`, `public/index.css`, `src/index.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/pages/Gallery.tsx`, `src/pages/HospitalDetail.tsx`, `src/pages/ProcedureDetail.tsx`, and `src/pages/TravelPage.tsx`.
- Because `pnpm run build` runs `build:css` and rewrites `public/index.css`, save its pre-build diff before validation and restore it after validation unless P1 intentionally changes the generated CSS.
- Stage only P1 hunks. Do not stage unrelated chat, dashboard, i18n, brand asset, favicon, or YouTube analysis changes.

---

## Core Decisions

1. P1 should not rely on client-only metadata.
   React head updates can help after navigation, but crawlers must receive useful HTML from `dist` directly.

2. P1 should not force full React SSR as the first step.
   Current public pages fetch important content in `useEffect` or React Query. Rendering the current app with `renderToString` would mostly produce loading shells and also risks server crashes from browser-only APIs such as `localStorage`.

3. P1 should use post-build static HTML generation.
   The script should read the built `dist/index.html`, inject route-specific head tags and SEO body content into per-route `index.html` files, and keep the normal SPA script so hydration/client navigation still works.

4. P1 canonical URLs must match implemented routes that can return page-specific static HTML.
   Use `/procedure/:procedureName` for procedure guides and `/procedure/:procedureName/videos` for procedure video pages. Keep `/procedure/videos?procedure=...&area=...` working as a client-side compatibility/filter URL, but do not make it the P1 page-specific static canonical because static hosts resolve query URLs to `/procedure/videos/index.html`.

5. Optional public data enrichments must warn and continue.
   Missing Supabase env, missing cases, missing videos, missing images, or missing hospital data should not block deploy. Broken code, invalid route configuration, malformed JSON-LD, or missing required metadata should fail tests.

---

## Initial Route Set

Static public routes:

- `/`
- `/surgeons`
- `/gallery`
- `/travel`
- `/reviews`
- `/video-cases`
- `/procedure/videos`
- `/procedures/face`
- `/procedures/body`
- `/procedures/nonsurgical`
- `/procedures/hair`
- `/procedures/dental`

Priority procedure seeds, exactly 20:

- `rhinoplasty`
- `facelift`
- `eyelid surgery`
- `neck lift`
- `brow lift`
- `revision rhinoplasty`
- `nose tip refinement`
- `mini facelift`
- `cheek augmentation`
- `chin augmentation`
- `liposuction`
- `tummy tuck`
- `breast augmentation`
- `breast lift`
- `BBL`
- `mommy makeover`
- `arm lift`
- `thigh lift`
- `botox`
- `dermal fillers`

Alias resolution:

- `BBL` maps to `Brazilian Butt Lift (BBL)`.
- `botox` maps to the best supported taxonomy option, preferring `BOTOX® & Neurotoxins` if available.
- Each seed must resolve to one supported procedure option or fail a unit test.

Generated procedure guide routes:

- `getImplementedProcedureGuideUrl(procedure.label)`

Generated procedure video routes:

- `/procedure/${encodeURIComponent(procedure.label)}/videos`
- These routes already match the current `src/App.tsx` route pattern. The component redirects legacy path routes to `/procedure/videos?...` at runtime today, so P1 implementation must either remove that redirect for prerendered canonical path routes or make the redirect conditional after the static HTML has been served and tested.

Dynamic public routes:

- public surgeon pages from Supabase or static fallback, when available
- public hospital pages from Supabase, when available

Do not generate future deep URLs such as `/procedures/face/rhinoplasty` in P1 unless the implementation also adds real route support, sitemap support, and legacy canonical/redirect behavior in the same reviewed change.

Query-route rule:

- `/procedure/videos?procedure=...&area=...` cannot have unique static HTML on ordinary static hosting without rewrite/edge logic because the filesystem lookup ignores the query string.
- P1 should generate a generic `/procedure/videos/index.html` for the unfiltered video-cases route and page-specific static HTML under `/procedure/:procedureName/videos/index.html`.
- Include `/procedure/videos` in the P1 static route set and assert `dist/procedure/videos/index.html` exists, because query filter URLs resolve to that same path on static hosting.
- If the implementation chooses to keep query URLs in sitemap for compatibility, they must canonicalize to the matching path URL or to the generic `/procedure/videos` page. Do not claim query-specific HTML is previewable unless curl proves it.

---

## File Structure

Modify:

- `package.json`  
  Add `generate:seo` or `prerender:seo`; run it after `vite build`.

- `scripts/generate-sitemap.mjs`  
  Reuse shared route selection so sitemap and prerender route sets do not drift.

- `src/data/procedureTaxonomyCore.js`  
  Add only missing pure helpers needed for P1 route aliases if necessary.

- `src/data/procedureTaxonomy.ts`  
  Re-export any new pure helpers.

- `index.html`  
  Add deterministic placeholder comments only if the post-build injector needs them. Preserve existing favicon/title changes.

Create:

- `src/seo/site.js`
- `src/seo/routes.js`
- `src/seo/metadata.js`
- `src/seo/schema.js`
- `src/seo/renderStaticHtml.js`
- `src/services/publicSeoData.js`
- `src/services/publicSeoSupabase.js`
- `src/services/publicSeoFallbacks.js`
- `scripts/prerender-public-seo.mjs`
- `test/seoRoutes.test.ts`
- `test/seoMetadata.test.ts`
- `test/seoSchema.test.ts`
- `test/seoPrerenderHtml.test.ts`

Optional:

- `src/components/SeoHead.tsx`  
  Add only if runtime client navigation needs metadata parity. It must consume the same metadata model and must not be the crawler-critical path.

Node-runtime rule:

- Anything imported by `node scripts/prerender-public-seo.mjs` must be plain ESM JavaScript (`.js` or `.mjs`) and must use relative imports that Node can resolve.
- Do not use Vite-only `@/` aliases in Node-imported SEO modules.
- Do not import `src/services/supabaseClient.ts` from Node scripts or build-time SEO modules because it depends on `import.meta.env` and throws when Vite env is absent.
- TypeScript tests may import these `.js` modules through normal relative or configured test aliases.

---

## Chunk 1: Route Selection and Public SEO Data

### Task 1: Define P1 Route Selection

**Files:**

- Create: `src/seo/site.js`
- Create: `src/seo/routes.js`
- Create: `test/seoRoutes.test.ts`
- Modify: `scripts/generate-sitemap.mjs`

- [ ] **Step 1: Write failing route tests**

Create `test/seoRoutes.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getP1PriorityProcedures,
  getP1StaticPublicRoutes,
  getP1ProcedureGuideRoutes,
  getP1ProcedureVideoRoutes,
  getPublicSeoRoutes,
} from '../src/seo/routes.js';

describe('P1 public SEO routes', () => {
  it('selects exactly 20 priority procedures', () => {
    const procedures = getP1PriorityProcedures();
    expect(procedures).toHaveLength(20);
    expect(procedures.map((item) => item.label)).toContain('Rhinoplasty');
    expect(procedures.map((item) => item.label)).toContain('Brazilian Butt Lift (BBL)');
    expect(procedures.map((item) => item.label)).toContain('BOTOX® & Neurotoxins');
    expect(procedures.map((item) => item.label)).not.toContain('Hair Transplant');
    expect(procedures.map((item) => item.label)).not.toContain('Porcelain Veneers');
  });

  it('keeps static public routes inside implemented route boundaries', () => {
    expect(getP1StaticPublicRoutes()).toEqual([
      '/',
      '/surgeons',
      '/gallery',
      '/travel',
      '/reviews',
      '/video-cases',
      '/procedure/videos',
      '/procedures/face',
      '/procedures/body',
      '/procedures/nonsurgical',
      '/procedures/hair',
      '/procedures/dental',
    ]);
  });

  it('uses current implemented procedure routes for guides and videos', () => {
    expect(getP1ProcedureGuideRoutes()).toContain('/procedure/Rhinoplasty');
    expect(getP1ProcedureVideoRoutes()).toContain('/procedure/Rhinoplasty/videos');
    expect(getPublicSeoRoutes()).not.toContain('/procedures/face/rhinoplasty');
    expect(getPublicSeoRoutes()).not.toContain('/procedures/face/rhinoplasty/video-cases');
    expect(getPublicSeoRoutes()).not.toContain('/procedure/videos?procedure=Rhinoplasty&area=face');
  });
});
```

- [ ] **Step 2: Run test to confirm failure**

Run:

```bash
pnpm exec vitest run test/seoRoutes.test.ts
```

Expected: FAIL because `src/seo/routes.js` does not exist.

- [ ] **Step 3: Implement route helpers**

Create `src/seo/site.js`:

```js
export const SITE_ORIGIN = 'https://medorabeauty.com';
export const SITE_NAME = 'Medora Beauty';
export const DEFAULT_OG_IMAGE = '/homepage/aesthetic-cases-collage.png';
export const CONTACT_EMAIL = 'contact@medorabeauty.com';
```

Create `src/seo/routes.js`:

```js
import {
  getImplementedProcedureGuideUrl,
  getSupportedProcedureOptions,
  normalizeProcedureLabel,
} from '../data/procedureTaxonomyCore.js';

export const P1_PRIORITY_PROCEDURE_SEEDS = [
  'rhinoplasty',
  'facelift',
  'eyelid surgery',
  'neck lift',
  'brow lift',
  'revision rhinoplasty',
  'nose tip refinement',
  'mini facelift',
  'cheek augmentation',
  'chin augmentation',
  'liposuction',
  'tummy tuck',
  'breast augmentation',
  'breast lift',
  'BBL',
  'mommy makeover',
  'arm lift',
  'thigh lift',
  'botox',
  'dermal fillers',
];

const aliases = {
  bbl: ['Brazilian Butt Lift (BBL)'],
  botox: ['BOTOX® & Neurotoxins', 'BOTOX® Cosmetic'],
};

export function getP1StaticPublicRoutes() {
  return [
    '/',
    '/surgeons',
    '/gallery',
    '/travel',
    '/reviews',
    '/video-cases',
    '/procedure/videos',
    '/procedures/face',
    '/procedures/body',
    '/procedures/nonsurgical',
    '/procedures/hair',
    '/procedures/dental',
  ];
}

export function getP1PriorityProcedures() {
  const supported = getSupportedProcedureOptions();

  return P1_PRIORITY_PROCEDURE_SEEDS.map((seed) => {
    const candidates = aliases[normalizeProcedureLabel(seed)] || [seed];
    const match = supported.find((procedure) =>
      candidates.some((candidate) => normalizeProcedureLabel(procedure.label) === normalizeProcedureLabel(candidate))
    );

    if (!match) {
      throw new Error(`Unable to resolve P1 priority procedure seed: ${seed}`);
    }

    return match;
  });
}

export function getP1ProcedureGuideRoutes() {
  return getP1PriorityProcedures().map((procedure) => getImplementedProcedureGuideUrl(procedure.label));
}

export function getP1ProcedureVideoRoutes() {
  return getP1PriorityProcedures().map((procedure) => `${getImplementedProcedureGuideUrl(procedure.label)}/videos`);
}

export function getPublicSeoRoutes(extraRoutes = []) {
  return Array.from(
    new Set([
      ...getP1StaticPublicRoutes(),
      ...getP1ProcedureGuideRoutes(),
      ...getP1ProcedureVideoRoutes(),
      ...extraRoutes,
    ])
  );
}
```

- [ ] **Step 4: Reuse route helpers in sitemap generation where safe**

Refactor `scripts/generate-sitemap.mjs` to import shared route helpers only if it does not reduce full sitemap coverage. P1 prerender routes are a subset; sitemap should still include all supported P0 procedure guide/gallery/video URLs.

If sharing creates coupling risk, keep sitemap route generation as-is and add a test that P1 routes are included in sitemap output.

- [ ] **Step 5: Verify routes**

Run:

```bash
pnpm exec vitest run test/seoRoutes.test.ts test/ProcedureTaxonomy.urls.test.ts test/SeoCrawlFiles.test.ts
```

Expected: PASS.

### Task 2: Add Node-Safe Public SEO Data Loaders

**Files:**

- Create: `src/services/publicSeoData.js`
- Create: `src/services/publicSeoSupabase.js`
- Create: `src/services/publicSeoFallbacks.js`
- Create: `test/publicSeoData.test.ts`

- [ ] **Step 1: Write failing data tests**

Create tests that assert:

- missing Supabase env returns taxonomy/static fallback data instead of throwing
- the 20 priority procedure seeds all produce metadata-ready procedure records
- build-time modules do not import `src/services/supabaseClient.ts`
- build-time modules use only Node-resolvable `.js`/`.mjs` relative imports
- optional surgeon/hospital data can be empty with warnings

Run:

```bash
pnpm exec vitest run test/publicSeoData.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 2: Implement normalized SEO data types**

`src/services/publicSeoData.js` should export JSDoc-typed plain ESM objects. If TypeScript types are desired for editor support, add a small sibling `src/services/publicSeoData.d.ts` later, but do not make the Node prerender path depend on TypeScript compilation.

```js
/**
 * @typedef {Object} SeoProcedure
 * @property {string} label
 * @property {string} slug
 * @property {string} area
 * @property {string=} category
 * @property {string} guideUrl
 * @property {string} videoUrl
 * @property {string} title
 * @property {string} description
 * @property {string=} overview
 * @property {string[]} benefits
 * @property {string[]} candidacy
 * @property {string[]} risks
 * @property {string=} recovery
 * @property {string=} imageUrl
 */
```

The public API should be:

```js
export async function loadPublicSeoData(config = {}) {
  // return PublicSeoData
}
```

where `PublicSeoData` includes static pages, priority procedures, surgeons, hospitals, warning messages, and route extras.

- [ ] **Step 3: Implement Supabase loader**

`src/services/publicSeoSupabase.js` should:

- create a client from explicit `SUPABASE_URL`/`VITE_SUPABASE_URL` and key env
- mirror public read queries from current page logic and `scripts/generate-sitemap.mjs`
- return empty arrays plus warnings on query failures
- never import browser Supabase singleton

- [ ] **Step 4: Implement fallbacks**

`src/services/publicSeoFallbacks.js` should:

- use `getP1PriorityProcedures()`
- optionally read `scripts/data/procedures_content_en.json` and `scripts/data/surgeons_generated.json`
- provide taxonomy-only fallback descriptions when static JSON is unavailable
- map `BBL`, `botox`, and other seed aliases conservatively

- [ ] **Step 5: Verify data layer**

Run:

```bash
pnpm exec vitest run test/publicSeoData.test.ts test/seoRoutes.test.ts
```

Expected: PASS.

---

## Chunk 2: Metadata and JSON-LD Builders

### Task 3: Implement Metadata Builders

**Files:**

- Create: `src/seo/metadata.js`
- Create: `test/seoMetadata.test.ts`

- [ ] **Step 1: Write failing metadata tests**

Assert every generated metadata payload has:

- title
- description
- canonical absolute URL
- Open Graph title/description/url
- Twitter card
- no hreflang

Run:

```bash
pnpm exec vitest run test/seoMetadata.test.ts
```

Expected: FAIL.

- [ ] **Step 2: Implement metadata builders**

`src/seo/metadata.js` should export:

- `createHomeMetadata()`
- `createStaticPageMetadata(route)`
- `createProcedureMetadata(procedure)`
- `createProcedureVideoMetadata(procedure)`
- `createSurgeonMetadata(surgeon)`
- `createHospitalMetadata(hospital)`
- `renderHeadTags(metadata)`

Rules:

- canonical URLs must be absolute and based on `SITE_ORIGIN`
- descriptions must be human-readable fallback text when data is missing
- Open Graph image should use a real image if available, otherwise default
- test that `DEFAULT_OG_IMAGE` exists under `public/`
- do not emit hreflang
- escape HTML attributes

- [ ] **Step 3: Verify metadata tests**

Run:

```bash
pnpm exec vitest run test/seoMetadata.test.ts
```

Expected: PASS.

### Task 4: Implement JSON-LD Schema Builders

**Files:**

- Create: `src/seo/schema.js`
- Create: `test/seoSchema.test.ts`

- [ ] **Step 1: Write failing schema tests**

Cover:

- homepage emits `Organization`, `WebSite`, and `MedicalBusiness`
- procedure guide emits `MedicalProcedure`, `BreadcrumbList`, and `FAQPage` only when real safe FAQ source content exists
- procedure category pages emit collection/article-style schema and `BreadcrumbList`
- gallery emits `ImageGallery` and `BreadcrumbList`
- travel emits `Article`, `BreadcrumbList`, and `FAQPage` only when real safe FAQ source content exists
- top-level `/video-cases` emits collection/gallery-style schema and `BreadcrumbList`
- procedure video page emits `VideoObject` only when real video metadata is available, and always emits conservative `MedicalProcedure` plus `BreadcrumbList` without fabricated duration/upload date
- surgeon page emits `Physician`
- hospital page emits `Hospital`
- reviews page does not emit fake `AggregateRating`

Run:

```bash
pnpm exec vitest run test/seoSchema.test.ts
```

Expected: FAIL.

- [ ] **Step 2: Implement schema builders**

`src/seo/schema.js` should export:

- `createHomepageSchema()`
- `createBreadcrumbSchema(items)`
- `createProcedureSchema(procedure)`
- `createProcedureVideoSchema(procedure, videos)`
- `createSurgeonSchema(surgeon)`
- `createHospitalSchema(hospital)`
- `createGallerySchema(cases)`
- `createArticleSchema(page)`
- `createCategorySchema(categoryPage)`
- `createVideoCasesCollectionSchema(videos)`
- `createFaqSchema(faqItems)`
- `renderJsonLdScripts(schemaItems)`

Safety rules:

- do not invent medical reviewer names
- do not invent ratings or review counts
- do not invent case outcomes
- do not expose private patient data
- include privacy/consent wording for case/gallery/video summaries
- escape `<` in JSON output as `\u003c`

- [ ] **Step 3: Verify schema tests**

Run:

```bash
pnpm exec vitest run test/seoSchema.test.ts
```

Expected: PASS.

---

## Chunk 3: Static HTML Prerender Injection

### Task 5: Preserve Canonical Procedure Video Path Routes

**Files:**

- Modify: `src/pages/ProcedureVideoGallery.tsx`
- Create or modify: `test/ProcedureVideoGallery.seo-routes.test.tsx`

- [ ] **Step 1: Write failing route behavior test**

Create or extend a `ProcedureVideoGallery` route test that renders the component at `/procedure/Rhinoplasty/videos` and asserts:

- the browser location remains `/procedure/Rhinoplasty/videos` after effects settle
- canonical metadata payloads can use `/procedure/Rhinoplasty/videos`
- the component still derives the requested procedure from the path

Also test that `/procedure/videos?procedure=Rhinoplasty&area=face` remains supported as a compatibility/filter route.

Run:

```bash
pnpm exec vitest run test/ProcedureVideoGallery.seo-routes.test.tsx
```

Expected: FAIL because current `ProcedureVideoGallery` redirects path routes to `/procedure/videos?...` after hydration.

- [ ] **Step 2: Remove or constrain the hydration redirect**

Modify `src/pages/ProcedureVideoGallery.tsx` so `/procedure/:procedureName/videos` is treated as a canonical SEO path route and does not redirect to `/procedure/videos?...`.

Allowed behavior:

- path routes may derive `selectedProject`, `procedure`, and `area` from `legacyProcedureName`
- query routes may continue to work for filters and legacy links
- if a redirect is still needed for an unrelated legacy shape, make it narrowly conditional and cover it with tests

Do not break the existing generic `/procedure/videos` route.

- [ ] **Step 3: Verify route behavior**

Run:

```bash
pnpm exec vitest run test/ProcedureVideoGallery.seo-routes.test.tsx test/SearchBar.video-cases.test.tsx
```

Expected: PASS.

### Task 6: Generate Per-Route HTML Files

**Files:**

- Create: `src/seo/renderStaticHtml.js`
- Create: `scripts/prerender-public-seo.mjs`
- Create: `test/seoPrerenderHtml.test.ts`
- Modify: `package.json`
- Possibly modify: `index.html`

- [ ] **Step 1: Write failing prerender tests**

Test with a fixture version of built `index.html` that:

- `/procedure/Rhinoplasty/index.html` contains `Rhinoplasty`
- `/procedure/Brazilian%20Butt%20Lift%20(BBL)/index.html` or the proven equivalent filesystem output contains `Brazilian Butt Lift`
- `/procedure/BOTOX%C2%AE%20%26%20Neurotoxins/index.html` or the proven equivalent filesystem output contains `BOTOX`
- route HTML contains `<link rel="canonical" href="https://medorabeauty.com/procedure/Rhinoplasty">`
- route HTML contains `application/ld+json`
- route HTML contains page-specific body content before the SPA script
- path video route `/procedure/Rhinoplasty/videos/index.html` contains `Rhinoplasty`, canonical metadata, and JSON-LD
- generic video route `/procedure/videos/index.html` exists and contains non-filtered video cases metadata/schema
- query route `/procedure/videos?procedure=Rhinoplasty&area=face` is not treated as a unique page-specific static output unless an explicit rewrite is implemented and tested

Run:

```bash
pnpm exec vitest run test/seoPrerenderHtml.test.ts
```

Expected: FAIL.

- [ ] **Step 2: Implement HTML rendering**

`src/seo/renderStaticHtml.js` should expose pure functions:

- `createSeoBody(payload)`  
  Renders semantic static HTML: `<main data-seo-prerender="true">`, H1, summary, key links, and safe fallback sections.

- `injectSeoIntoHtml(html, payload)`  
  Replaces the title/head metadata and injects static SEO body near the root while preserving the SPA root and script.

- `routeToOutputPath(route)`  
  Handles `/` and normal path routes deterministically.

Path encoding rule:

- `routeToOutputPath(route)` must be tested with simple paths, space-containing procedure paths, and special-character procedure paths.
- It may either preserve encoded path segments or decode path segments for filesystem output, but whichever strategy is chosen must be proven by tests and preview/production curl checks.
- Required edge examples:
  - `/procedure/Brazilian%20Butt%20Lift%20(BBL)`
  - `/procedure/BOTOX%C2%AE%20%26%20Neurotoxins`
- Do not assume that a test for `/procedure/Rhinoplasty` covers encoded procedure routes.

Video-route output:

- For `/procedure/Rhinoplasty/videos`, write `dist/procedure/Rhinoplasty/videos/index.html`.
- Also write `dist/procedure/videos/index.html` for the unfiltered route.
- Do not write encoded query folders for `/procedure/videos?procedure=...` unless a host rewrite maps query parameters to those files and curl verification proves it.

- [ ] **Step 3: Implement prerender script**

`scripts/prerender-public-seo.mjs` should:

- run after `vite build`
- read `dist/index.html`
- load public SEO data
- build route payloads
- write `dist/<route>/index.html` outputs
- write a manifest such as `dist/seo-prerender-manifest.json`
- print warnings but exit 0 for optional missing data
- exit nonzero for missing required metadata, invalid JSON-LD, or unreadable `dist/index.html`
- avoid importing `.ts` files or Vite aliases; use only Node-loadable `.js`/`.mjs` modules

- [ ] **Step 4: Add package script**

Update `package.json`:

```json
"generate:seo": "node scripts/prerender-public-seo.mjs",
"build": "npm run build:css && npm run generate:sitemap && vite build && npm run generate:seo"
```

- [ ] **Step 5: Verify prerender tests**

Run:

```bash
pnpm exec vitest run test/seoPrerenderHtml.test.ts test/seoMetadata.test.ts test/seoSchema.test.ts
```

Expected: PASS.

### Task 7: Build and Preview Validation

**Files:**

- Modify only tests/scripts if validation exposes a P1 bug.

- [ ] **Step 1: Run focused SEO tests**

Run:

```bash
pnpm exec vitest run \
  test/seoRoutes.test.ts \
  test/publicSeoData.test.ts \
  test/seoMetadata.test.ts \
  test/seoSchema.test.ts \
  test/seoPrerenderHtml.test.ts \
  test/SeoCrawlFiles.test.ts \
  test/ProcedureTaxonomy.urls.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Before running build, preserve dirty generated CSS if present:

```bash
git diff -- public/index.css > /tmp/medora-public-index-css-before-p1-build.patch
```

Run:

```bash
pnpm run build
```

Expected: PASS. Existing duplicate-key warnings in `src/i18n/translations.ts` and chunk-size warnings may still appear; do not fix them in P1.

After build verification, if `public/index.css` was dirty before build and P1 did not intentionally change CSS, restore the pre-build diff rather than committing generated CSS churn:

```bash
git checkout -- public/index.css
test -s /tmp/medora-public-index-css-before-p1-build.patch && git apply /tmp/medora-public-index-css-before-p1-build.patch
```

- [ ] **Step 3: Inspect generated files**

Run:

```bash
rg -n "Rhinoplasty|canonical|application/ld\\+json" dist/procedure/Rhinoplasty/index.html
rg -n "MedicalProcedure|BreadcrumbList" dist/procedure/Rhinoplasty/index.html
rg -n "Rhinoplasty|canonical|application/ld\\+json" dist/procedure/Rhinoplasty/videos/index.html
find dist/procedure -maxdepth 3 -type f | rg "Brazilian|BOTOX|Neurotoxins|Butt"
rg -n "Medora Beauty|Organization|MedicalBusiness" dist/index.html
```

Expected: all commands find route-specific SEO content.

- [ ] **Step 4: Preview and curl**

Run:

```bash
pnpm preview -- --host 127.0.0.1 --port 4173
```

Then in another shell:

```bash
curl -sL http://127.0.0.1:4173/ | grep -i "application/ld+json"
curl -sL http://127.0.0.1:4173/procedure/Rhinoplasty | grep -i "canonical"
curl -sL http://127.0.0.1:4173/procedure/Rhinoplasty | grep -i "Rhinoplasty"
curl -sL "http://127.0.0.1:4173/procedure/Brazilian%20Butt%20Lift%20(BBL)" | grep -i "Brazilian\\|canonical"
curl -sL "http://127.0.0.1:4173/procedure/BOTOX%C2%AE%20%26%20Neurotoxins" | grep -i "BOTOX\\|canonical"
curl -sL http://127.0.0.1:4173/procedure/Rhinoplasty/videos | grep -i "canonical"
curl -sL http://127.0.0.1:4173/procedure/videos | grep -i "canonical"
curl -sL "http://127.0.0.1:4173/procedure/videos?procedure=Rhinoplasty&area=face" | grep -i "canonical"
curl -sL http://127.0.0.1:4173/surgeons | grep -i "Physician\\|surgeons"
```

Expected: route-specific initial HTML is returned.

Stop the preview server before finishing:

```bash
lsof -ti tcp:4173 | xargs -r kill
```

- [ ] **Step 5: Verify Vercel routing behavior**

`vercel.json` currently has a catch-all rewrite for non-admin/api routes. P1 must verify generated filesystem routes are served before the SPA fallback in production-like routing.

Run when the Vercel CLI is available:

```bash
pnpm exec vercel build
```

Then inspect `.vercel/output/static` or the generated output directory for:

```bash
test -f .vercel/output/static/procedure/Rhinoplasty/index.html
test -f .vercel/output/static/procedure/Rhinoplasty/videos/index.html
test -f .vercel/output/static/procedure/videos/index.html
rg -n "Rhinoplasty|canonical|application/ld\\+json" .vercel/output/static/procedure/Rhinoplasty/index.html
```

File inspection is necessary but not sufficient. P1 must also prove served responses use generated HTML rather than the SPA fallback. Prefer a Vercel preview deployment curl check:

```bash
curl -sL https://<preview-url>/procedure/Rhinoplasty | grep -i "application/ld+json"
curl -sL "https://<preview-url>/procedure/Brazilian%20Butt%20Lift%20(BBL)" | grep -i "Brazilian\\|canonical"
curl -sL "https://<preview-url>/procedure/BOTOX%C2%AE%20%26%20Neurotoxins" | grep -i "BOTOX\\|canonical"
curl -sL https://<preview-url>/procedure/Rhinoplasty/videos | grep -i "canonical"
curl -sL "https://<preview-url>/procedure/videos?procedure=Rhinoplasty&area=face" | grep -i "canonical"
```

If the Vercel CLI or preview deployment is unavailable locally, document that limitation in the implementation notes and do not mark production routing verified. The deploy/merge owner must run the preview curl checks before promoting P1.

Expected:

- generated filesystem routes return route-specific static HTML
- served preview responses return the same route-specific static HTML
- `/procedure/videos?procedure=...` returns the generic `/procedure/videos` canonical behavior, not a fabricated query-specific page
- update `vercel.json` only if this verification proves the catch-all rewrite intercepts generated static HTML before filesystem routes

---

## Chunk 4: Optional Runtime Mirror

### Task 8: Add Client-Side SeoHead Only If Needed

**Files:**

- Optional create: `src/components/SeoHead.tsx`
- Optional modify: public page wrappers in `src/App.tsx` or page components
- Optional create: `test/SeoHead.test.tsx`

- [ ] **Step 1: Decide whether runtime mirror is necessary**

If prerendered output is correct and client navigation metadata parity is not required for P1 acceptance, skip this task.

- [ ] **Step 2: If needed, write failing SeoHead test**

Assert that rendering `SeoHead` updates `document.title`, canonical, meta description, and JSON-LD without duplicating tags.

- [ ] **Step 3: Implement minimal runtime mirror**

`SeoHead` must consume the same metadata/schema payloads as the build-time system. It must not create separate page-specific logic.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec vitest run test/SeoHead.test.tsx
```

Expected: PASS.

---

## Review and Commit Flow

- [ ] **Step 1: Run review-until-clean on the implemented P1 diff**

Review scope must include:

- branch and SHA range
- dirty worktree note
- exact files changed
- route decision: current canonical URLs only
- verification output
- whether `public/index.css` was dirty before build and how it was restored/preserved
- decision that page-specific video static HTML uses `/procedure/:procedureName/videos`, while query video URLs are compatibility/filter URLs only
- confirmation that `/procedure/:procedureName/videos` does not redirect away after hydration
- Vercel served-response verification result, including whether generated filesystem routes beat the SPA fallback
- encoded procedure route verification for at least one space-containing route and one special-character route

- [ ] **Step 2: Fix only verified findings**

Do not accept review comments that push P2 URL migration into P1 unless the implementation already adds real routes, sitemap entries, canonical rules, and tests.

- [ ] **Step 3: Final main-agent recheck**

Check:

```bash
git diff --stat
git diff -- package.json scripts/prerender-public-seo.mjs src/seo src/services/publicSeo* test src/pages/ProcedureVideoGallery.tsx src/App.tsx
git status --short --branch
```

- [ ] **Step 4: Commit only P1 files**

Stage P1 files only. Use a detailed commit message.

Expected commit message:

```bash
git commit -m "feat(seo): prerender public metadata and schema"
```

---

## Acceptance Criteria

- Priority public routes have generated static HTML files.
- Procedure route selection includes exactly 20 guide routes and 20 video routes from the P1 seed list.
- `/procedures/face/rhinoplasty` is not emitted unless implemented as a real route in the same change.
- Procedure video page-specific static HTML uses implemented path routes such as `/procedure/Rhinoplasty/videos`; query filter URLs are not treated as unique static canonical pages.
- `/procedure/Rhinoplasty/videos` remains stable after client hydration and does not redirect to the query filter URL.
- Generic `/procedure/videos` static HTML exists for query-route compatibility.
- Vercel routing verification proves generated static HTML is served before the SPA fallback, or `vercel.json` is updated with tests to make that true.
- Encoded procedure routes, including a space-containing route and a special-character route, return route-specific HTML in preview/production-style verification.
- Generated HTML contains route-specific title, description, canonical, OG/Twitter tags, body text, and JSON-LD.
- JSON-LD follows `docs/seo/SEO_GEO_SCHEMA_LIBRARY.md`.
- Default OG image points to an existing public asset.
- Missing optional Supabase data warns and falls back without blocking build.
- Private CRM/dashboard/auth/package routes are not prerendered.
- Dirty `public/index.css` is preserved around build validation unless P1 intentionally changes generated CSS.
- `pnpm run build` passes.
- Focused SEO tests pass.
- Existing unrelated dirty worktree changes are preserved and not staged.
