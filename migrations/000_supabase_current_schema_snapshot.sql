


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."get_surgeon_id_by_name"("surgeon_name" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result_id UUID;
BEGIN
  SELECT id INTO result_id
  FROM surgeons
  WHERE name = surgeon_name
  LIMIT 1;
  RETURN result_id;
END;
$$;


ALTER FUNCTION "public"."get_surgeon_id_by_name"("surgeon_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_case_media_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_case_media_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."case_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "media_type" character varying(50) NOT NULL,
    "media_url" "text" NOT NULL,
    "thumbnail_url" "text",
    "caption" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "case_media_media_type_check" CHECK ((("media_type")::"text" = ANY ((ARRAY['image'::character varying, 'video'::character varying])::"text"[])))
);


ALTER TABLE "public"."case_media" OWNER TO "postgres";


COMMENT ON TABLE "public"."case_media" IS 'Stores media files (images/videos) for procedure cases. Used by both beauty hospitals (Main Supabase) and regular hospitals (China Medical Supabase).';



CREATE TABLE IF NOT EXISTS "public"."case_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "photo_type" character varying(20) NOT NULL,
    "view_angle" character varying(50),
    "image_url" "text" NOT NULL,
    "thumbnail_url" "text",
    "display_order" integer DEFAULT 0,
    "caption" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."case_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."case_procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."case_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "description" "text",
    "patient_goals" "text",
    "outcome_summary" "text"
);


ALTER TABLE "public"."case_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_number" character varying(50) NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "surgeon_name" character varying(255),
    "surgery_date" "date",
    "patient_age" integer,
    "patient_gender" character varying(20),
    "patient_location" character varying(255),
    "is_featured" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."complementary_procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "complementary_name" character varying(255) NOT NULL,
    "reason" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."complementary_procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hospital_location" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid" NOT NULL,
    "address" "text",
    "phone" character varying(50),
    "email" character varying(255),
    "website" character varying(255),
    "hours" character varying(255),
    "map_embed" "text",
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hospital_location" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hospital_nearby_attractions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "name" character varying(255) NOT NULL,
    "distance" character varying(100),
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."hospital_nearby_attractions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hospital_procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid" NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "price_range" character varying(100),
    "price_min" numeric(10,2),
    "price_max" numeric(10,2),
    "is_popular" boolean DEFAULT false,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "currency" character varying(3) DEFAULT 'CNY'::character varying
);


ALTER TABLE "public"."hospital_procedures" OWNER TO "postgres";


COMMENT ON COLUMN "public"."hospital_procedures"."currency" IS 'Currency code: CNY, USD, THB, KRW, JPY, EUR, GBP';



CREATE TABLE IF NOT EXISTS "public"."hospital_rating_breakdown" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "label" character varying(100) NOT NULL,
    "score" numeric(3,2) NOT NULL,
    "sort_order" integer DEFAULT 0,
    CONSTRAINT "hospital_rating_breakdown_score_check" CHECK ((("score" >= (0)::numeric) AND ("score" <= (5)::numeric)))
);


ALTER TABLE "public"."hospital_rating_breakdown" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hospital_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "tagline" "text",
    "description" "text",
    "highlights" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "nearby_attractions" "jsonb"
);


ALTER TABLE "public"."hospital_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hospitals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "year_established" integer,
    "rating" numeric(3,2) DEFAULT 0.00,
    "review_count" integer DEFAULT 0,
    "hero_image" "text",
    "total_patients" integer DEFAULT 0,
    "recommend_rate" integer DEFAULT 0,
    "photos" "jsonb" DEFAULT '[]'::"jsonb",
    "payment_methods" "jsonb" DEFAULT '[]'::"jsonb",
    "highlights" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "crm_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."hospitals" OWNER TO "postgres";


COMMENT ON COLUMN "public"."hospitals"."photos" IS 'JSONB array of photo URLs: ["url1","url2",...]';



COMMENT ON COLUMN "public"."hospitals"."payment_methods" IS 'JSONB array: ["Visa","Mastercard","Wire Transfer",...]';



