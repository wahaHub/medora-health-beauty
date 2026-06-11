# Medora Beauty SEO & GEO Audit

> Domain: `medorabeauty.com`  
> Project: `medora-health-beauty`  
> Audit date: 2026-06-11  
> Focus: Google SEO ranking, search indexing, and AI/GEO discoverability

## Executive Summary

Medora Beauty's main SEO and GEO problem is not only content quality. The larger issue is that search engines and AI crawlers currently receive a thin React SPA shell instead of fully rendered, crawlable page content.

Live checks showed that core public URLs such as `/`, `/surgeons`, `/procedure/Rhinoplasty`, `/gallery`, `/travel`, and `/reviews` all return almost identical initial HTML. The returned HTML contains a single global title, no meta description, no page-specific structured data, and an empty root node:

```html
<div id="root"></div>
```

This means the important content is only available after client-side JavaScript runs. Google can sometimes render JavaScript, but it increases crawl cost and slows indexing. Many AI crawlers and answer engines are less reliable with JavaScript-rendered content and prefer static HTML, sitemap discovery, structured data, and clear factual pages.

The site also currently lacks valid `robots.txt`, `sitemap.xml`, and `llms.txt` files. Requests to these paths return the SPA `index.html` rather than the expected file formats. This is a foundational indexing problem.

## Severity Ranking

| Priority | Issue | Impact |
| --- | --- | --- |
| P0 | Public pages return empty SPA shell | Search engines and AI systems cannot easily understand page-specific content |
| P0 | `robots.txt` and `sitemap.xml` are missing or rewritten to HTML | Google has no reliable crawl map for procedures, doctors, cases, and galleries |
| P0 | No SSR, SSG, or prerendering for SEO pages | Core medical content is delayed behind JavaScript execution |
| P0 | No unique metadata per page | Pages compete with each other and look duplicate/thin to search engines |
| P1 | No structured data | Google and AI systems cannot confidently classify procedures, doctors, reviews, FAQs, and case galleries |
| P1 | Weak E-E-A-T signals for a medical/YMYL category | Lower trust for medical and cosmetic surgery queries |
| P1 | No GEO-specific files or answer-ready content blocks | Low probability of AI answer citation |
| P2 | URL structure is inconsistent and not keyword-aligned | Lower clarity for users, search engines, and internal linking |
| P2 | Case/gallery content is image-heavy but text-light | Before-and-after assets are underused for ranking and AI extraction |

## Evidence From Current Implementation

### 1. Single Global HTML Shell

The root HTML file defines one global title and an empty React root:

- `index.html`
- Current title: `Medora Health : Beauty | Medora Beauty`
- No meta description
- No canonical URL
- No Open Graph metadata
- No JSON-LD structured data

Relevant file:

```txt
index.html
```

The initial HTML body contains:

```html
<div id="root"></div>
```

For SEO and GEO, this is a major limitation because crawlers do not receive procedure, surgeon, case, risk, recovery, or review content in the initial response.

### 2. SPA Routing Without Server Rendering

The app uses React Router for public marketing routes:

```txt
src/App.tsx
```

Important routes include:

```txt
/
/team
/surgeons
/gallery
/travel
/reviews
/video-cases
/hospital/:hospitalSlug
/surgeon/:surgeonName
/procedures/:category
/procedure/:procedureName
/procedure/:procedureName/gallery
/procedure/:procedureName/videos
/procedure/:procedureName/case/:caseId
```

These are valuable SEO routes, but they currently resolve to the same initial SPA shell. Search engines and AI crawlers do not receive unique HTML for each route.

### 3. Core Medical Content Loads Client-Side

Procedure detail content is fetched inside React with Supabase queries:

```txt
src/pages/ProcedureDetail.tsx
```

The page fetches:

- procedure details
- translations
- recovery data
- benefits
- candidacy
- techniques
- recovery timeline
- recovery tips
- complementary procedures
- risks
- cases
- related surgeons

This data is valuable, but it is not included in the server-returned HTML. It should be exposed through SSR, SSG, or prerendered static pages.

Surgeon profile pages follow a similar pattern:

```txt
src/pages/SurgeonProfile.tsx
```

They fetch doctor profiles, translations, cases, certifications, education, and specialties after JavaScript runs.

### 4. Invalid Robots and Sitemap Behavior

The deployment config uses a catch-all rewrite:

```txt
vercel.json
```

Current behavior:

```json
{
  "source": "/((?!admin|api).*)",
  "destination": "/index.html"
}
```

Because there is no real `public/robots.txt` or `public/sitemap.xml`, requests to these files are rewritten to `index.html`.

Observed result:

| URL | Expected | Current problem |
| --- | --- | --- |
| `/robots.txt` | `text/plain` robots file | Returns HTML |
| `/sitemap.xml` | XML sitemap | Returns HTML |
| `/llms.txt` | AI-readable text file | Returns HTML |

This harms discovery, indexing, and AI crawling.

## Why Google Ranking Is Weak

### 1. Google Sees Duplicate, Thin Initial HTML

All major public routes return the same title and same HTML shell. This creates several problems:

- Google cannot immediately distinguish page topics.
- Procedure pages do not expose keyword-rich content at crawl time.
- Doctor pages do not expose expertise and credential information at crawl time.
- Case pages do not expose before-and-after details at crawl time.
- The site looks much thinner than it actually is.

### 2. No Valid Sitemap

A global medical/aesthetic platform needs a sitemap that lists:

- procedure pages
- category pages
- surgeon pages
- hospital pages
- gallery pages
- case pages
- video case pages
- destination pages
- guide pages

Without this, Google has to discover pages through JavaScript navigation and internal links, which is slower and less reliable.

### 3. No Page-Specific Metadata

Every important page needs unique metadata:

- title
- meta description
- canonical
- Open Graph title
- Open Graph description
- Open Graph image
- hreflang alternates
- JSON-LD schema

Current global metadata is not enough.

Example target for a rhinoplasty page:

```html
<title>Rhinoplasty Abroad | Before & After Photos, Cost & Recovery | Medora Beauty</title>
<meta name="description" content="Compare rhinoplasty options with vetted surgeons, real before-and-after cases, recovery timeline, risks, and international treatment planning.">
<link rel="canonical" href="https://medorabeauty.com/procedures/rhinoplasty">
```

### 4. Medical/YMYL Trust Signals Are Not Strong Enough

Cosmetic surgery is a medical and YMYL-adjacent topic. Google expects higher trust signals than a normal lifestyle website.

Missing or underdeveloped signals include:

- doctor credentials
- medical reviewer
- content author
- last reviewed date
- clinic/hospital accreditation
- medical disclaimers
- procedure risks
- recovery limitations
- contraindications
- informed-consent language
- citation or source references
- clear distinction between education and medical advice

### 5. The Keyword Strategy Is Not Reflected in URL Architecture

The existing SEO strategy correctly identifies high-value keywords such as:

- `rhinoplasty korea`
- `plastic surgery thailand`
- `hair transplant turkey`
- `facelift before and after`
- `rhinoplasty cost abroad`
- `best plastic surgeon seoul`

However, the current route structure does not create enough dedicated landing pages for those query clusters.

The site needs pages like:

```txt
/procedures/rhinoplasty
/procedures/facelift
/procedures/blepharoplasty
/procedures/rhinoplasty/before-after
/destinations/korea/rhinoplasty
/destinations/thailand/plastic-surgery
/destinations/turkey/hair-transplant
/guides/rhinoplasty-recovery
/guides/facelift-cost-abroad
```

## Why AI/GEO Collection Is Weak

GEO means making content easy for AI answer engines to discover, parse, trust, and cite. Current weaknesses include:

### 1. No `llms.txt`

The site should provide a plain-text `llms.txt` at:

```txt
https://medorabeauty.com/llms.txt
```

It should summarize:

- what Medora Beauty is
- what services it provides
- key procedure guide URLs
- doctor/surgeon directory URLs
- case/gallery URLs
- editorial standards
- medical disclaimer
- contact and business information

### 2. No Answer-Ready Page Structure

AI systems prefer content that can be extracted into concise answers. Procedure pages should include structured sections like:

- What is rhinoplasty?
- Who is a good candidate?
- Who should avoid it?
- Average recovery timeline
- Common risks
- Cost factors
- Questions to ask your surgeon
- Before-and-after case notes
- When to seek medical attention
- Medically reviewed by
- Last updated

### 3. No Structured Data for AI Interpretation

Structured data helps both search engines and AI systems classify content.

Recommended schema types:

- `Organization`
- `MedicalBusiness`
- `MedicalProcedure`
- `Physician`
- `Hospital`
- `ImageGallery`
- `VideoObject`
- `FAQPage`
- `BreadcrumbList`
- `Review`
- `AggregateRating`, only if supported by real review data

