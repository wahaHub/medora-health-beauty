# P2 Content Architecture Spec

> Goal: Turn Medora's procedure, doctor, case, video, and travel assets into answer-ready pages that search engines and AI systems can understand and cite.

## Procedure Guide Pages

Procedure guide pages should be educational, structured, and medically responsible. They should include:

| Requirement | Current status | Notes |
| --- | --- | --- |
| Clear H1 | Done for priority prerendered procedure guides | P1/P2 initial HTML emits procedure-specific H1s for priority guide routes. |
| Short answer summary | Done for priority fallback data | Generated from the procedure content overview plus Medora planning context. |
| Overview | Done for priority fallback data | Uses `scripts/data/procedures_content_en.json` where available. |
| Ideal candidates | Done for priority fallback data | Uses existing candidacy lists where available. |
| Who should avoid or delay | Done as conservative guidance | Uses general safety/expectation guidance; should be replaced or refined when procedure-specific contraindication fields exist. |
| Techniques | Done for priority fallback data | Uses existing technique names and descriptions where available. |
| Expected results | Partial | Uses source recovery/final-result timing when present; richer result expectation copy is not yet modeled separately. |
| Recovery timeline | Done for priority fallback data | Uses existing recovery timeline rows where available. |
| Recovery tips | Done for priority fallback data | Uses existing recovery tips where available. |
| Risks and complications | Done for priority fallback data | Uses existing risks and considerations where available. |
| Cost factors | Done as conservative guidance | Uses global-first cost factor guidance; destination-specific pricing pages are still future work. |
| Related before-and-after cases | Not done | Case/gallery text model still needs canonical public case source. |
| Related video cases | Partial | Procedure video pages and guide links exist; richer per-video facts depend on source data. |
| Related surgeons | Not done in procedure guide initial HTML | Surgeon pages are prerendered separately; procedure-to-surgeon relationships still need a build-time source. |
| Related destinations | Not done | Destination hubs are planned but not implemented. |
| FAQ | Done for priority fallback data | Generated from available overview, candidacy, recovery, risk, cost, and avoidance fields. |
| Medical disclaimer | Done for priority fallback data | Generic educational disclaimer is emitted in initial HTML. |
| Reviewed by | Not done | Requires editorial/medical review workflow and reviewer fields. |
| Last updated | Not done | Requires stable source update timestamps or editorial workflow. |

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

Current status: not implemented. Do not add these routes to sitemap or canonicals until real pages and route handlers exist.

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

Current status: not implemented. These pages should be built after priority procedure guides have answer-ready initial HTML and after the canonical URL plan for future slugged routes is finalized.

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
