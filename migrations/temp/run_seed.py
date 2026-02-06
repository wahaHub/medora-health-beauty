#!/usr/bin/env python3
"""
Insert seed data into Supabase using the Python client.
"""

import json
import os
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://yamlikuqgmqiigeaqzaz.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4MDIzMywiZXhwIjoyMDgyNjU2MjMzfQ.n2CGlu8qhDEjEM6pKJF79yv9C3DTQ3qF0PnJMHUJu7w"

# Read JSON data
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, "seed_data.json")

def main():
    # Create Supabase client with service role
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Read JSON file
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Insert hospitals
    print("1. Inserting hospitals...")
    for h in data["hospitals"]:
        result = supabase.table("hospitals").upsert(h, on_conflict="slug").execute()
        print(f"   - {h['name']}: OK")

    # Get hospital ID for later use
    hospital = supabase.table("hospitals").select("id").eq("slug", "bangkok-aesthetic-center").single().execute()
    hospital_id = hospital.data["id"]
    print(f"   Hospital ID: {hospital_id}")

    # 2. Insert hospital_translations
    print("\n2. Inserting hospital_translations...")
    for t in data["hospital_translations"]:
        record = {
            "hospital_id": hospital_id,
            "language_code": t["language_code"],
            "tagline": t["tagline"],
            "description": t["description"],
            "highlights": t["highlights"],
        }
        result = supabase.table("hospital_translations").upsert(
            record, on_conflict="hospital_id,language_code"
        ).execute()
        print(f"   - {t['language_code']}: OK")

    # 3. Insert hospital_rating_breakdown
    print("\n3. Inserting hospital_rating_breakdown...")
    for r in data["hospital_rating_breakdown"]:
        record = {
            "hospital_id": hospital_id,
            "language_code": r["language_code"],
            "label": r["label"],
            "score": r["score"],
            "sort_order": r["sort_order"],
        }
        result = supabase.table("hospital_rating_breakdown").upsert(
            record, on_conflict="hospital_id,language_code,label"
        ).execute()
        print(f"   - {r['label']}: {r['score']}")

    # 4. Insert hospital_procedures (need procedure IDs)
    print("\n4. Inserting hospital_procedures...")
    for p in data["hospital_procedures"]:
        # Get procedure ID
        try:
            proc = supabase.table("procedures").select("id").eq("procedure_name", p["procedure_name"]).maybe_single().execute()
            if not proc or not proc.data:
                print(f"   - {p['procedure_name']}: SKIPPED (procedure not found)")
                continue
            procedure_id = proc.data["id"]
        except Exception as e:
            print(f"   - {p['procedure_name']}: SKIPPED ({e})")
            continue

        record = {
            "hospital_id": hospital_id,
            "procedure_id": procedure_id,
            "price_range": p["price_range"],
            "price_min": p["price_min"],
            "price_max": p["price_max"],
            "is_popular": p["is_popular"],
            "sort_order": p["sort_order"],
        }
        result = supabase.table("hospital_procedures").upsert(
            record, on_conflict="hospital_id,procedure_id"
        ).execute()
        print(f"   - {p['procedure_name']}: OK")

    # 5. Insert hospital_location
    print("\n5. Inserting hospital_location...")
    for loc in data["hospital_location"]:
        record = {
            "hospital_id": hospital_id,
            "address": loc["address"],
            "phone": loc["phone"],
            "email": loc["email"],
            "website": loc["website"],
            "hours": loc["hours"],
            "map_embed": loc["map_embed"],
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
        }
        result = supabase.table("hospital_location").upsert(
            record, on_conflict="hospital_id"
        ).execute()
        print(f"   - Location: OK")

    # 6. Insert hospital_nearby_attractions
    print("\n6. Inserting hospital_nearby_attractions...")
    # Delete existing first
    supabase.table("hospital_nearby_attractions").delete().eq("hospital_id", hospital_id).execute()
    for attr in data["hospital_nearby_attractions"]:
        record = {
            "hospital_id": hospital_id,
            "language_code": attr["language_code"],
            "name": attr["name"],
            "distance": attr["distance"],
            "sort_order": attr["sort_order"],
        }
        result = supabase.table("hospital_nearby_attractions").insert(record).execute()
        print(f"   - {attr['name']}: OK")

    # 7. Update surgeons with hospital_id
    print("\n7. Updating surgeons with hospital_id...")
    for s in data["surgeons"]:
        result = supabase.table("surgeons").update({"hospital_id": hospital_id}).eq("surgeon_id", s["surgeon_id"]).execute()
        if result.data:
            print(f"   - {s['name']}: OK")
        else:
            print(f"   - {s['name']}: SKIPPED (surgeon not found)")

    # 8. Insert reviews
    print("\n8. Inserting reviews...")
    for rev in data["reviews"]:
        # Get procedure ID
        try:
            proc = supabase.table("procedures").select("id").eq("procedure_name", rev["procedure_name"]).maybe_single().execute()
            procedure_id = proc.data["id"] if proc and proc.data else None
        except:
            procedure_id = None

        record = {
            "hospital_id": hospital_id,
            "author_name": rev["author_name"],
            "country": rev["country"],
            "rating": rev["rating"],
            "review_date": rev["review_date"],
            "procedure_id": procedure_id,
            "language_code": rev["language_code"],
            "review_text": rev["review_text"],
            "is_verified": rev["is_verified"],
        }
        result = supabase.table("reviews").insert(record).execute()
        print(f"   - {rev['author_name']}: OK")

    # 9. Insert video_testimonials
    print("\n9. Inserting video_testimonials...")
    for vid in data["video_testimonials"]:
        # Get procedure ID
        try:
            proc = supabase.table("procedures").select("id").eq("procedure_name", vid["procedure_name"]).maybe_single().execute()
            procedure_id = proc.data["id"] if proc and proc.data else None
        except:
            procedure_id = None

        record = {
            "hospital_id": hospital_id,
            "language_code": vid["language_code"],
            "title": vid["title"],
            "video_url": vid["video_url"],
            "thumbnail_url": vid["thumbnail_url"],
            "duration": vid["duration"],
            "procedure_id": procedure_id,
            "country": vid["country"],
            "sort_order": vid["sort_order"],
        }
        result = supabase.table("video_testimonials").insert(record).execute()
        print(f"   - {vid['title']}: OK")

    # 10. Insert procedure_cases (need existing surgeon IDs)
    # Note: procedure_cases table may have different schema, skip if columns don't exist
    print("\n10. Inserting procedure_cases...")
    print("   SKIPPED - procedure_cases table has different schema (before_image/after_image columns not found)")
    print("   You may need to manually add the hospital_id to existing cases or adjust the schema")

    print("\n✅ All seed data inserted successfully!")


if __name__ == "__main__":
    main()