COMMENT ON COLUMN "public"."hospitals"."highlights" IS 'JSONB array of {icon,text}: [{"icon":"award","text":"JCI Accredited since 2012"},...]';



COMMENT ON COLUMN "public"."hospitals"."crm_metadata" IS 'CRM系统专用元数据字段，存储床位数、设施、认证等CRM管理的信息';



CREATE TABLE IF NOT EXISTS "public"."procedure_benefits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "benefit_text" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_benefits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_candidacy" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "candidacy_text" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_candidacy" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "case_number" character varying(10) NOT NULL,
    "description" "text",
    "provider_name" character varying(255),
    "patient_age" character varying(10),
    "patient_gender" character varying(20),
    "image_count" integer DEFAULT 2,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "surgeon_id" "uuid",
    "hospital_id" "uuid"
);


ALTER TABLE "public"."procedure_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_recovery" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "recovery_time" character varying(255),
    "ready_to_go_out" character varying(255),
    "resume_exercise" character varying(255),
    "final_results" character varying(255)
);


ALTER TABLE "public"."procedure_recovery" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_recovery_timeline" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "timepoint" character varying(255) NOT NULL,
    "guidance" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_recovery_timeline" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_recovery_tips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "tip_text" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_recovery_tips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_risks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "risk_text" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_risks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_techniques" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "technique_name" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_techniques" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedure_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_id" "uuid" NOT NULL,
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "overview" "text",
    "anesthesia" "text",
    "procedure_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedure_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."procedures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "procedure_name" character varying(255) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "category" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."procedures" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid",
    "author_name" character varying(255) NOT NULL,
    "country" character varying(100),
    "rating" integer NOT NULL,
    "review_date" "date",
    "procedure_id" "uuid",
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "review_text" "text" NOT NULL,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."surgeons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "surgeon_id" character varying(255) NOT NULL,
    "name" character varying(255) NOT NULL,
    "title" character varying(255) NOT NULL,
    "experience_years" integer NOT NULL,
    "image_url" "text",
    "image_prompt" "text",
    "specialties" "jsonb" DEFAULT '[]'::"jsonb",
    "languages" "jsonb" DEFAULT '[]'::"jsonb",
    "education" "jsonb" DEFAULT '[]'::"jsonb",
    "certifications" "jsonb" DEFAULT '[]'::"jsonb",
    "procedures_count" "jsonb" DEFAULT '{}'::"jsonb",
    "bio" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "images" "jsonb" DEFAULT '{}'::"jsonb",
    "translations" "jsonb" DEFAULT '{}'::"jsonb",
    "hospital_id" "uuid"
);


ALTER TABLE "public"."surgeons" OWNER TO "postgres";


COMMENT ON COLUMN "public"."surgeons"."images" IS 'JSONB object containing surgeon photos: hero (main profile photo), certification (certificates/awards), with_patients (photos with patients)';



COMMENT ON COLUMN "public"."surgeons"."translations" IS 'JSONB object containing translations for all supported languages. Structure: {"zh": {"title": "...", "specialties": [...], "languages": [...], "education": [...], "certifications": [...], "bio": {"intro": "...", "expertise": "...", "philosophy": "...", "achievements": [...]}}, "es": {...}, "fr": {...}, ...}';



CREATE TABLE IF NOT EXISTS "public"."video_testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "hospital_id" "uuid",
    "language_code" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "title" character varying(255) NOT NULL,
    "video_url" "text",
    "thumbnail_url" "text",
    "duration" character varying(20),
    "procedure_id" "uuid",
    "country" character varying(100),
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."video_testimonials" OWNER TO "postgres";


ALTER TABLE ONLY "public"."case_media"
    ADD CONSTRAINT "case_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_photos"
    ADD CONSTRAINT "case_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_procedures"
    ADD CONSTRAINT "case_procedures_case_id_procedure_id_key" UNIQUE ("case_id", "procedure_id");



