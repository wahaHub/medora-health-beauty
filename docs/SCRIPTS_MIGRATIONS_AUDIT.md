# Scripts and Migrations Audit

Date: 2026-06-01

## Terraform

Moved to:

- `archive/infrastructure-cloudflare-legacy/`

Reason: this was Cloudflare/Vercel-era infrastructure state, not the active app runtime. It included local Terraform state and tfvars, so it should not be treated as current deploy source without a fresh infra review.

## Scripts

### Active Maintenance Scripts

- `scripts/data/procedures_content_*.json`
  - Still valuable as source/import content for procedure pages.
  - Not used directly by the Vite app at runtime.

- `scripts/data/surgeons_generated.json`
- `scripts/data/surgeons_translations.json`
  - Still valuable as source/admin seed material.
  - Current Python scripts do not point to this `data/` path yet.

- `scripts/check-currency-data.js`
- `scripts/update-bangkok-currency.js`
  - Still syntactically valid.
  - They depend on `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
  - They assume `hospital_procedures.currency` exists, so they only make sense after `migrations/003_add_procedure_currency.sql`.

- `scripts/dump-supabase-schema.sh`
  - Current preferred path for creating a fresh Supabase schema baseline.
  - Requires `SUPABASE_DB_URL`, because Supabase service-role API keys cannot run `pg_dump`.
  - Writes to `migrations/000_supabase_current_schema_snapshot.sql` by default.

- `scripts/dump-supabase-openapi-schema.mjs`
  - Uses `.env` Supabase REST credentials to snapshot the current PostgREST-exposed public schema.
  - Writes to `migrations/000_supabase_public_schema_openapi_snapshot.sql`.
  - Useful when the Postgres connection string is unavailable, but not a replacement for `pg_dump`.

### Archived Script Files

- `archive/scripts-legacy/broken/run-migration.js`
  - Broken under current `package.json` because the repo is `"type": "module"` but this file uses CommonJS `require`.
  - Fix options: rename to `.cjs`, or rewrite to ESM imports.

- `archive/scripts-legacy/python-generation/translate_surgeons.py`
- `archive/scripts-legacy/python-generation/setup_and_update_translations.py`
  - Paths are stale. They look for `scripts/surgeons_generated.json` and `scripts/surgeons_translations.json`, but the files now live in `scripts/data/`.

- `archive/scripts-legacy/python-generation/deploy.py`
  - Old interactive Git/Vercel deployment helper. The project deploy path is now represented by `vercel.json` and normal build scripts.

- `archive/scripts-legacy/python-generation/generate_surgeons.py`
- `archive/scripts-legacy/python-generation/generate_procedure_hero_images.py`
  - Generation utilities, not runtime requirements.
  - Output locations are outdated for the cleaned repo structure and should be made explicit before use.

- `archive/scripts-legacy/cache/__pycache__/`
  - Python bytecode cache.

### Package Script Drift

Removed stale package scripts that referenced missing files:

- `import-data`: `node import-to-supabase.js`
- `import-cases`: `node import-sample-cases.js`

Those files are not present, so the npm scripts were not valid.

## Migrations

### Current Baseline

- `migrations/000_supabase_public_schema_openapi_snapshot.sql`
  - Generated from the live Supabase project currently configured in `.env`.
  - Captures public REST-exposed tables, columns, defaults, primary keys, and visible foreign keys.
  - Does not include RLS policies, indexes, triggers, functions, grants, or hidden schemas.

### Archived Manual Migrations

- `archive/migrations-legacy/manual-migrations/000_complete_schema.sql`
  - Base schema for procedures, surgeons, and procedure cases.
  - Not fully current by itself; current app also needs later migrations.

- `archive/migrations-legacy/manual-migrations/001_hospital_schema.sql`
  - Still structurally relevant because current frontend reads `hospitals`, `hospital_translations`, `hospital_procedures`, `hospital_location`, `hospital_nearby_attractions`, `reviews`, `video_testimonials`, and hospital-linked `procedure_cases`.
  - Security caveat: it grants anon write policies broadly. Do not apply to production as-is without tightening RLS.

- `archive/migrations-legacy/manual-migrations/002_add_crm_metadata.sql`
  - Still relevant. Current hospital detail UI reads `hospitals.crm_metadata`.

- `archive/migrations-legacy/manual-migrations/003_add_procedure_currency.sql`
  - Still relevant if prices need per-hospital currency.
  - Current hospital procedure query does not select `currency` yet, so the frontend may not fully use it.

- `archive/migrations-legacy/manual-migrations/004_add_case_media_table.sql`
  - Still relevant. Current hospital detail/gallery reads `case_media`.

### Archived Temp/Seed Area

- `archive/migrations-legacy/temp-seed/generate_seed_sql.py`
- `archive/migrations-legacy/temp-seed/002_hospital_seed.sql`
- `archive/migrations-legacy/temp-seed/seed_data.json`
  - Useful as historical seed material for Bangkok hospital data.
  - Should stay marked as temp/seed, not canonical schema.

- `archive/migrations-legacy/temp-seed/run_seed.py`
  - Not safe/current: it hardcodes Supabase URL and a service-role key.
  - This should not be run or kept as active tooling.

## Bottom Line

`migrations/` now has a live Supabase-derived baseline from OpenAPI. It is cleaner than the old manual migration chain, but a full authoritative baseline still requires a real Postgres dump via `SUPABASE_DB_URL`.

`scripts/` is now limited to current maintenance data and two currency-check/update helpers. Legacy generators, broken migration runner, and caches have been moved to `archive/scripts-legacy/`.
