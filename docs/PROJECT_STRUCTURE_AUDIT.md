# Medora Health Beauty Project Structure Audit

Date: 2026-06-01

## Current Top-Level Structure

This repository is now split into project-owned areas:

- `src/` - React/Vite application source: app entry, routes, components, contexts, hooks, i18n, pages, services, shared utilities, and app-level types.
- `api/` - Vercel serverless API routes for admin and patient-facing proxy behavior.
- `admin/` - Static admin UI and local admin server.
- `public/` - public runtime assets emitted or served by the app.
- `test/` - Vitest and Testing Library test suite.
- `migrations/` - Supabase/database schema and seed migration files.
- `scripts/` - project data/import/deploy/generation scripts.
- `docs/` - project documentation, reference screenshots, media source material, brand assets, and project data files.
- `archive/` - things kept for traceability but not part of the active Medora Health Beauty app.

## Archive Split

- `archive/external-projects/` - separate apps or repo copies, including the CRM variants, China/Hainan/Hospital Navigator projects, and deployment snapshots.
- `archive/runtime-artifacts/` - generated outputs, old build artifacts, and temporary deployment files.
- `archive/tooling/` - Codex/helper tooling that is useful locally but not part of the app product.
- `archive/deprecated/` - deprecated source files previously mixed into the root.
- `archive/infrastructure-cloudflare-legacy/` - old Terraform/Cloudflare configuration and state.

## Structure Assessment

Looking only at the relevant file structure, it is no longer structurally chaotic. The active project now reads as a normal Vite app with backend/admin/ops/docs separated around it.

Remaining mild messiness:

- Root still has required config files (`package.json`, `vite.config.ts`, `vercel.json`, etc.), which is normal for this stack.
- Hidden local tool folders remain (`.claude`, `.codex-worktrees`, `.deploy-worktrees`, `.worktrees`, `.venv`, `.vercel`). These are not product folders; some are active local tooling or Git worktrees, so they were left in place rather than moved aggressively.
- `scripts/` and `migrations/` are useful but not fully clean. See `docs/SCRIPTS_MIGRATIONS_AUDIT.md`.
- `src/i18n/translations.ts` still has duplicate translation keys. Build succeeds, but the warning means that file itself needs content cleanup.
- The production bundle is currently large, so the app would benefit from route-level code splitting later.

Bottom line: the old root-level clutter was messy. After this pass, the active project structure is understandable; the remaining disorder is mostly local tooling and content debt, not folder ownership confusion.
