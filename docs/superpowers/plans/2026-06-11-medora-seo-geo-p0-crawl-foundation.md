# Medora SEO/GEO P0 Crawl Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Medora's first SEO/GEO crawl foundation: real crawl files, a safe sitemap generator, shared procedure URL helpers, and crawlable Header/Footer links without publishing future canonical URLs before routes exist.

**Architecture:** Keep P0 inside the current Vite SPA. Use implemented URLs in sitemap and public links: static routes, category routes, legacy procedure guide routes, and current `/procedure/videos?...` case-filter URLs. Do not publish planned `/procedures/:category/:procedureSlug` deep URLs until P1 creates real routes/prerendered output.

**Tech Stack:** Vite, React, React Router, TypeScript, Vitest, Node ESM scripts, Vercel static `public/` assets.

---

## Scope Boundary

This plan implements only `docs/seo/SEO_GEO_P0_CRAWL_FOUNDATION.md`.

In scope:

- `public/robots.txt`
- `public/llms.txt`
- `scripts/generate-sitemap.mjs`
- generated `public/sitemap.xml`
- package build hook for sitemap generation
- shared procedure URL helpers
- Header/Footer crawl-critical links as real anchors
- tests for URL helpers, Header links, Footer links, and sitemap output

Out of scope:

- prerender/SSG
- `react-helmet-async`
- JSON-LD
- route migration to `/procedures/:category/:procedureSlug`
- 301 redirects
- hreflang
- destination pages

Important current dirty-worktree note: do not stage unrelated current modifications outside this task. Before committing, verify `git diff --cached --name-only` only includes P0 files.

---

## File Structure

Modify:

- `src/data/procedureTaxonomy.ts`  
  Keep the typed React-facing taxonomy API while delegating data and pure URL helpers to a shared JavaScript core.

- `src/data/procedureTaxonomyCore.js`  
  Own the taxonomy data and pure URL helpers that must be shared by React code, tests, and Node sitemap generation.

- `src/components/Footer.tsx`  
  Replace crawl-critical procedure buttons and quick-link buttons with real `Link` or `<a href>` elements.

- `src/components/Header.tsx`  
  Give procedure menu items real `href` values for current case-filter URLs instead of `#`.

- `package.json`  
  Add a sitemap generation script and run it during build after CSS generation and before `vite build`.

Create:

- `public/robots.txt`
- `public/llms.txt`
- `scripts/generate-sitemap.mjs`
- `src/data/procedureTaxonomyCore.js`
- `test/ProcedureTaxonomy.urls.test.ts`
- `test/SeoCrawlFiles.test.ts`
- `test/Footer.seo-links.test.tsx`
- `test/Header.seo-links.test.tsx`

Generated:

- `public/sitemap.xml`

Do not modify:

- route definitions for planned canonical deep URLs
- `docs/seo/*` specs, unless implementation reveals a spec bug
- unrelated dirty files already present in the working tree

---

## Chunk 1: Shared Procedure URL Helpers

### Task 1: Extract Shared Taxonomy Core and Add URL Tests

**Files:**

- Create: `src/data/procedureTaxonomyCore.js`
- Create: `test/ProcedureTaxonomy.urls.test.ts`
- Modify later: `src/data/procedureTaxonomy.ts`

- [ ] **Step 1: Write failing tests**