### 4. Too Much Important Meaning Is Locked in Images

Before-and-after assets are valuable, but AI crawlers need text around those assets:

- descriptive alt text
- case summary
- procedure performed
- surgeon/provider
- patient concern
- treatment approach
- timeline
- outcome summary
- consent/privacy note

Without this, visual assets do not contribute enough to search or AI answer visibility.

## Historical Recommended Fix Plan

This section is preserved as audit evidence from the original review. Do not implement directly from this section. Active execution guidance lives in `README.md`, `SEO_GEO_MASTER_SPEC.md`, the P0-P3 specs, and `SEO_GEO_URL_CANONICALS.md`.

## Phase 1: Technical Indexing Fixes

Timeline: 1 week

### 1. Add Real Static Crawl Files

Create:

```txt
public/robots.txt
public/sitemap.xml
public/llms.txt
```

Minimum `robots.txt`:

```txt
User-agent: *
Allow: /

Sitemap: https://medorabeauty.com/sitemap.xml
```

Minimum `llms.txt` structure:

```txt
# Medora Beauty

Medora Beauty is a global aesthetic medicine and cosmetic surgery platform connecting international patients with vetted surgeons, hospitals, treatment programs, and before-and-after case resources.

## Key Pages
- https://medorabeauty.com/
- https://medorabeauty.com/surgeons
- https://medorabeauty.com/procedures/rhinoplasty
- https://medorabeauty.com/procedures/facelift
- https://medorabeauty.com/gallery
- https://medorabeauty.com/travel

## Medical Disclaimer
Content is educational and does not replace consultation with a licensed medical professional.
```

### 2. Generate Dynamic Sitemap

The sitemap should include:

- static marketing routes
- all procedure pages
- all procedure gallery pages
- all case pages
- all surgeon pages
- all hospital pages
- video pages
- destination pages
- guide pages

Each URL should include:

- canonical URL
- last modified date
- optional hreflang alternates

### 3. Fix Vercel Rewrite Behavior

Ensure these paths return actual static files:

```txt
/robots.txt
/sitemap.xml
/llms.txt
```

Validation targets:

```txt
curl -I https://medorabeauty.com/robots.txt
curl -I https://medorabeauty.com/sitemap.xml
curl -I https://medorabeauty.com/llms.txt
```

Expected:

- `/robots.txt`: `content-type: text/plain`
- `/sitemap.xml`: `content-type: application/xml` or `text/xml`
- `/llms.txt`: `content-type: text/plain`

## Phase 2: Make Public Pages Crawlable

Timeline: 2 to 4 weeks

### Preferred Option: Migrate Public Marketing Pages to SSG/SSR

Best options:

- Next.js
- Astro
- Remix
- a Vite prerender pipeline

The goal is that this command returns visible page-specific content:

```txt
curl -sL https://medorabeauty.com/procedures/rhinoplasty
```

The returned HTML should include:

- H1
- body content
- procedure summary
- recovery timeline
- risk summary
- doctor links
- case links
- metadata
- structured data

### Minimum Option: Prerender Current SPA Routes

If a framework migration is too large, prerender public SEO routes during build.

Prioritize:

```txt
/
/surgeons
/gallery
/travel
/reviews
/procedures/face
/procedures/body
/procedures/nonsurgical
/procedures/hair
/procedures/dental
/procedure/:procedureName
/surgeon/:surgeonName
/hospital/:hospitalSlug
```

## Phase 3: Metadata and Schema

Timeline: 2 weeks

### Page Metadata Requirements

Every public URL should have:

- unique title
- unique description
- canonical
- Open Graph tags
- Twitter card tags
- hreflang tags for supported languages
- JSON-LD

### Recommended Schema by Page Type

| Page type | Schema |
| --- | --- |
| Homepage | `Organization`, `WebSite`, `MedicalBusiness` |
| Procedure page | `MedicalProcedure`, `FAQPage`, `BreadcrumbList` |
| Surgeon page | `Physician`, `Person`, `BreadcrumbList` |
| Hospital page | `Hospital`, `MedicalBusiness`, `BreadcrumbList` |
| Gallery page | `ImageGallery`, `BreadcrumbList` |
| Video case page | `VideoObject`, `MedicalProcedure` |
| Reviews page | `Review`, `AggregateRating`, only if compliant and real |
| Guide page | `Article`, `FAQPage`, `BreadcrumbList` |

