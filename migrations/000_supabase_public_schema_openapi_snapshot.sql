-- =====================================================
-- Supabase public schema snapshot from PostgREST OpenAPI
-- Generated from the current project configured in .env
-- Generated at: 2026-06-01T03:36:22.100Z
--
-- Limitations:
-- - This is not a pg_dump output.
-- - It includes REST-exposed public tables, columns, defaults, primary keys, and visible foreign keys.
-- - It does not include RLS policies, indexes, triggers, functions, grants, or non-exposed schemas.
-- - For an authoritative baseline, run npm run db:snapshot with SUPABASE_DB_URL.
-- =====================================================

CREATE TABLE IF NOT EXISTS public."procedures" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "category" varchar(50) NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."procedure_translations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "overview" text,
  "anesthesia" text,
  "procedure_description" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_translations_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."case_photos" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "case_id" uuid NOT NULL,
  "photo_type" varchar(20) NOT NULL,
  "view_angle" varchar(50),
  "image_url" text NOT NULL,
  "thumbnail_url" text,
  "display_order" integer DEFAULT 0,
  "caption" text,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "case_photos_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES public."cases"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_techniques" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "technique_name" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_techniques_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."case_procedures" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "case_id" uuid NOT NULL,
  "procedure_id" uuid NOT NULL,
  "is_primary" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "case_procedures_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES public."cases"("id"),
  CONSTRAINT "case_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_recovery_tips" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "tip_text" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_recovery_tips_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."case_media" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "case_id" uuid NOT NULL,
  "media_type" varchar(50) NOT NULL,
  "media_url" text NOT NULL,
  "thumbnail_url" text,
  "caption" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "case_media_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES public."procedure_cases"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_candidacy" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "candidacy_text" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_candidacy_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."complementary_procedures" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "complementary_name" varchar(255) NOT NULL,
  "reason" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "complementary_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."surgeons" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "surgeon_id" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "title" varchar(255) NOT NULL,
  "experience_years" integer NOT NULL,
  "image_url" text,
  "image_prompt" text,
  "specialties" jsonb,
  "languages" jsonb,
  "education" jsonb,
  "certifications" jsonb,
  "procedures_count" jsonb,
  "bio" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "images" jsonb,
  "translations" jsonb,
  "hospital_id" uuid,
  CONSTRAINT "surgeons_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_recovery" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "recovery_time" varchar(255),
  "ready_to_go_out" varchar(255),
  "resume_exercise" varchar(255),
  "final_results" varchar(255),
  CONSTRAINT "procedure_recovery_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."hospital_rating_breakdown" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "label" varchar(100) NOT NULL,
  "score" numeric NOT NULL,
  "sort_order" integer DEFAULT 0,
  CONSTRAINT "hospital_rating_breakdown_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_recovery_timeline" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "timepoint" varchar(255) NOT NULL,
  "guidance" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_recovery_timeline_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."hospital_nearby_attractions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "name" varchar(255) NOT NULL,
  "distance" varchar(100),
  "sort_order" integer DEFAULT 0,
  CONSTRAINT "hospital_nearby_attractions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."hospital_procedures" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid NOT NULL,
  "procedure_id" uuid NOT NULL,
  "price_range" varchar(100),
  "price_min" numeric,
  "price_max" numeric,
  "is_popular" boolean DEFAULT false,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "currency" varchar(3) DEFAULT 'CNY',
  CONSTRAINT "hospital_procedures_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id"),
  CONSTRAINT "hospital_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."case_translations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "case_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "description" text,
  "patient_goals" text,
  "outcome_summary" text,
  CONSTRAINT "case_translations_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES public."cases"("id")
);

CREATE TABLE IF NOT EXISTS public."cases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "case_number" varchar(50) NOT NULL,
  "procedure_id" uuid NOT NULL,
  "surgeon_name" varchar(255),
  "surgery_date" date,
  "patient_age" integer,
  "patient_gender" varchar(20),
  "patient_location" varchar(255),
  "is_featured" boolean DEFAULT false,
  "display_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "cases_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."hospital_translations" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "tagline" text,
  "description" text,
  "highlights" jsonb,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "nearby_attractions" jsonb,
  CONSTRAINT "hospital_translations_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."hospital_location" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid NOT NULL,
  "address" text,
  "phone" varchar(50),
  "email" varchar(255),
  "website" varchar(255),
  "hours" varchar(255),
  "map_embed" text,
  "latitude" numeric,
  "longitude" numeric,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  CONSTRAINT "hospital_location_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_benefits" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "benefit_text" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_benefits_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_cases" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "case_number" varchar(10) NOT NULL,
  "description" text,
  "provider_name" varchar(255),
  "patient_age" varchar(10),
  "patient_gender" varchar(20),
  "image_count" integer DEFAULT 2,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "surgeon_id" uuid,
  "hospital_id" uuid,
  CONSTRAINT "procedure_cases_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id"),
  CONSTRAINT "procedure_cases_surgeon_id_fkey" FOREIGN KEY ("surgeon_id") REFERENCES public."surgeons"("id"),
  CONSTRAINT "procedure_cases_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id")
);

CREATE TABLE IF NOT EXISTS public."video_testimonials" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "title" varchar(255) NOT NULL,
  "video_url" text,
  "thumbnail_url" text,
  "duration" varchar(20),
  "procedure_id" uuid,
  "country" varchar(100),
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "video_testimonials_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id"),
  CONSTRAINT "video_testimonials_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."procedure_risks" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "procedure_id" uuid NOT NULL,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "risk_text" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "procedure_risks_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

CREATE TABLE IF NOT EXISTS public."hospitals" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "slug" varchar(255) NOT NULL,
  "name" varchar(255) NOT NULL,
  "year_established" integer,
  "rating" numeric DEFAULT 0,
  "review_count" integer DEFAULT 0,
  "hero_image" text,
  "total_patients" integer DEFAULT 0,
  "recommend_rate" integer DEFAULT 0,
  "photos" jsonb,
  "payment_methods" jsonb,
  "highlights" jsonb,
  "is_active" boolean DEFAULT true,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "crm_metadata" jsonb
);

CREATE TABLE IF NOT EXISTS public."reviews" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "hospital_id" uuid,
  "author_name" varchar(255) NOT NULL,
  "country" varchar(100),
  "rating" integer NOT NULL,
  "review_date" date,
  "procedure_id" uuid,
  "language_code" varchar(10) DEFAULT 'en' NOT NULL,
  "review_text" text NOT NULL,
  "is_verified" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  CONSTRAINT "reviews_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES public."hospitals"("id"),
  CONSTRAINT "reviews_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES public."procedures"("id")
);

