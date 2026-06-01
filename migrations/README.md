# Migrations

This folder uses the current Supabase public schema as the baseline.

- `000_supabase_current_schema_snapshot.sql` is generated from the live Supabase project configured in `.env`.
- The old hand-written migrations were moved to `archive/migrations-legacy/manual-migrations/`.

To refresh the authoritative database baseline, provide `SUPABASE_DB_URL` and run:

```bash
npm run db:snapshot
```

That command uses Supabase CLI/pg_dump and writes the schema dump to `migrations/000_supabase_current_schema_snapshot.sql`.