Create `test/ProcedureTaxonomy.urls.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  getImplementedProcedureCanonicalUrl,
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getProcedureAreaQueryValue,
  getProcedureSlug,
  getProcedureVideoGalleryUrl,
  getSupportedProcedureOptions,
} from '@/data/procedureTaxonomy';

describe('procedure taxonomy SEO URL helpers', () => {
  it('creates stable lowercase slugs from procedure labels', () => {
    expect(getProcedureSlug('Rhinoplasty')).toBe('rhinoplasty');
    expect(getProcedureSlug('BOTOX® & Neurotoxins')).toBe('botox-and-neurotoxins');
    expect(getProcedureSlug('Temples Lift / Temporofrontal Lift')).toBe('temples-lift-temporofrontal-lift');
  });

  it('uses currently implemented legacy guide URLs for P0', () => {
    expect(getImplementedProcedureGuideUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty');
    expect(getImplementedProcedureGuideUrl('BOTOX® & Neurotoxins')).toBe('/procedure/BOTOX%C2%AE%20%26%20Neurotoxins');
  });

  it('keeps P0 canonical behavior on implemented legacy guide routes', () => {
    expect(getImplementedProcedureCanonicalUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty');
  });

  it('uses currently implemented legacy gallery URLs for P0', () => {
    expect(getImplementedProcedureGalleryUrl('Rhinoplasty')).toBe('/procedure/Rhinoplasty/gallery');
  });

  it('keeps current video case filter URLs routable', () => {
    expect(getProcedureVideoGalleryUrl('Rhinoplasty')).toBe('/procedure/videos?procedure=Rhinoplasty&area=face');
    expect(getProcedureVideoGalleryUrl('Breast Augmentation')).toBe('/procedure/videos?procedure=Breast+Augmentation&area=breast');
  });

  it('deduplicates supported procedures for sitemap and footer use', () => {
    const labels = getSupportedProcedureOptions().map((procedure) => procedure.label);
    expect(labels).toContain('Rhinoplasty');
    expect(labels).toContain('Hair Transplant');
    expect(labels.filter((label) => label === 'BOTOX® & Neurotoxins')).toHaveLength(1);
    expect(getProcedureAreaQueryValue('Unknown Procedure')).toBe('all');
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run test/ProcedureTaxonomy.urls.test.ts
```

Expected: FAIL because `getProcedureSlug`, `getImplementedProcedureGuideUrl`, and `getImplementedProcedureCanonicalUrl` do not exist yet.

- [ ] **Step 3: Extract shared JavaScript core**

Create `src/data/procedureTaxonomyCore.js` and move the existing taxonomy object plus pure helper logic there. This file should export:

- `proceduresByCategory`
- `normalizeProcedureLabel`
- `getSupportedProcedureOptions`
- `getProcedureAreaQueryValue`
- `getProcedureVideoGalleryUrl`
- `getProcedureSlug`
- `getImplementedProcedureGuideUrl`
- `getImplementedProcedureGalleryUrl`
- `getImplementedProcedureCanonicalUrl`

Add the new helpers:

```js
export const getProcedureSlug = (label) =>
  normalizeProcedureLabel(label)
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getImplementedProcedureGuideUrl = (procedureName) =>
  `/procedure/${encodeURIComponent(decodeURIComponent(procedureName || ''))}`;

export const getImplementedProcedureGalleryUrl = (procedureName) =>
  `${getImplementedProcedureGuideUrl(procedureName)}/gallery`;

export const getImplementedProcedureCanonicalUrl = getImplementedProcedureGuideUrl;
```

`getImplementedProcedureCanonicalUrl` intentionally returns the current legacy guide route during P0. It must not return planned `/procedures/:category/:procedureSlug` routes until P1 adds real route/prerender support.

- [ ] **Step 4: Re-export typed API from TypeScript**

Modify `src/data/procedureTaxonomy.ts`:

```ts
import {
  getImplementedProcedureCanonicalUrl,
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getProcedureAreaQueryValue,
  getProcedureSlug,
  getProcedureVideoGalleryUrl,
  getSupportedProcedureOptions,
  normalizeProcedureLabel,
  proceduresByCategory,
} from './procedureTaxonomyCore.js';

export type ProcedureCategoryKey = 'face' | 'body' | 'nonsurgical' | 'hair' | 'dental';

export interface ProcedureItem {
  label: string;
  category?: string;
}

export {
  getImplementedProcedureCanonicalUrl,
  getImplementedProcedureGalleryUrl,
  getImplementedProcedureGuideUrl,
  getProcedureAreaQueryValue,
  getProcedureSlug,
  getProcedureVideoGalleryUrl,
  getSupportedProcedureOptions,
  normalizeProcedureLabel,
  proceduresByCategory,
};
```

Keep behavior unchanged because `/procedure/videos` and `/procedure/:procedureName` are the current implemented routes.

