#!/usr/bin/env python3
"""
Update surgeons table with translations from surgeons_translations.json.

This script reads the translations JSON file and updates the Supabase surgeons table
with the translations JSONB column.

Usage:
    python update_surgeons_translations.py

Requirements:
    pip install supabase python-dotenv

Environment variables:
    SUPABASE_URL: Your Supabase project URL
    SUPABASE_SERVICE_KEY: Your Supabase service role key (for write access)
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
    pass  # dotenv is optional

# Configuration
SCRIPT_DIR = Path(__file__).parent
TRANSLATIONS_FILE = SCRIPT_DIR / "surgeons_translations.json"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")


def main():
    """Main function to update surgeons with translations."""
    # Check for required environment variables
    if not SUPABASE_URL:
        print("Error: SUPABASE_URL environment variable not set")
        print("Please set it: export SUPABASE_URL='https://your-project.supabase.co'")
        return

    if not SUPABASE_KEY:
        print("Error: SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variable not set")
        print("Please set it: export SUPABASE_SERVICE_KEY='your-service-key'")
        return

    # Load translations file
    print(f"Loading translations from {TRANSLATIONS_FILE}...")
    if not TRANSLATIONS_FILE.exists():
        print(f"Error: Translations file not found at {TRANSLATIONS_FILE}")
        print("Please run translate_surgeons.py first to generate the translations.")
        return

    with open(TRANSLATIONS_FILE, "r", encoding="utf-8") as f:
        translations = json.load(f)

    print(f"Found translations for {len(translations)} surgeons")

    # Initialize Supabase client
    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Update each surgeon with their translations
    success_count = 0
    error_count = 0

    for surgeon_id, lang_translations in translations.items():
        print(f"\nUpdating {surgeon_id}...")

        # Remove 'en' from translations since it's the original data
        # (already stored in the main columns)
        translations_without_en = {
            lang: data for lang, data in lang_translations.items() if lang != "en"
        }

        try:
            # Update the surgeon record with translations
            result = supabase.table("surgeons").update({
                "translations": translations_without_en
            }).eq("surgeon_id", surgeon_id).execute()

            if result.data:
                print(f"  ✅ Updated successfully")
                success_count += 1
            else:
                print(f"  ⚠️ No matching record found for surgeon_id: {surgeon_id}")
                error_count += 1

        except Exception as e:
            print(f"  ❌ Error updating: {e}")
            error_count += 1

    # Summary
    print(f"\n{'='*50}")
    print(f"Update complete!")
    print(f"  ✅ Successfully updated: {success_count}")
    print(f"  ❌ Errors: {error_count}")
    print(f"{'='*50}")

    # Verify by fetching one surgeon
    if success_count > 0:
        print("\nVerifying update by fetching first surgeon...")
        first_surgeon_id = list(translations.keys())[0]
        result = supabase.table("surgeons").select("surgeon_id, name, translations").eq("surgeon_id", first_surgeon_id).single().execute()

        if result.data:
            print(f"Surgeon: {result.data['name']}")
            trans = result.data.get('translations', {})
            print(f"Languages in translations: {list(trans.keys())}")
            if 'zh' in trans:
                print(f"Chinese title: {trans['zh'].get('title', 'N/A')}")


if __name__ == "__main__":
    main()
