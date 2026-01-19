#!/usr/bin/env python3
"""
Upload generated surgeons to Supabase database
Reads surgeons_generated.json and inserts into Supabase tables
"""

import json
import os
from supabase import create_client, Client
from typing import Dict, Any, List

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for admin operations

def init_supabase() -> Client:
    """Initialize Supabase client"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")

    return create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_surgeon(supabase: Client, surgeon_data: Dict[str, Any]) -> bool:
    """
    Upload a single surgeon to Supabase (simplified single-table schema)
    Returns True if successful, False otherwise
    """
    try:
        # Prepare surgeon record with all data in JSONB fields
        surgeon_record = {
            'surgeon_id': surgeon_data['id'],
            'name': surgeon_data['name'],
            'title': surgeon_data['title'],
            'experience_years': surgeon_data['experience_years'],
            'image_url': surgeon_data.get('image_url'),  # May be None initially
            'image_prompt': surgeon_data['image_prompt'],
            'specialties': surgeon_data.get('specialties', []),
            'languages': surgeon_data.get('languages', []),
            'education': surgeon_data.get('education', []),
            'certifications': surgeon_data.get('certifications', []),
            'procedures_count': surgeon_data.get('procedures_count', {}),
            'bio': surgeon_data.get('bio', {})
        }

        # Insert into surgeons table
        result = supabase.table('surgeons').insert(surgeon_record).execute()
        surgeon_uuid = result.data[0]['id']

        print(f"  ✓ Inserted surgeon: {surgeon_data['name']} (UUID: {surgeon_uuid})")
        print(f"    - {len(surgeon_data.get('specialties', []))} specialties")
        print(f"    - {len(surgeon_data.get('languages', []))} languages")
        print(f"    - {len(surgeon_data.get('education', []))} education entries")
        print(f"    - {len(surgeon_data.get('certifications', []))} certifications")
        print(f"    - {len(surgeon_data.get('procedures_count', {}))} procedure types")
        print(f"    - Bio with {len(surgeon_data.get('bio', {}).get('achievements', []))} achievements")

        return True

    except Exception as e:
        print(f"  ✗ Error uploading {surgeon_data['name']}: {str(e)}")
        return False

def main():
    """Main upload function"""
    print("=" * 60)
    print("Uploading Surgeons to Supabase")
    print("=" * 60)

    # Read generated surgeons
    json_file = 'surgeons_generated.json'
    if not os.path.exists(json_file):
        print(f"✗ Error: {json_file} not found")
        print(f"  Please run generate_surgeons.py first")
        return

    with open(json_file, 'r', encoding='utf-8') as f:
        surgeons = json.load(f)

    print(f"\nFound {len(surgeons)} surgeons to upload\n")

    # Initialize Supabase
    try:
        supabase = init_supabase()
        print("✓ Connected to Supabase\n")
    except ValueError as e:
        print(f"✗ {str(e)}")
        return

    # Upload each surgeon
    success_count = 0
    for idx, surgeon in enumerate(surgeons, 1):
        print(f"Uploading surgeon {idx}/{len(surgeons)}...")
        if upload_surgeon(supabase, surgeon):
            success_count += 1
        print()

    # Summary
    print("=" * 60)
    print(f"Upload Complete: {success_count}/{len(surgeons)} surgeons uploaded successfully")
    if success_count < len(surgeons):
        print(f"⚠ Warning: {len(surgeons) - success_count} surgeons failed to upload")
    print("=" * 60)

if __name__ == '__main__':
    main()