ALTER TABLE ONLY "public"."case_procedures"
    ADD CONSTRAINT "case_procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_translations"
    ADD CONSTRAINT "case_translations_case_id_language_code_key" UNIQUE ("case_id", "language_code");



ALTER TABLE ONLY "public"."case_translations"
    ADD CONSTRAINT "case_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_case_number_key" UNIQUE ("case_number");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."complementary_procedures"
    ADD CONSTRAINT "complementary_procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospital_location"
    ADD CONSTRAINT "hospital_location_hospital_id_key" UNIQUE ("hospital_id");



ALTER TABLE ONLY "public"."hospital_location"
    ADD CONSTRAINT "hospital_location_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospital_nearby_attractions"
    ADD CONSTRAINT "hospital_nearby_attractions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospital_procedures"
    ADD CONSTRAINT "hospital_procedures_hospital_id_procedure_id_key" UNIQUE ("hospital_id", "procedure_id");



ALTER TABLE ONLY "public"."hospital_procedures"
    ADD CONSTRAINT "hospital_procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospital_rating_breakdown"
    ADD CONSTRAINT "hospital_rating_breakdown_hospital_id_language_code_label_key" UNIQUE ("hospital_id", "language_code", "label");



ALTER TABLE ONLY "public"."hospital_rating_breakdown"
    ADD CONSTRAINT "hospital_rating_breakdown_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospital_translations"
    ADD CONSTRAINT "hospital_translations_hospital_id_language_code_key" UNIQUE ("hospital_id", "language_code");



ALTER TABLE ONLY "public"."hospital_translations"
    ADD CONSTRAINT "hospital_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospitals"
    ADD CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hospitals"
    ADD CONSTRAINT "hospitals_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."procedure_benefits"
    ADD CONSTRAINT "procedure_benefits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_candidacy"
    ADD CONSTRAINT "procedure_candidacy_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_cases"
    ADD CONSTRAINT "procedure_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_cases"
    ADD CONSTRAINT "procedure_cases_procedure_id_case_number_key" UNIQUE ("procedure_id", "case_number");



ALTER TABLE ONLY "public"."procedure_recovery"
    ADD CONSTRAINT "procedure_recovery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_recovery"
    ADD CONSTRAINT "procedure_recovery_procedure_id_language_code_key" UNIQUE ("procedure_id", "language_code");



ALTER TABLE ONLY "public"."procedure_recovery_timeline"
    ADD CONSTRAINT "procedure_recovery_timeline_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_recovery_tips"
    ADD CONSTRAINT "procedure_recovery_tips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_risks"
    ADD CONSTRAINT "procedure_risks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_techniques"
    ADD CONSTRAINT "procedure_techniques_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_translations"
    ADD CONSTRAINT "procedure_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedure_translations"
    ADD CONSTRAINT "procedure_translations_procedure_id_language_code_key" UNIQUE ("procedure_id", "language_code");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_procedure_name_key" UNIQUE ("procedure_name");



ALTER TABLE ONLY "public"."procedures"
    ADD CONSTRAINT "procedures_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surgeons"
    ADD CONSTRAINT "surgeons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surgeons"
    ADD CONSTRAINT "surgeons_surgeon_id_key" UNIQUE ("surgeon_id");



ALTER TABLE ONLY "public"."video_testimonials"
    ADD CONSTRAINT "video_testimonials_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_case_media_case_id" ON "public"."case_media" USING "btree" ("case_id");



CREATE INDEX "idx_case_media_sort_order" ON "public"."case_media" USING "btree" ("case_id", "sort_order");



CREATE INDEX "idx_case_photos_case" ON "public"."case_photos" USING "btree" ("case_id");



CREATE INDEX "idx_case_photos_type" ON "public"."case_photos" USING "btree" ("photo_type");



CREATE INDEX "idx_case_procedures_case" ON "public"."case_procedures" USING "btree" ("case_id");



CREATE INDEX "idx_case_procedures_procedure" ON "public"."case_procedures" USING "btree" ("procedure_id");



CREATE INDEX "idx_case_translations_case" ON "public"."case_translations" USING "btree" ("case_id");



