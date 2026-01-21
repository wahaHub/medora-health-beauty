#!/usr/bin/env python3
"""
Complete script to:
1. Add translations column to surgeons table (if not exists)
2. Update surgeons with translations from surgeons_translations.json

Usage:
    python setup_and_update_translations.py

Requirements:
    pip install supabase python-dotenv
"""

import json
import os
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase: pip install supabase")
    exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configuration
SCRIPT_DIR = Path(__file__).parent
TRANSLATIONS_FILE = SCRIPT_DIR / "surgeons_translations.json"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")


def main():
    """Main function."""
    # Check for required environment variables
    if not SUPABASE_URL:
        print("Error: SUPABASE_URL environment variable not set")
        return

    if not SUPABASE_KEY:
        print("Error: SUPABASE_SERVICE_KEY environment variable not set")
        return

    # Load translations file
    print(f"Loading translations from {TRANSLATIONS_FILE}...")
    if not TRANSLATIONS_FILE.exists():
        print(f"Error: Translations file not found at {TRANSLATIONS_FILE}")
        return

    with open(TRANSLATIONS_FILE, "r", encoding="utf-8") as f:
        translations = json.load(f)

    print(f"Found translations for {len(translations)} surgeons")

    # Initialize Supabase client
    print(f"\nConnecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # First, check if we can access the surgeons table
    print("\nChecking surgeons table...")
    try:
        result = supabase.table("surgeons").select("surgeon_id, name").limit(1).execute()
        if result.data:
            print(f"  ✅ Connected! Found surgeon: {result.data[0]['name']}")
        else:
            print("  ⚠️ No surgeons found in table")
    except Exception as e:
        print(f"  ❌ Error accessing surgeons table: {e}")
        return

    # Update each surgeon with their translations
    print("\n" + "="*50)
    print("Updating surgeons with translations...")
    print("="*50)

    success_count = 0
    error_count = 0
    not_found_count = 0

    for surgeon_id, lang_translations in translations.items():
        print(f"\n[{surgeon_id}]", end=" ")

        # Remove 'en' from translations (already in main columns)
        translations_without_en = {
            lang: data for lang, data in lang_translations.items() if lang != "en"
        }

        # Count languages
        lang_count = len(translations_without_en)

        try:
            # Update the surgeon record with translations
            result = supabase.table("surgeons").update({
                "translations": translations_without_en
            }).eq("surgeon_id", surgeon_id).execute()

            if result.data and len(result.data) > 0:
                print(f"✅ Updated ({lang_count} languages)")
                success_count += 1
            else:
                print(f"⚠️ Not found in database")
                not_found_count += 1

        except Exception as e:
            print(f"❌ Error: {e}")
            error_count += 1

    # Summary
    print(f"\n{'='*50}")
    print(f"UPDATE COMPLETE")
    print(f"{'='*50}")
    print(f"  ✅ Successfully updated: {success_count}")
    print(f"  ⚠️ Not found: {not_found_count}")
    print(f"  ❌ Errors: {error_count}")

    # Verify by fetching one surgeon with translations
    if success_count > 0:
        print(f"\n{'='*50}")
        print("VERIFICATION")
        print(f"{'='*50}")

        first_surgeon_id = list(translations.keys())[0]
        result = supabase.table("surgeons").select("surgeon_id, name, translations").eq("surgeon_id", first_surgeon_id).single().execute()

        if result.data:
            print(f"Surgeon: {result.data['name']}")
            trans = result.data.get('translations', {})

            if trans:
                print(f"Languages available: {list(trans.keys())}")

                # Show sample translation
                if 'zh' in trans:
                    zh = trans['zh']
                    print(f"\nChinese (zh) sample:")
                    print(f"  Title: {zh.get('title', 'N/A')}")
                    specs = zh.get('specialties', [])
                    if specs:
                        print(f"  Specialties: {', '.join(specs[:2])}...")
            else:
                print("⚠️ No translations found in response")
        else:
            print("Could not verify - surgeon not found")


if __name__ == "__main__":
    main()