- [ ] **Step 5: Run helper tests**

Run:

```bash
pnpm exec vitest run test/ProcedureTaxonomy.urls.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/procedureTaxonomy.ts src/data/procedureTaxonomyCore.js test/ProcedureTaxonomy.urls.test.ts
git commit -m "test(seo): cover procedure crawl URL helpers"
```

---

## Chunk 2: Crawlable Header and Footer Links

### Task 2: Convert Footer Procedure Links to Real Anchors

**Files:**

- Modify: `src/components/Footer.tsx`
- Create: `test/Footer.seo-links.test.tsx`

- [ ] **Step 1: Write failing Footer test**

Create `test/Footer.seo-links.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Footer from '@/components/Footer';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        footerQuickLinks: 'Quick Links',
        footerAboutUs: 'About Us',
        footerOurTeam: 'Our Team',
        footerProcedures: 'Procedures',
        footerReviews: 'Reviews',
        footerTravel: 'Travel',
        footerContactInfo: 'Contact',
        footerDescription: 'Global aesthetic medicine platform.',
        footerAllRightsReserved: 'All rights reserved.',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ currentLanguage: 'en' }),
}));

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );

describe('Footer SEO links', () => {
  it('renders supported procedures as crawlable links', () => {
    renderFooter();

    const rhinoplasty = screen.getByRole('link', { name: /rhinoplasty/i });
    expect(rhinoplasty).toHaveAttribute('href', '/procedure/Rhinoplasty');
  });

  it('renders quick links as crawlable links', () => {
    renderFooter();

    expect(screen.getByRole('link', { name: /reviews/i })).toHaveAttribute('href', '/reviews');
    expect(screen.getByRole('link', { name: /travel/i })).toHaveAttribute('href', '/travel');
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run test/Footer.seo-links.test.tsx
```

Expected: FAIL because procedure and quick links are buttons.

- [ ] **Step 3: Replace SEO-critical buttons with links**

Modify `src/components/Footer.tsx`:

- import `Link` from `react-router-dom`
- import `getImplementedProcedureGuideUrl`
- keep social links as external `<a>`
- replace quick-link `<button>` elements with `<Link to="/...">`
- replace procedure `<button>` elements with `<Link to={getImplementedProcedureGuideUrl(procedure)}>`

Keep `title={translateProcedureLabel(procedure)}` and existing classes.

- [ ] **Step 4: Run Footer test**

Run:

```bash
pnpm exec vitest run test/Footer.seo-links.test.tsx
```

Expected: PASS.

### Task 3: Give Header Procedure Items Real Hrefs

**Files:**

- Modify: `src/components/Header.tsx`
- Create: `test/Header.seo-links.test.tsx`

- [ ] **Step 1: Write focused Header test**

Create `test/Header.seo-links.test.tsx` using the same mocking pattern as `test/Header.patient-auth.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '@/components/Header';

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/contexts/PatientAuthContext', () => ({
  usePatientAuth: () => ({ isAuthenticated: false, isLoading: false, patient: null }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dictionary: Record<string, string> = {
        navGallery: 'GALLERY',
        navTravel: 'TRAVEL',
        navResources: 'RESOURCES',
        navContact: 'CONTACT',
      };
      return dictionary[key] ?? key;
    },
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    setLanguage: vi.fn(),
    languages: {
      en: { code: 'EN', flag: 'US', nativeName: 'English' },
      zh: { code: 'ZH', flag: 'CN', nativeName: 'Chinese' },
    },
  }),
}));

vi.mock('@/hooks/useData', () => ({
  useSurgeonsList: () => ({ data: { surgeons: [] }, isLoading: false }),
}));

describe('Header SEO links', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.scrollTo = vi.fn();
  });

  it('renders desktop procedure menu anchors with real case URLs rather than #', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link', { name: /rhinoplasty/i });
    expect(links.some((link) => link.getAttribute('href')?.startsWith('/procedure/videos?'))).toBe(true);
    expect(links.every((link) => link.getAttribute('href') !== '#')).toBe(true);
  });

  it('renders mobile procedure menu items as real anchors', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

    const mobileRhinoplasty = screen.getAllByRole('link', { name: /rhinoplasty/i }).find((link) =>
      link.getAttribute('href')?.startsWith('/procedure/videos?')
    );

    expect(mobileRhinoplasty).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run test/Header.seo-links.test.tsx
```