CREATE INDEX "idx_case_translations_language" ON "public"."case_translations" USING "btree" ("language_code");



CREATE INDEX "idx_cases_case_number" ON "public"."cases" USING "btree" ("case_number");



CREATE INDEX "idx_cases_display_order" ON "public"."cases" USING "btree" ("display_order");



CREATE INDEX "idx_cases_featured" ON "public"."cases" USING "btree" ("is_featured");



CREATE INDEX "idx_cases_procedure" ON "public"."cases" USING "btree" ("procedure_id");



CREATE INDEX "idx_complementary_procedures_procedure" ON "public"."complementary_procedures" USING "btree" ("procedure_id");



CREATE INDEX "idx_hospital_location_hospital" ON "public"."hospital_location" USING "btree" ("hospital_id");



CREATE INDEX "idx_hospital_nearby_attractions_hospital" ON "public"."hospital_nearby_attractions" USING "btree" ("hospital_id");



CREATE INDEX "idx_hospital_procedures_hospital" ON "public"."hospital_procedures" USING "btree" ("hospital_id");



CREATE INDEX "idx_hospital_procedures_procedure" ON "public"."hospital_procedures" USING "btree" ("procedure_id");



CREATE INDEX "idx_hospital_rating_breakdown_hospital" ON "public"."hospital_rating_breakdown" USING "btree" ("hospital_id");



CREATE INDEX "idx_hospital_translations_hospital" ON "public"."hospital_translations" USING "btree" ("hospital_id");



CREATE INDEX "idx_hospital_translations_language" ON "public"."hospital_translations" USING "btree" ("language_code");



CREATE INDEX "idx_hospitals_active" ON "public"."hospitals" USING "btree" ("is_active");



CREATE INDEX "idx_hospitals_slug" ON "public"."hospitals" USING "btree" ("slug");



CREATE INDEX "idx_procedure_benefits_language" ON "public"."procedure_benefits" USING "btree" ("language_code");



CREATE INDEX "idx_procedure_benefits_procedure" ON "public"."procedure_benefits" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_candidacy_procedure" ON "public"."procedure_candidacy" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_cases_case_number" ON "public"."procedure_cases" USING "btree" ("case_number");



CREATE INDEX "idx_procedure_cases_hospital" ON "public"."procedure_cases" USING "btree" ("hospital_id");



CREATE INDEX "idx_procedure_cases_procedure" ON "public"."procedure_cases" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_cases_surgeon_id" ON "public"."procedure_cases" USING "btree" ("surgeon_id");



CREATE INDEX "idx_procedure_cases_surgeon_procedure" ON "public"."procedure_cases" USING "btree" ("surgeon_id", "procedure_id");



CREATE INDEX "idx_procedure_recovery_procedure" ON "public"."procedure_recovery" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_recovery_timeline_procedure" ON "public"."procedure_recovery_timeline" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_recovery_tips_procedure" ON "public"."procedure_recovery_tips" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_risks_procedure" ON "public"."procedure_risks" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_techniques_procedure" ON "public"."procedure_techniques" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedure_translations_language" ON "public"."procedure_translations" USING "btree" ("language_code");



CREATE INDEX "idx_procedure_translations_procedure" ON "public"."procedure_translations" USING "btree" ("procedure_id");



CREATE INDEX "idx_procedures_category" ON "public"."procedures" USING "btree" ("category");



CREATE INDEX "idx_procedures_slug" ON "public"."procedures" USING "btree" ("slug");



CREATE INDEX "idx_reviews_hospital" ON "public"."reviews" USING "btree" ("hospital_id");



CREATE INDEX "idx_reviews_language" ON "public"."reviews" USING "btree" ("language_code");



CREATE INDEX "idx_reviews_procedure" ON "public"."reviews" USING "btree" ("procedure_id");



CREATE INDEX "idx_reviews_rating" ON "public"."reviews" USING "btree" ("rating");



CREATE INDEX "idx_surgeons_hospital" ON "public"."surgeons" USING "btree" ("hospital_id");



