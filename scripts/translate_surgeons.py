#!/usr/bin/env python3
"""
Translate surgeons_generated.json to multiple languages using OpenAI GPT API.

Supported languages:
- en: English (original, no translation needed)
- zh: Chinese (Simplified)
- es: Spanish
- fr: French
- de: German
- ru: Russian
- ar: Arabic
- vi: Vietnamese
- id: Indonesian

Usage:
    python translate_surgeons.py

Requirements:
    pip install openai python-dotenv

Environment variables:
    OPENAI_API_KEY: Your OpenAI API key
"""

import json
import os
import time
from pathlib import Path
from typing import Any

try:
    from openai import OpenAI
except ImportError:
    print("Please install openai: pip install openai")
    exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional

# Configuration
SCRIPT_DIR = Path(__file__).parent
INPUT_FILE = SCRIPT_DIR / "surgeons_generated.json"
OUTPUT_FILE = SCRIPT_DIR / "surgeons_translations.json"

# Language configurations
LANGUAGES = {
    "en": {"name": "English", "skip": True},  # Original language, no translation
    "zh": {"name": "Chinese (Simplified)", "skip": False},
    "es": {"name": "Spanish", "skip": False},
    "fr": {"name": "French", "skip": False},
    "de": {"name": "German", "skip": False},
    "ru": {"name": "Russian", "skip": False},
    "ar": {"name": "Arabic", "skip": False},
    "vi": {"name": "Vietnamese", "skip": False},
    "id": {"name": "Indonesian", "skip": False},
}

# Fields that need translation
TRANSLATABLE_FIELDS = [
    "title",
    "specialties",
    "languages",
    "education",
    "certifications",
    "bio.intro",
    "bio.expertise",
    "bio.philosophy",
    "bio.achievements",
]

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def translate_text(text: str, target_language: str, context: str = "") -> str:
    """Translate text to the target language using GPT-4."""
    if not text or not text.strip():
        return text

    system_prompt = f"""You are a professional medical translator specializing in plastic surgery and aesthetic medicine.
Translate the following text to {target_language}.

Guidelines:
- Maintain medical terminology accuracy
- Keep proper nouns (names of hospitals, universities, organizations) in their original form or use the commonly accepted translation
- Preserve professional tone and formality
- For certifications and board names, keep the English abbreviation in parentheses if appropriate
- Ensure the translation sounds natural to native speakers
- Do not add any explanations or notes, just provide the translation

{f'Context: {context}' if context else ''}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective for translation
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text}
            ],
            temperature=0.3,  # Lower temperature for more consistent translations
            max_tokens=2000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error translating text: {e}")
        return text


def translate_list(items: list, target_language: str, context: str = "") -> list:
    """Translate a list of items."""
    if not items:
        return items

    # Join items for batch translation
    joined_text = "\n---ITEM_SEPARATOR---\n".join(items)

    system_prompt = f"""You are a professional medical translator specializing in plastic surgery and aesthetic medicine.
Translate each item to {target_language}. Items are separated by "---ITEM_SEPARATOR---".
Return the translations in the same format, separated by "---ITEM_SEPARATOR---".

Guidelines:
- Maintain medical terminology accuracy
- Keep proper nouns (names of hospitals, universities, organizations) in their original form or use the commonly accepted translation
- Preserve professional tone
- For certifications and board names, keep the English abbreviation in parentheses
- Return ONLY the translations separated by ---ITEM_SEPARATOR---, nothing else

{f'Context: {context}' if context else ''}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": joined_text}
            ],
            temperature=0.3,
            max_tokens=3000,
        )
        translated_text = response.choices[0].message.content.strip()
        translated_items = [item.strip() for item in translated_text.split("---ITEM_SEPARATOR---")]

        # Ensure we have the same number of items
        if len(translated_items) != len(items):
            print(f"Warning: Translation returned {len(translated_items)} items, expected {len(items)}")
            # Fallback to individual translation
            return [translate_text(item, target_language, context) for item in items]

        return translated_items
    except Exception as e:
        print(f"Error translating list: {e}")
        return items


