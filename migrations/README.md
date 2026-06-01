# Migrations

This folder now uses the current Supabase public schema as the baseline.

- `000_supabase_public_schema_openapi_snapshot.sql` was generated from the live Supabase project configured in `.env` via PostgREST OpenAPI.
- The old hand-written migrations were moved to `archive/migrations-legacy/manual-migrations/`.

Important limitation: this snapshot is not a full `pg_dump`. It captures REST-exposed public tables, columns, defaults, primary keys, and visible foreign keys. It does not capture RLS policies, indexes, triggers, functions, grants, or non-exposed schemas.

For a fully authoritative database baseline, provide `SUPABASE_DB_URL` and run:

```bash
npm run db:snapshot
```

That command uses Supabase CLI/pg_dump and writes a full schema dump to `migrations/000_supabase_current_schema_snapshot.sql`.