## Phase 4: Content Architecture

Timeline: 1 to 3 months

### Procedure Pages

Each procedure page should include:

- clear H1
- short answer summary
- procedure overview
- ideal candidates
- who should avoid it
- techniques
- recovery timeline
- risks and complications
- expected results
- price/cost factors
- before-and-after cases
- related surgeons
- related destinations
- FAQ
- medical disclaimer
- reviewer and updated date

### Destination Pages

Create destination-specific pages for medical tourism search intent:

```txt
/destinations/korea
/destinations/korea/rhinoplasty
/destinations/korea/facelift
/destinations/thailand
/destinations/thailand/plastic-surgery
/destinations/turkey
/destinations/turkey/hair-transplant
```

Each destination page should include:

- why patients choose this destination
- common procedures
- typical cost factors
- travel and recovery planning
- surgeon/hospital selection criteria
- risks of medical tourism
- consultation process
- FAQs

### Case Pages

Every case page should include text, not only images:

- procedure name
- case number
- surgeon or provider
- patient age range, if available and privacy-safe
- concern
- treatment plan
- timeline
- outcome summary
- image alt text
- consent/privacy statement

## Phase 5: Authority and Trust

Timeline: ongoing

### Build E-E-A-T Signals

Add or improve:

- doctor credential pages
- editorial policy
- medical review policy
- privacy policy
- informed consent explanation
- before-and-after image policy
- patient safety standards
- hospital vetting standards
- risk disclaimers
- content last reviewed date

### External Authority

Build off-site trust through:

- legitimate medical tourism directories
- hospital partner pages
- surgeon partner profiles
- PR mentions
- expert interviews
- patient education articles
- backlinks from relevant health/travel publications

## Suggested Implementation Checklist

### Immediate

- [ ] Add `public/robots.txt`
- [ ] Add `public/llms.txt`
- [ ] Generate `public/sitemap.xml`
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, and `/llms.txt` are not rewritten to HTML
- [ ] Add unique homepage metadata
- [ ] Add page-specific metadata infrastructure
- [ ] Submit sitemap to Google Search Console

### Short Term

- [ ] Add SSR, SSG, or prerendering for public SEO routes
- [ ] Add canonical URLs
- [ ] Add Open Graph metadata
- [ ] Add hreflang tags
- [ ] Add JSON-LD for homepage, procedure pages, and surgeon pages
- [ ] Normalize procedure URLs to lowercase slugs
- [ ] Add 404 handling for invalid routes

### Medium Term

- [ ] Build 20 high-value procedure pages
- [ ] Build destination pages for Korea, Thailand, and Turkey
- [ ] Build before-and-after landing pages by procedure
- [ ] Add FAQ sections to all major procedure pages
- [ ] Add author/reviewer/last updated metadata
- [ ] Add medically responsible disclaimers

### Long Term

- [ ] Build external authority and backlinks
- [ ] Track Search Console indexing and impressions weekly
- [ ] Monitor AI referrals and brand mentions
- [ ] Expand multilingual SEO with hreflang
- [ ] Build comparison guides and recovery guides

## Target Validation Commands

After implementation, these checks should pass:

```bash
curl -sL https://medorabeauty.com/procedures/rhinoplasty | grep -i "rhinoplasty"
curl -sL https://medorabeauty.com/sitemap.xml | grep -i "<urlset"
curl -sL https://medorabeauty.com/robots.txt | grep -i "sitemap"
curl -sL https://medorabeauty.com/llms.txt | grep -i "Medora Beauty"
```

Expected result:

- Procedure pages return meaningful HTML content.
- Sitemap returns valid XML.
- Robots file points to sitemap.
- `llms.txt` returns AI-readable site context.

## Final Diagnosis

Medora Beauty is not failing primarily because it lacks useful assets. The site appears to have valuable procedure data, doctor data, translations, case media, and medical tourism positioning.

The problem is that these assets are not exposed in a way that Google and AI systems can reliably crawl, classify, trust, and cite.

The biggest change should be technical: convert the public marketing and medical content pages from a JavaScript-only SPA experience into crawlable, metadata-rich, structured, server-rendered or prerendered pages.

Once that foundation is fixed, Medora can compete more effectively on long-tail global medical aesthetics searches such as rhinoplasty abroad, facelift recovery, plastic surgery Thailand, hair transplant Turkey, and before-and-after procedure queries.