Expected: FAIL because procedure items still use `href={item.href || '#'}`.

- [ ] **Step 3: Add real hrefs to procedure sections and mobile menu**

Modify `src/components/Header.tsx`:

- When building each `procedureSections` item, set `href: getProcedureVideoGalleryUrl(procedure.label)`.
- Keep category `View all` links as `/procedures/${section.route}`.
- Keep `handleLinkClick` behavior so client navigation still works.
- Add an accessible label to the mobile menu toggle, such as `aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}`.
- Replace mobile submenu procedure `<div onClick>` items with real `<a href={item.href}>` anchors.
- Replace the mobile `+ more procedures` clickable `<div>` with an `<a href="/procedures/face">`.
- Avoid introducing planned `/procedures/:category/:procedureSlug/video-cases` paths in P0.

- [ ] **Step 4: Run Header test**

Run:

```bash
pnpm exec vitest run test/Header.seo-links.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run existing related tests**

Run:

```bash
pnpm exec vitest run test/Header.patient-auth.test.tsx test/SearchBar.video-cases.test.tsx test/ProcedureTaxonomy.dental.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/Footer.tsx src/components/Header.tsx test/Footer.seo-links.test.tsx test/Header.seo-links.test.tsx
git commit -m "fix(seo): expose procedure navigation as crawlable links"
```

---

## Chunk 3: Static Crawl Files and Sitemap Generator

### Task 4: Add Crawl File Tests

**Files:**

- Create: `test/SeoCrawlFiles.test.ts`
- Create later: `public/robots.txt`
- Create later: `public/llms.txt`
- Create later: `scripts/generate-sitemap.mjs`
- Generate later: `public/sitemap.xml`

- [ ] **Step 1: Write failing crawl-file tests**

Create `test/SeoCrawlFiles.test.ts`:

```ts
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('SEO crawl files', () => {
  it('robots.txt points to sitemap and blocks private app areas', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');

    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /api');
    expect(robots).toContain('Disallow: /dashboard');
    expect(robots).toContain('Sitemap: https://medorabeauty.com/sitemap.xml');
  });

  it('llms.txt gives AI crawlers concise site context', () => {
    const llms = readFileSync('public/llms.txt', 'utf8');

    expect(llms).toContain('# Medora Beauty');
    expect(llms).toContain('https://medorabeauty.com/surgeons');
    expect(llms).toContain('Procedure Guides');
    expect(llms).toContain('Doctors and Hospitals');
    expect(llms).toContain('Cases and Gallery');
    expect(llms).toContain('Editorial Standards');
    expect(llms).toContain('Medical Disclaimer');
  });

  it('generates a sitemap with only implemented P0 URLs', () => {
    execFileSync('node', ['scripts/generate-sitemap.mjs'], {
      env: {
        ...process.env,
        VITE_SUPABASE_URL: '',
        SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
        SUPABASE_ANON_KEY: '',
      },
      stdio: 'pipe',
    });
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');

    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedures/face</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/Rhinoplasty</loc>');
    expect(sitemap).toContain('<loc>https://medorabeauty.com/procedure/Rhinoplasty/gallery</loc>');
    expect(sitemap).toContain('/procedure/videos?procedure=Rhinoplasty&amp;area=face');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty</loc>');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty/video-cases');
    expect(sitemap).not.toContain('/procedures/face/rhinoplasty/before-after');
  });
});
```

- [ ] **Step 2: Run tests and confirm they fail**

Run:

```bash
pnpm exec vitest run test/SeoCrawlFiles.test.ts
```

Expected: FAIL because crawl files and generator do not exist yet.

### Task 5: Add robots.txt and llms.txt

**Files:**

- Create: `public/robots.txt`
- Create: `public/llms.txt`

- [ ] **Step 1: Add `public/robots.txt`**

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

- [ ] **Step 2: Add `public/llms.txt`**

Include concise sections:

```txt
# Medora Beauty

