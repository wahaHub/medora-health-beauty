# P3 Multilingual and Authority Spec

> Goal: Expand Medora's language coverage and trust signals only after crawlable public pages exist.

## Multilingual URL Strategy

Current language switching is state-based inside the app. That is not enough for complete hreflang.

Target language URL options:

Preferred:

- `/en/procedures/face/rhinoplasty`
- `/zh/procedures/face/rhinoplasty`
- `/es/procedures/face/rhinoplasty`
- `/fr/procedures/face/rhinoplasty`
- `/de/procedures/face/rhinoplasty`
- `/ru/procedures/face/rhinoplasty`
- `/ar/procedures/face/rhinoplasty`
- `/vi/procedures/face/rhinoplasty`
- `/id/procedures/face/rhinoplasty`

Avoid query-string language URLs as the primary SEO architecture unless there is a strong technical constraint.

## Hreflang Rule

Do not add complete hreflang until:

- language-specific URLs exist
- each language URL has equivalent content
- canonical and alternate rules are clear
- sitemap can include language alternates

Short term, use English canonical pages and keep the language switcher as a UX feature.

## Authority Signals

Create public trust pages:

- editorial policy
- medical review policy
- doctor and hospital vetting standards
- before-and-after consent policy
- patient privacy policy
- medical tourism safety standards
- informed consent explanation
- advertising and affiliate disclosure, if applicable

Procedure and guide pages should show:

- medically reviewed by
- reviewer credentials
- last reviewed date
- last updated date
- educational disclaimer

## External Authority

Long-term authority work should include:

- legitimate medical tourism directories
- hospital partner backlinks
- surgeon partner profile links
- expert interviews
- patient education articles
- relevant health and travel publication mentions

Do not use low-quality link schemes.

## Validation

- hreflang only appears when URL-level language support is real
- trust policy pages are linked from footer and relevant content
- priority medical pages show reviewer and update information
- Search Console reports language URLs separately after rollout