def translate_surgeon(surgeon: dict, target_lang_code: str, target_lang_name: str) -> dict:
    """Translate a single surgeon's data to the target language."""
    translated = {}

    # Translate title
    print(f"    Translating title...")
    translated["title"] = translate_text(
        surgeon.get("title", ""),
        target_lang_name,
        "This is a medical professional's job title"
    )

    # Translate specialties
    print(f"    Translating specialties...")
    translated["specialties"] = translate_list(
        surgeon.get("specialties", []),
        target_lang_name,
        "These are medical/surgical specialties"
    )

    # Translate languages spoken
    print(f"    Translating languages...")
    translated["languages"] = translate_list(
        surgeon.get("languages", []),
        target_lang_name,
        "These are languages the doctor speaks"
    )

    # Translate education
    print(f"    Translating education...")
    translated["education"] = translate_list(
        surgeon.get("education", []),
        target_lang_name,
        "These are educational credentials (MD degrees, residencies, fellowships)"
    )

    # Translate certifications
    print(f"    Translating certifications...")
    translated["certifications"] = translate_list(
        surgeon.get("certifications", []),
        target_lang_name,
        "These are medical board certifications and professional memberships"
    )

    # Translate bio sections
    bio = surgeon.get("bio", {})
    translated_bio = {}

    print(f"    Translating bio.intro...")
    translated_bio["intro"] = translate_text(
        bio.get("intro", ""),
        target_lang_name,
        "This is the introductory paragraph of a surgeon's biography"
    )

    print(f"    Translating bio.expertise...")
    translated_bio["expertise"] = translate_text(
        bio.get("expertise", ""),
        target_lang_name,
        "This describes the surgeon's areas of expertise and techniques"
    )

    print(f"    Translating bio.philosophy...")
    translated_bio["philosophy"] = translate_text(
        bio.get("philosophy", ""),
        target_lang_name,
        "This describes the surgeon's treatment philosophy and approach to patient care"
    )

    print(f"    Translating bio.achievements...")
    translated_bio["achievements"] = translate_list(
        bio.get("achievements", []),
        target_lang_name,
        "These are professional achievements and accomplishments"
    )

    translated["bio"] = translated_bio

    return translated


def main():
    """Main function to translate all surgeons."""
    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Please set it: export OPENAI_API_KEY='your-api-key'")
        return

    # Load input file
    print(f"Loading surgeons from {INPUT_FILE}...")
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        surgeons = json.load(f)

    print(f"Found {len(surgeons)} surgeons to translate")

    # Initialize output structure
    # Structure: { "surgeon-id": { "en": {...}, "zh": {...}, ... } }
    translations = {}

    # Load existing translations if available (to resume)
    if OUTPUT_FILE.exists():
        print(f"Loading existing translations from {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            translations = json.load(f)

    # Process each surgeon
    for i, surgeon in enumerate(surgeons):
        surgeon_id = surgeon.get("id", f"surgeon-{i}")
        surgeon_name = surgeon.get("name", "Unknown")

        print(f"\n[{i+1}/{len(surgeons)}] Processing {surgeon_name} ({surgeon_id})...")

        if surgeon_id not in translations:
            translations[surgeon_id] = {}

        # Store original English data
        translations[surgeon_id]["en"] = {
            "title": surgeon.get("title", ""),
            "specialties": surgeon.get("specialties", []),
            "languages": surgeon.get("languages", []),
            "education": surgeon.get("education", []),
            "certifications": surgeon.get("certifications", []),
            "bio": surgeon.get("bio", {}),
        }

        # Translate to each target language
        for lang_code, lang_config in LANGUAGES.items():
            if lang_config["skip"]:
                continue

            # Skip if already translated
            if lang_code in translations[surgeon_id] and translations[surgeon_id][lang_code].get("bio", {}).get("intro"):
                print(f"  [{lang_code}] Already translated, skipping...")
                continue

            print(f"  [{lang_code}] Translating to {lang_config['name']}...")

            try:
                translated_data = translate_surgeon(surgeon, lang_code, lang_config["name"])
                translations[surgeon_id][lang_code] = translated_data

                # Save after each translation to avoid losing progress
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(translations, f, ensure_ascii=False, indent=2)

                # Rate limiting
                time.sleep(1)

            except Exception as e:
                print(f"  Error translating to {lang_code}: {e}")
                continue

    print(f"\n✅ Translation complete! Output saved to {OUTPUT_FILE}")
    print(f"Total surgeons translated: {len(translations)}")

    # Print summary
    print("\nTranslation summary:")
    for surgeon_id, langs in translations.items():
        print(f"  {surgeon_id}: {list(langs.keys())}")


if __name__ == "__main__":
    main()