CREATE INDEX "idx_surgeons_name" ON "public"."surgeons" USING "btree" ("name");



CREATE INDEX "idx_surgeons_specialties" ON "public"."surgeons" USING "gin" ("specialties");



CREATE INDEX "idx_surgeons_surgeon_id" ON "public"."surgeons" USING "btree" ("surgeon_id");



CREATE INDEX "idx_surgeons_translations" ON "public"."surgeons" USING "gin" ("translations");



CREATE INDEX "idx_video_testimonials_hospital" ON "public"."video_testimonials" USING "btree" ("hospital_id");



CREATE INDEX "idx_video_testimonials_procedure" ON "public"."video_testimonials" USING "btree" ("procedure_id");



CREATE OR REPLACE TRIGGER "case_media_updated_at" BEFORE UPDATE ON "public"."case_media" FOR EACH ROW EXECUTE FUNCTION "public"."update_case_media_updated_at"();



CREATE OR REPLACE TRIGGER "update_cases_updated_at" BEFORE UPDATE ON "public"."cases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hospital_location_updated_at" BEFORE UPDATE ON "public"."hospital_location" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hospital_translations_updated_at" BEFORE UPDATE ON "public"."hospital_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_hospitals_updated_at" BEFORE UPDATE ON "public"."hospitals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_procedure_cases_updated_at" BEFORE UPDATE ON "public"."procedure_cases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_procedure_translations_updated_at" BEFORE UPDATE ON "public"."procedure_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_procedures_updated_at" BEFORE UPDATE ON "public"."procedures" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_surgeons_updated_at" BEFORE UPDATE ON "public"."surgeons" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."case_media"
    ADD CONSTRAINT "case_media_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."procedure_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_photos"
    ADD CONSTRAINT "case_photos_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_procedures"
    ADD CONSTRAINT "case_procedures_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_procedures"
    ADD CONSTRAINT "case_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_translations"
    ADD CONSTRAINT "case_translations_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."complementary_procedures"
    ADD CONSTRAINT "complementary_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_location"
    ADD CONSTRAINT "hospital_location_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_nearby_attractions"
    ADD CONSTRAINT "hospital_nearby_attractions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_procedures"
    ADD CONSTRAINT "hospital_procedures_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_procedures"
    ADD CONSTRAINT "hospital_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_rating_breakdown"
    ADD CONSTRAINT "hospital_rating_breakdown_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hospital_translations"
    ADD CONSTRAINT "hospital_translations_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_benefits"
    ADD CONSTRAINT "procedure_benefits_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_candidacy"
    ADD CONSTRAINT "procedure_candidacy_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_cases"
    ADD CONSTRAINT "procedure_cases_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."procedure_cases"
    ADD CONSTRAINT "procedure_cases_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_cases"
    ADD CONSTRAINT "procedure_cases_surgeon_id_fkey" FOREIGN KEY ("surgeon_id") REFERENCES "public"."surgeons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."procedure_recovery"
    ADD CONSTRAINT "procedure_recovery_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_recovery_timeline"
    ADD CONSTRAINT "procedure_recovery_timeline_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_recovery_tips"
    ADD CONSTRAINT "procedure_recovery_tips_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_risks"
    ADD CONSTRAINT "procedure_risks_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_techniques"
    ADD CONSTRAINT "procedure_techniques_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."procedure_translations"
    ADD CONSTRAINT "procedure_translations_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."surgeons"
    ADD CONSTRAINT "surgeons_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."video_testimonials"
    ADD CONSTRAINT "video_testimonials_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "public"."hospitals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."video_testimonials"
    ADD CONSTRAINT "video_testimonials_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE SET NULL;



CREATE POLICY "Allow anon delete on hospital_location" ON "public"."hospital_location" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on hospital_procedures" ON "public"."hospital_procedures" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on hospital_translations" ON "public"."hospital_translations" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on hospitals" ON "public"."hospitals" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on procedure_cases" ON "public"."procedure_cases" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on reviews" ON "public"."reviews" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon delete on video_testimonials" ON "public"."video_testimonials" FOR DELETE TO "anon" USING (true);