Medora Beauty is a global aesthetic medicine and cosmetic surgery platform connecting international patients with vetted surgeons, hospitals, treatment programs, and before-and-after case resources.

## Key Pages
- https://medorabeauty.com/
- https://medorabeauty.com/surgeons
- https://medorabeauty.com/gallery
- https://medorabeauty.com/video-cases
- https://medorabeauty.com/travel
- https://medorabeauty.com/reviews

## Procedure Areas
- https://medorabeauty.com/procedures/face
- https://medorabeauty.com/procedures/body
- https://medorabeauty.com/procedures/nonsurgical
- https://medorabeauty.com/procedures/hair
- https://medorabeauty.com/procedures/dental

## Procedure Guides
During P0, Medora publishes currently implemented `/procedure/{name}` guide URLs. Planned canonical `/procedures/{area}/{slug}` URLs should be adopted only after route and prerender support exists.

## Doctors and Hospitals
Medora provides doctor and hospital discovery pages for patients comparing care options.

## Cases and Gallery
Medora provides before-and-after galleries and video case resources. Case media should be interpreted with its surrounding procedure, provider, consent, and privacy context.

## Editorial Standards
Medora content should distinguish education from medical advice, avoid fabricated outcomes or credentials, and route patients to licensed professional consultation.

## Medical Disclaimer
Content is educational and does not replace consultation with a licensed medical professional.

## Contact
Email: contact@medicaltourismchina.health
```

### Task 6: Add Safe Sitemap Generator

**Files:**

- Create: `scripts/generate-sitemap.mjs`
- Modify: `src/data/procedureTaxonomyCore.js`
- Modify: `package.json`
- Generate: `public/sitemap.xml`

- [ ] **Step 1: Implement `scripts/generate-sitemap.mjs`**

Use Node ESM and import the shared JS core from `src/data/procedureTaxonomyCore.js`. Do not duplicate the procedure list inside the script.

The sitemap generator should emit:

- static routes
- category routes
- legacy guide routes generated from `getSupportedProcedureOptions()` and `getImplementedProcedureGuideUrl()`
- legacy gallery routes generated from `getImplementedProcedureGalleryUrl()`
- current video case filter routes generated from `getProcedureVideoGalleryUrl()`
- env-conditional Supabase surgeon, hospital, and case routes when public data and env vars are available

Use Supabase only when both URL and anon key are available. Check common env names in this order:

- `VITE_SUPABASE_URL`
- `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_ANON_KEY`

If env vars are missing or Supabase queries fail, log a warning and continue with the static/taxonomy sitemap. Do not fail the build for unavailable optional public data.

Keep a prominent comment:

```js
// P0 intentionally emits only routes that currently resolve in the SPA.
// Do not emit /procedures/:category/:procedureSlug until P1 adds real routes/prerender output.
```

The script should:

- use `https://medorabeauty.com` as base URL
- XML-escape `&` in query URLs
- de-duplicate URLs
- sort URLs for stable diffs
- write `public/sitemap.xml`

Supabase enrichment should attempt conservative public routes only:

- `/surgeon/:surgeonNameOrId` from `surgeons`
- `/hospital/:hospitalSlug` from hospitals if the public table/field exists
- current legacy case routes only when procedure and case identifiers are available

Pin conservative query shapes to current public schema names where possible:

- `surgeons.surgeon_id`
- `hospitals.slug`
- `procedure_cases.case_number` joined or associated with procedure names only when the relationship is clear

Each table query should be isolated and non-fatal.

Keep Supabase failures non-fatal because P0 must work in local and CI environments without production credentials.

- [ ] **Step 2: Add package scripts**

Modify `package.json`:

```json
"generate:sitemap": "node scripts/generate-sitemap.mjs",
"build": "npm run build:css && npm run generate:sitemap && vite build"
```

Do not remove existing scripts.

- [ ] **Step 3: Generate sitemap**

Run:

```bash
pnpm run generate:sitemap
```

