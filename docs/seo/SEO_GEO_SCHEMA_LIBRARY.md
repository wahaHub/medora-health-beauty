# SEO/GEO Schema Library

> Goal: Define reusable JSON-LD contracts for Medora public pages.

JSON-LD must be included in initial HTML for target SEO/GEO pages. Client-only schema is not enough for the priority route set.

## Homepage

Use:

- `Organization`
- `WebSite`
- `MedicalBusiness`

Include:

- name
- URL
- logo
- contact email/phone
- sameAs social links
- search action if site search is stable
- medical/aesthetic service description

## Procedure Guide Page

Use:

- `MedicalProcedure`
- `FAQPage`
- `BreadcrumbList`

Include:

- procedure name
- alternate names
- description
- body location
- procedure type
- risks
- recovery information
- candidate summary
- URL
- related images/videos when available
- consultation action

## Surgeon Page

Use:

- `Physician`
- `Person`
- `BreadcrumbList`

Include:

- name
- image
- title
- specialties
- credentials
- hospital affiliation
- languages where available
- profile URL

## Hospital Page

Use:

- `Hospital`
- `MedicalBusiness`
- `BreadcrumbList`

Include:

- name
- location
- description
- specialties
- doctors
- image
- URL

## Case and Gallery Pages

Use:

- `ImageGallery`
- `MedicalProcedure`
- `BreadcrumbList`

Include:

- procedure name
- case identifier
- image URLs
- descriptive captions
- privacy/consent note
- surgeon/provider when available

## Video Case Pages

Use:

- `VideoObject`
- `MedicalProcedure`
- `BreadcrumbList`

Include:

- name
- description
- thumbnail URL
- upload date where available
- duration where available
- content URL or embed URL
- transcript or summary
- procedure relationship
- privacy/consent note

## Reviews Page

Use:

- `Review`
- `AggregateRating` only when backed by real, compliant review data

Do not fabricate aggregate ratings or review counts.

## Guide and Destination Pages

Use:

- `Article`
- `FAQPage`
- `BreadcrumbList`

Include:

- headline
- description
- author or organization
- reviewer when medical
- date modified
- related procedures
- related destinations

## Safety Rules

- Do not invent doctor credentials.
- Do not invent reviews, ratings, durations, or case outcomes.
- Do not expose private patient data.
- Keep before-and-after content tied to consent/privacy notes.
- Use conservative medical language and disclaimers.

## Validation

Validate JSON-LD with:

- Google Rich Results Test, where the schema type is eligible for rich results
- Schema.org validator for broader structured-data correctness
- local tests that assert required fields are present for each page type

Some medical schema types may improve structure and AI/GEO interpretation even when they do not produce a visible Google rich result.