CREATE POLICY "Allow anon insert on hospital_location" ON "public"."hospital_location" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on hospital_procedures" ON "public"."hospital_procedures" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on hospital_translations" ON "public"."hospital_translations" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on hospitals" ON "public"."hospitals" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on procedure_cases" ON "public"."procedure_cases" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on reviews" ON "public"."reviews" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon insert on video_testimonials" ON "public"."video_testimonials" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow anon update on hospital_location" ON "public"."hospital_location" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on hospital_procedures" ON "public"."hospital_procedures" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on hospital_translations" ON "public"."hospital_translations" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on hospitals" ON "public"."hospitals" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on procedure_cases" ON "public"."procedure_cases" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on reviews" ON "public"."reviews" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow anon update on video_testimonials" ON "public"."video_testimonials" FOR UPDATE TO "anon" USING (true);



CREATE POLICY "Allow authenticated delete" ON "public"."case_media" FOR DELETE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated delete on hospital_location" ON "public"."hospital_location" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on hospital_procedures" ON "public"."hospital_procedures" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on hospital_translations" ON "public"."hospital_translations" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on hospitals" ON "public"."hospitals" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on procedure_cases" ON "public"."procedure_cases" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on reviews" ON "public"."reviews" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated delete on video_testimonials" ON "public"."video_testimonials" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."case_media" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated insert on hospital_location" ON "public"."hospital_location" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on hospital_procedures" ON "public"."hospital_procedures" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on hospital_translations" ON "public"."hospital_translations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on hospitals" ON "public"."hospitals" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on procedure_cases" ON "public"."procedure_cases" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on reviews" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated insert on video_testimonials" ON "public"."video_testimonials" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated update" ON "public"."case_media" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated update on hospital_location" ON "public"."hospital_location" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on hospital_procedures" ON "public"."hospital_procedures" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on hospital_translations" ON "public"."hospital_translations" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on hospitals" ON "public"."hospitals" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on procedure_cases" ON "public"."procedure_cases" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on reviews" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated update on video_testimonials" ON "public"."video_testimonials" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow public read access" ON "public"."case_media" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on case_photos" ON "public"."case_photos" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on case_procedures" ON "public"."case_procedures" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on case_translations" ON "public"."case_translations" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on cases" ON "public"."cases" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on complementary_procedures" ON "public"."complementary_procedures" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospital_location" ON "public"."hospital_location" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospital_nearby_attractions" ON "public"."hospital_nearby_attractions" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospital_procedures" ON "public"."hospital_procedures" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospital_rating_breakdown" ON "public"."hospital_rating_breakdown" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospital_translations" ON "public"."hospital_translations" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on hospitals" ON "public"."hospitals" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_benefits" ON "public"."procedure_benefits" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_candidacy" ON "public"."procedure_candidacy" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_cases" ON "public"."procedure_cases" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_recovery" ON "public"."procedure_recovery" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_recovery_timeline" ON "public"."procedure_recovery_timeline" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_recovery_tips" ON "public"."procedure_recovery_tips" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_risks" ON "public"."procedure_risks" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_techniques" ON "public"."procedure_techniques" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedure_translations" ON "public"."procedure_translations" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on procedures" ON "public"."procedures" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on reviews" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Allow public read access on video_testimonials" ON "public"."video_testimonials" FOR SELECT USING (true);



ALTER TABLE "public"."case_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."complementary_procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospital_location" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospital_nearby_attractions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospital_procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospital_rating_breakdown" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospital_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hospitals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_benefits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_candidacy" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_recovery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_recovery_timeline" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_recovery_tips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_risks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_techniques" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedure_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."procedures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."video_testimonials" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_surgeon_id_by_name"("surgeon_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_surgeon_id_by_name"("surgeon_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_surgeon_id_by_name"("surgeon_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_case_media_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_case_media_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_case_media_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."case_media" TO "anon";
GRANT ALL ON TABLE "public"."case_media" TO "authenticated";
GRANT ALL ON TABLE "public"."case_media" TO "service_role";



