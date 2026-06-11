# P2 Content Architecture Spec

> Goal: Turn Medora's procedure, doctor, case, video, and travel assets into answer-ready pages that search engines and AI systems can understand and cite.

## Procedure Guide Pages

Procedure guide pages should be educational, structured, and medically responsible. They should include:

- clear H1
- short answer summary
- overview
- ideal candidates
- who should avoid the procedure
- techniques
- expected results
- recovery timeline
- recovery tips
- risks and complications
- cost factors
- related before-and-after cases
- related video cases
- related surgeons
- related destinations
- FAQ
- medical disclaimer
- reviewed by
- last updated

Procedure guide pages should serve the SEO/GEO path. They should not be replaced by video case galleries.

## Case and Video Pages

Image and video assets need text context. Each public case or video case should include:

- procedure name
- case number or stable identifier
- surgeon or provider when available
- hospital or location when available
- patient concern
- treatment approach
- outcome summary
- timeline
- media alt text
- consent/privacy note
- video duration
- transcript or summary when available

This content supports `ImageGallery`, `VideoObject`, and AI answer extraction.

## Destination Pages

Destination pages should target medical tourism intent:

- `/destinations/korea`
- `/destinations/korea/rhinoplasty`
- `/destinations/thailand`
- `/destinations/thailand/plastic-surgery`
- `/destinations/turkey`
- `/destinations/turkey/hair-transplant`

Each page should include:

- why patients choose the destination
- popular procedures
- cost factors
- travel and recovery planning
- surgeon/hospital selection criteria
- medical tourism risks
- consultation process
- FAQ
- relevant doctors, hospitals, guides, and cases

## Guide Hubs

Create guide pages for research-stage queries:

- rhinoplasty recovery
- facelift cost abroad
- eyelid surgery recovery
- hair transplant in Turkey
- plastic surgery in Korea
- before-and-after planning
- medical tourism safety checklist

Guides should link to procedure guides, cases, doctors, hospitals, travel pages, and consultation flows.

## Data Requirements

Potential procedure SEO fields:

- `seo_title`
- `seo_description`
- `canonical_slug`
- `canonical_category`
- `meta_image`
- `faq_json`
- `reviewed_by`
- `reviewed_by_title`
- `last_medically_reviewed_at`
- `last_updated_at`
- `medical_disclaimer`
- `cost_factors`
- `who_should_avoid`

Potential case/video fields:

- `patient_concern`
- `treatment_plan`
- `outcome_summary`
- `timeline`
- `media_alt_text`
- `privacy_note`
- `video_url`
- `thumbnail_url`
- `video_duration`
- `video_transcript`

Before adding fields, reconcile current case data models so sitemap, case pages, gallery pages, and schema generation use one canonical public case source.

## Validation

Priority procedure pages should answer:

- What is the procedure?
- Who is a candidate?
- Who should avoid it?
- What are the risks?
- What is the recovery timeline?
- What affects cost?
- What cases and doctors are related?
- What should a patient ask before booking?
