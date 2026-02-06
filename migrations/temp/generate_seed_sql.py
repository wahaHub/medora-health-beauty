#!/usr/bin/env python3
"""
Generate SQL INSERT statements from seed_data.json
Appends to 001_hospital_schema.sql
"""

import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "seed_data.json")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "002_hospital_seed.sql")


def escape_sql(value):
    """Escape single quotes for SQL strings."""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (list, dict)):
        return f"'{json.dumps(value, ensure_ascii=False).replace(chr(39), chr(39)+chr(39))}'"
    # String
    return f"'{str(value).replace(chr(39), chr(39)+chr(39))}'"


def generate_sql():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    lines = []
    lines.append("-- =====================================================")
    lines.append("-- Medora Health & Beauty - Hospital Seed Data")
    lines.append("-- Auto-generated from seed_data.json")
    lines.append("-- =====================================================")
    lines.append("")

    # 1. Insert hospitals
    lines.append("-- =====================================================")
    lines.append("-- 1. Hospitals")
    lines.append("-- =====================================================")
    for h in data["hospitals"]:
        lines.append(f"""
INSERT INTO hospitals (slug, name, year_established, rating, review_count, hero_image, total_patients, recommend_rate, photos, payment_methods, highlights, is_active, sort_order)
VALUES (
  {escape_sql(h['slug'])},
  {escape_sql(h['name'])},
  {escape_sql(h['year_established'])},
  {escape_sql(h['rating'])},
  {escape_sql(h['review_count'])},
  {escape_sql(h['hero_image'])},
  {escape_sql(h['total_patients'])},
  {escape_sql(h['recommend_rate'])},
  {escape_sql(h['photos'])}::jsonb,
  {escape_sql(h['payment_methods'])}::jsonb,
  {escape_sql(h['highlights'])}::jsonb,
  {escape_sql(h['is_active'])},
  {escape_sql(h['sort_order'])}
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  year_established = EXCLUDED.year_established,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  hero_image = EXCLUDED.hero_image,
  total_patients = EXCLUDED.total_patients,
  recommend_rate = EXCLUDED.recommend_rate,
  photos = EXCLUDED.photos,
  payment_methods = EXCLUDED.payment_methods,
  highlights = EXCLUDED.highlights,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
""")

    # 2. Insert hospital_translations
    lines.append("-- =====================================================")
    lines.append("-- 2. Hospital Translations")
    lines.append("-- =====================================================")
    for t in data["hospital_translations"]:
        lines.append(f"""
INSERT INTO hospital_translations (hospital_id, language_code, tagline, description, highlights)
SELECT h.id, {escape_sql(t['language_code'])}, {escape_sql(t['tagline'])}, {escape_sql(t['description'])}, {escape_sql(t['highlights'])}::jsonb
FROM hospitals h WHERE h.slug = {escape_sql(t['hospital_slug'])}
ON CONFLICT (hospital_id, language_code) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  updated_at = NOW();
""")

    # 3. Insert hospital_rating_breakdown
    lines.append("-- =====================================================")
    lines.append("-- 3. Hospital Rating Breakdown")
    lines.append("-- =====================================================")
    for r in data["hospital_rating_breakdown"]:
        lines.append(f"""
INSERT INTO hospital_rating_breakdown (hospital_id, language_code, label, score, sort_order)
SELECT h.id, {escape_sql(r['language_code'])}, {escape_sql(r['label'])}, {escape_sql(r['score'])}, {escape_sql(r['sort_order'])}
FROM hospitals h WHERE h.slug = {escape_sql(r['hospital_slug'])}
ON CONFLICT (hospital_id, language_code, label) DO UPDATE SET
  score = EXCLUDED.score,
  sort_order = EXCLUDED.sort_order;
""")

    # 4. Insert hospital_procedures (需要先确保 procedures 表有对应记录)
    lines.append("-- =====================================================")
    lines.append("-- 4. Hospital Procedures")
    lines.append("-- (Assumes procedures table already has matching procedure_name)")
    lines.append("-- =====================================================")
    for p in data["hospital_procedures"]:
        lines.append(f"""
INSERT INTO hospital_procedures (hospital_id, procedure_id, price_range, price_min, price_max, is_popular, sort_order)
SELECT h.id, p.id, {escape_sql(p['price_range'])}, {escape_sql(p['price_min'])}, {escape_sql(p['price_max'])}, {escape_sql(p['is_popular'])}, {escape_sql(p['sort_order'])}
FROM hospitals h, procedures p
WHERE h.slug = {escape_sql(p['hospital_slug'])} AND p.procedure_name = {escape_sql(p['procedure_name'])}
ON CONFLICT (hospital_id, procedure_id) DO UPDATE SET
  price_range = EXCLUDED.price_range,
  price_min = EXCLUDED.price_min,
  price_max = EXCLUDED.price_max,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;
""")

    # 5. Insert hospital_location
    lines.append("-- =====================================================")
    lines.append("-- 5. Hospital Location")
    lines.append("-- =====================================================")
    for loc in data["hospital_location"]:
        lines.append(f"""
INSERT INTO hospital_location (hospital_id, address, phone, email, website, hours, map_embed, latitude, longitude)
SELECT h.id, {escape_sql(loc['address'])}, {escape_sql(loc['phone'])}, {escape_sql(loc['email'])}, {escape_sql(loc['website'])}, {escape_sql(loc['hours'])}, {escape_sql(loc['map_embed'])}, {escape_sql(loc['latitude'])}, {escape_sql(loc['longitude'])}
FROM hospitals h WHERE h.slug = {escape_sql(loc['hospital_slug'])}
ON CONFLICT (hospital_id) DO UPDATE SET
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  hours = EXCLUDED.hours,
  map_embed = EXCLUDED.map_embed,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();
""")

    # 6. Insert hospital_nearby_attractions
    lines.append("-- =====================================================")
    lines.append("-- 6. Hospital Nearby Attractions")
    lines.append("-- =====================================================")
    lines.append("-- Clear existing and re-insert")
    lines.append("DELETE FROM hospital_nearby_attractions WHERE hospital_id IN (SELECT id FROM hospitals WHERE slug = 'bangkok-aesthetic-center');")
    for attr in data["hospital_nearby_attractions"]:
        lines.append(f"""
INSERT INTO hospital_nearby_attractions (hospital_id, language_code, name, distance, sort_order)
SELECT h.id, {escape_sql(attr['language_code'])}, {escape_sql(attr['name'])}, {escape_sql(attr['distance'])}, {escape_sql(attr['sort_order'])}
FROM hospitals h WHERE h.slug = {escape_sql(attr['hospital_slug'])};
""")

    # 7. Update surgeons with hospital_id
    lines.append("-- =====================================================")
    lines.append("-- 7. Surgeons (Update existing or insert new)")
    lines.append("-- =====================================================")
    for s in data["surgeons"]:
        lines.append(f"""
-- Surgeon: {s['name']}
INSERT INTO surgeons (surgeon_id, name, title, specialties, experience_years, images, hospital_id)
SELECT {escape_sql(s['surgeon_id'])}, {escape_sql(s['name'])}, {escape_sql(s['title'])}, {escape_sql(s['specialties'])}::jsonb, {escape_sql(s['experience_years'])}, {escape_sql(s['images'])}::jsonb, h.id
FROM hospitals h WHERE h.slug = {escape_sql(s['hospital_slug'])}
ON CONFLICT (surgeon_id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  specialties = EXCLUDED.specialties,
  experience_years = EXCLUDED.experience_years,
  images = EXCLUDED.images,
  hospital_id = EXCLUDED.hospital_id,
  updated_at = NOW();
""")

    # 8. Insert reviews
    lines.append("-- =====================================================")
    lines.append("-- 8. Reviews")
    lines.append("-- =====================================================")
    for rev in data["reviews"]:
        lines.append(f"""
INSERT INTO reviews (hospital_id, author_name, country, rating, review_date, procedure_id, language_code, review_text, is_verified)
SELECT h.id, {escape_sql(rev['author_name'])}, {escape_sql(rev['country'])}, {escape_sql(rev['rating'])}, {escape_sql(rev['review_date'])}::date, p.id, {escape_sql(rev['language_code'])}, {escape_sql(rev['review_text'])}, {escape_sql(rev['is_verified'])}
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = {escape_sql(rev['procedure_name'])}
WHERE h.slug = {escape_sql(rev['hospital_slug'])};
""")

    # 9. Insert video_testimonials
    lines.append("-- =====================================================")
    lines.append("-- 9. Video Testimonials")
    lines.append("-- =====================================================")
    for vid in data["video_testimonials"]:
        lines.append(f"""
INSERT INTO video_testimonials (hospital_id, language_code, title, video_url, thumbnail_url, duration, procedure_id, country, sort_order)
SELECT h.id, {escape_sql(vid['language_code'])}, {escape_sql(vid['title'])}, {escape_sql(vid['video_url'])}, {escape_sql(vid['thumbnail_url'])}, {escape_sql(vid['duration'])}, p.id, {escape_sql(vid['country'])}, {escape_sql(vid['sort_order'])}
FROM hospitals h
LEFT JOIN procedures p ON p.procedure_name = {escape_sql(vid['procedure_name'])}
WHERE h.slug = {escape_sql(vid['hospital_slug'])};
""")

    # 10. Insert procedure_cases
    lines.append("-- =====================================================")
    lines.append("-- 10. Procedure Cases (Before/After)")
    lines.append("-- =====================================================")
    for idx, case in enumerate(data["procedure_cases"], 1):
        lines.append(f"""
INSERT INTO procedure_cases (case_number, procedure_id, surgeon_id, hospital_id, patient_age, patient_gender, before_image, after_image)
SELECT 'BAC-{idx:04d}', p.id, s.surgeon_id, h.id, {escape_sql(case['patient_age'])}, {escape_sql(case['patient_gender'])}, {escape_sql(case['before_image'])}, {escape_sql(case['after_image'])}
FROM hospitals h
JOIN procedures p ON p.procedure_name = {escape_sql(case['procedure_name'])}
JOIN surgeons s ON s.surgeon_id = {escape_sql(case['surgeon_id'])}
WHERE h.slug = {escape_sql(case['hospital_slug'])};
""")

    # Write to file
    sql_content = "\n".join(lines)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(sql_content)

    print(f"Generated: {OUTPUT_FILE}")
    print(f"Total lines: {len(lines)}")


if __name__ == "__main__":
    generate_sql()