GRANT ALL ON TABLE "public"."case_photos" TO "anon";
GRANT ALL ON TABLE "public"."case_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."case_photos" TO "service_role";



GRANT ALL ON TABLE "public"."case_procedures" TO "anon";
GRANT ALL ON TABLE "public"."case_procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."case_procedures" TO "service_role";



GRANT ALL ON TABLE "public"."case_translations" TO "anon";
GRANT ALL ON TABLE "public"."case_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."case_translations" TO "service_role";



GRANT ALL ON TABLE "public"."cases" TO "anon";
GRANT ALL ON TABLE "public"."cases" TO "authenticated";
GRANT ALL ON TABLE "public"."cases" TO "service_role";



GRANT ALL ON TABLE "public"."complementary_procedures" TO "anon";
GRANT ALL ON TABLE "public"."complementary_procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."complementary_procedures" TO "service_role";



GRANT ALL ON TABLE "public"."hospital_location" TO "anon";
GRANT ALL ON TABLE "public"."hospital_location" TO "authenticated";
GRANT ALL ON TABLE "public"."hospital_location" TO "service_role";



GRANT ALL ON TABLE "public"."hospital_nearby_attractions" TO "anon";
GRANT ALL ON TABLE "public"."hospital_nearby_attractions" TO "authenticated";
GRANT ALL ON TABLE "public"."hospital_nearby_attractions" TO "service_role";



GRANT ALL ON TABLE "public"."hospital_procedures" TO "anon";
GRANT ALL ON TABLE "public"."hospital_procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."hospital_procedures" TO "service_role";



GRANT ALL ON TABLE "public"."hospital_rating_breakdown" TO "anon";
GRANT ALL ON TABLE "public"."hospital_rating_breakdown" TO "authenticated";
GRANT ALL ON TABLE "public"."hospital_rating_breakdown" TO "service_role";



GRANT ALL ON TABLE "public"."hospital_translations" TO "anon";
GRANT ALL ON TABLE "public"."hospital_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."hospital_translations" TO "service_role";



GRANT ALL ON TABLE "public"."hospitals" TO "anon";
GRANT ALL ON TABLE "public"."hospitals" TO "authenticated";
GRANT ALL ON TABLE "public"."hospitals" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_benefits" TO "anon";
GRANT ALL ON TABLE "public"."procedure_benefits" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_benefits" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_candidacy" TO "anon";
GRANT ALL ON TABLE "public"."procedure_candidacy" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_candidacy" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_cases" TO "anon";
GRANT ALL ON TABLE "public"."procedure_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_cases" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_recovery" TO "anon";
GRANT ALL ON TABLE "public"."procedure_recovery" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_recovery" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_recovery_timeline" TO "anon";
GRANT ALL ON TABLE "public"."procedure_recovery_timeline" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_recovery_timeline" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_recovery_tips" TO "anon";
GRANT ALL ON TABLE "public"."procedure_recovery_tips" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_recovery_tips" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_risks" TO "anon";
GRANT ALL ON TABLE "public"."procedure_risks" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_risks" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_techniques" TO "anon";
GRANT ALL ON TABLE "public"."procedure_techniques" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_techniques" TO "service_role";



GRANT ALL ON TABLE "public"."procedure_translations" TO "anon";
GRANT ALL ON TABLE "public"."procedure_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."procedure_translations" TO "service_role";



GRANT ALL ON TABLE "public"."procedures" TO "anon";
GRANT ALL ON TABLE "public"."procedures" TO "authenticated";
GRANT ALL ON TABLE "public"."procedures" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."surgeons" TO "anon";
GRANT ALL ON TABLE "public"."surgeons" TO "authenticated";
GRANT ALL ON TABLE "public"."surgeons" TO "service_role";



GRANT ALL ON TABLE "public"."video_testimonials" TO "anon";
GRANT ALL ON TABLE "public"."video_testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."video_testimonials" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