Expected: `public/sitemap.xml` is created and includes static routes, categories, legacy procedure guide URLs, and `/procedure/videos?...` URLs.

- [ ] **Step 4: Run crawl-file tests**

Run:

```bash
pnpm exec vitest run test/SeoCrawlFiles.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt public/llms.txt public/sitemap.xml scripts/generate-sitemap.mjs package.json test/SeoCrawlFiles.test.ts
git commit -m "feat(seo): add crawl files and sitemap generation"
```

---

## Chunk 4: Build and Production-Like Verification

### Task 7: Run Focused Test Suite

**Files:**

- No new files.

- [ ] **Step 1: Run P0 tests together**

Run:

```bash
pnpm exec vitest run \
  test/ProcedureTaxonomy.urls.test.ts \
  test/Footer.seo-links.test.tsx \
  test/Header.seo-links.test.tsx \
  test/SeoCrawlFiles.test.ts \
  test/SearchBar.video-cases.test.tsx \
  test/ProcedureTaxonomy.dental.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full test suite if focused tests pass**

Run:

```bash
pnpm test
```

Expected: PASS. If unrelated pre-existing tests fail, capture the failing tests and decide whether they are caused by P0.

### Task 8: Build and Verify Static Outputs

**Files:**

- Generated: `dist/robots.txt`
- Generated: `dist/llms.txt`
- Generated: `dist/sitemap.xml`

- [ ] **Step 1: Run production build**

Run:

```bash
pnpm run build
```

Expected: PASS and `dist` contains `robots.txt`, `llms.txt`, and `sitemap.xml`.

- [ ] **Step 2: Inspect build outputs**

Run:

```bash
test -f dist/robots.txt
test -f dist/llms.txt
test -f dist/sitemap.xml
rg "<urlset|/procedure/Rhinoplasty|/procedure/videos" dist/sitemap.xml
```

Expected: all commands pass.

- [ ] **Step 3: Preview locally**

Run:

```bash
pnpm preview -- --host 127.0.0.1 --port 4173
```

In a second terminal:

```bash
curl -sI http://127.0.0.1:4173/robots.txt | grep -E "200|content-type"
curl -sI http://127.0.0.1:4173/sitemap.xml | grep -E "200|content-type"
curl -sI http://127.0.0.1:4173/llms.txt | grep -E "200|content-type"
curl -sL http://127.0.0.1:4173/sitemap.xml | grep -i "<urlset"
```

Expected: each crawl file returns 200 and the sitemap contains `<urlset`.

- [ ] **Step 4: Stop preview server**

Stop the preview process cleanly before final response.

### Task 9: Final Commit and Diff Audit

**Files:**

- All P0 files only.

- [ ] **Step 1: Review staged file list**

Run:

```bash
git status --short
git diff --cached --name-only
```

Expected: staged files are only P0 implementation and test files. Do not stage unrelated dirty files.

- [ ] **Step 2: Commit any remaining verified changes**

If all prior tasks already committed in chunks, there may be nothing left to commit. Otherwise:

```bash
git add <only P0 files>
git commit -m "chore(seo): verify crawl foundation outputs"
```

- [ ] **Step 3: Summarize verification**

Record:

- focused tests
- full tests or reason skipped
- build result
- preview curl results
- any unrelated dirty files left untouched

---

## Handoff Notes

After P0 lands, the next plan should be `P1 Prerender, Metadata, and Schema`.

Do not start P1 until:

- `/robots.txt`, `/sitemap.xml`, and `/llms.txt` are live and return 200
- sitemap does not publish planned deep canonical URLs prematurely
- Header/Footer procedure links have real current URLs
- P0 has been deployed and verified on `https://medorabeauty.com`

Production verification commands after deploy:

```bash
curl -sI https://medorabeauty.com/robots.txt | grep -E "200|content-type"
curl -sI https://medorabeauty.com/sitemap.xml | grep -E "200|content-type"
curl -sI https://medorabeauty.com/llms.txt | grep -E "200|content-type"
curl -sL https://medorabeauty.com/sitemap.xml | grep -i "<urlset"
```
