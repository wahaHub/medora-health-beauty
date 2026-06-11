# SEO/GEO Monitoring Spec

> Goal: Verify that SEO/GEO changes are live, crawlable, and producing discoverability signals.

## Deployment Checks

Run after every SEO/GEO deploy:

```bash
curl -I https://medorabeauty.com/robots.txt
curl -I https://medorabeauty.com/sitemap.xml
curl -I https://medorabeauty.com/llms.txt
curl -sI https://medorabeauty.com/robots.txt | grep "200"
curl -sI https://medorabeauty.com/sitemap.xml | grep "200"
curl -sI https://medorabeauty.com/llms.txt | grep "200"
curl -sL https://medorabeauty.com/sitemap.xml | grep -i "<urlset"
curl -sL https://medorabeauty.com/robots.txt | grep -i "sitemap"
curl -sL https://medorabeauty.com/llms.txt | grep -i "Medora Beauty"
```

Priority page checks:

```bash
curl -sL https://medorabeauty.com/procedures/face/rhinoplasty | grep -i "rhinoplasty"
curl -sL https://medorabeauty.com/procedures/face/rhinoplasty | grep -i "canonical"
curl -sL https://medorabeauty.com/procedures/face/rhinoplasty | grep -i "application/ld+json"
```

## Search Console

Required setup:

- verify `medorabeauty.com`
- submit `https://medorabeauty.com/sitemap.xml`
- monitor indexing
- monitor page experience
- inspect priority URLs after each phase

Weekly checks:

- indexed page count
- discovered but not indexed
- crawled but not indexed
- sitemap errors
- 404s
- duplicate without user-selected canonical
- alternate page with proper canonical
- top queries
- top pages

## AI/GEO Visibility Checks

Track:

- whether `llms.txt` is reachable
- whether key guide pages contain answer-ready sections
- whether procedure pages include FAQ and reviewer fields
- whether video/case pages include text summaries
- whether AI referral traffic appears in analytics
- whether brand mentions appear in answer engines

## Technical Regression Checks

For priority routes, verify:

- initial HTML contains page-specific content
- canonical URL is correct
- title and description are unique
- JSON-LD is valid
- internal links are real anchors
- old URLs still resolve
- sitemap does not contain blocked or private URLs

## KPIs

Track monthly:

- indexed public pages
- organic clicks
- organic impressions
- average position for priority keyword groups
- cases/gallery landing traffic
- procedure guide landing traffic
- consultation starts from organic sessions
- AI/referral traffic where detectable
- crawl errors

Do not judge impact only by rankings during the first few weeks. First verify crawlability, indexing, and page differentiation.
