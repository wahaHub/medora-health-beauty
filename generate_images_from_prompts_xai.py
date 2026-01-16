#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate facelift before/after comparison images (front view) and then edit each
result into a side-view comparison using the xAI Grok image API.

Workflow per sample:
1. Call the images/generations endpoint once with a simple facelift prompt
   (front-facing, entire face exposed, age 35-55).
2. Immediately call the images/edits endpoint to transform that output into a
   side-view comparison while keeping the same subject and results.
"""

import argparse
import base64
import io
import json
import os
import random
import sys
import time
from typing import Any, Dict, List, Optional

import requests
from PIL import Image

DEFAULT_GENERATE_ENDPOINT = "https://api.x.ai/v1/images/generations"
DEFAULT_EDIT_ENDPOINT = "https://api.x.ai/v1/images/edits"
DEFAULT_MODEL = "grok-2-image-1212"
DEFAULT_COUNT = 20
DEFAULT_OUTPUT_DIR = "generated_facelift_batches"

DEFAULT_BASE_PROMPT = (
    "a before and after comparison image of a facelift, entire face exposed, studio portrait lighting, "
    "age around {age}, front view, before on the left, after on the right, realistic skin texture, neutral gray background"
)

DEFAULT_EDIT_PROMPT = (
    "using the provided facelift comparison image as reference, render the same subject in a right-facing side profile "
    "before/after split, preserve surgical improvements, maintain age around {age}, realistic lighting and texture"
)


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def to_png_bytes(image_bytes: bytes) -> bytes:
    """Convert arbitrary image bytes to PNG for edit upload."""
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("RGBA")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        return buffer.getvalue()


class XAIImageClient:
    """Minimal client for xAI Grok image generation/editing."""

    def __init__(
        self,
        api_keys: List[str],
        model: str,
        generate_endpoints: List[str],
        edit_endpoints: List[str],
        timeout: float = 60.0,
    ):
        self.api_keys = [k.strip() for k in api_keys if k.strip()]
        if not self.api_keys:
            raise ValueError("No xAI API keys provided.")
        self.model = model
        self.generate_endpoints = generate_endpoints
        self.edit_endpoints = edit_endpoints
        self.timeout = timeout

    def _post_json(self, url: str, key: str, payload: Dict[str, Any]) -> requests.Response:
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        return requests.post(url, headers=headers, json=payload, timeout=self.timeout)

    @staticmethod
    def _decode_content(payload: Dict[str, Any]) -> Optional[bytes]:
        if isinstance(payload, dict) and isinstance(payload.get("data"), list) and payload["data"]:
            item = payload["data"][0]
            if "b64_json" in item:
                return base64.b64decode(item["b64_json"])
            if "url" in item:
                try:
                    resp = requests.get(item["url"], timeout=30)
                    if resp.status_code == 200:
                        return resp.content
                except Exception:
                    return None
        if isinstance(payload, dict) and isinstance(payload.get("image"), str):
            try:
                return base64.b64decode(payload["image"])
            except Exception:
                return None
        return None

    def generate(self, prompt: str, negative_prompt: Optional[str] = None) -> Optional[bytes]:
        body = {"model": self.model, "prompt": prompt, "n": 1}
        if negative_prompt:
            body["negative_prompt"] = negative_prompt

        last_err = None
        for url in self.generate_endpoints:
            for key in self.api_keys:
                try:
                    resp = self._post_json(url, key, body)
                    if resp.status_code == 200:
                        content = self._decode_content(resp.json())
                        if content:
                            return content
                    else:
                        last_err = (url, resp.status_code, resp.text)
                        if resp.status_code in (429, 500, 502, 503, 504):
                            time.sleep(1.0)
                            continue
                except Exception as exc:
                    last_err = (url, "exception", str(exc))
                    time.sleep(0.5)
                    continue
        if last_err:
            sys.stderr.write(f"[xAI] generate failed: {last_err}\n")
        return None

    def edit(self, base_image: bytes, prompt: str, negative_prompt: Optional[str] = None) -> Optional[bytes]:
        png_bytes = to_png_bytes(base_image)
        body = {
            "model": self.model,
            "prompt": prompt,
            "image": {
                "data": base64.b64encode(png_bytes).decode("utf-8"),
                "mime_type": "image/png",
            },
            "n": 1,
        }
        if negative_prompt:
            body["negative_prompt"] = negative_prompt

        last_err = None
        for url in self.edit_endpoints:
            for key in self.api_keys:
                try:
                    resp = self._post_json(url, key, body)
                    if resp.status_code == 200:
                        content = self._decode_content(resp.json())
                        if content:
                            return content
                    else:
                        last_err = (url, resp.status_code, resp.text)
                        if resp.status_code in (429, 500, 502, 503, 504):
                            time.sleep(1.0)
                            continue
                except Exception as exc:
                    last_err = (url, "exception", str(exc))
                    time.sleep(0.5)
                    continue
        if last_err:
            sys.stderr.write(f"[xAI] edit failed: {last_err}\n")
        return None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate 20 facelift front comparisons and side-view edits using xAI Grok."
    )
    parser.add_argument("--output-dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Folder to store results")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT, help="Number of facelift samples to create")
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL, help="xAI image model")
    parser.add_argument("--generate-endpoint", type=str, default=DEFAULT_GENERATE_ENDPOINT, help="images/generations endpoint")
    parser.add_argument("--edit-endpoint", type=str, default=DEFAULT_EDIT_ENDPOINT, help="images/edits endpoint")
    parser.add_argument("--base-prompt", type=str, default=DEFAULT_BASE_PROMPT, help="Prompt template for front images (use {age})")
    parser.add_argument("--edit-prompt", type=str, default=DEFAULT_EDIT_PROMPT, help="Prompt template for side edits (use {age})")
    parser.add_argument("--negative-prompt", type=str, default="", help="Optional negative prompt applied to both calls")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for age sampling")
    parser.add_argument("--delay", type=float, default=0.6, help="Delay (seconds) between API calls")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    api_keys_env = os.environ.get("XAI_API_KEYS", "")
    api_keys = [k.strip() for k in api_keys_env.split(",") if k.strip()]
    if not api_keys and os.environ.get("XAI_API_KEY"):
        api_keys = [os.environ.get("XAI_API_KEY")]
    if not api_keys:
        print("ERROR: Please set XAI_API_KEYS='key1,key2' (or XAI_API_KEY).", file=sys.stderr)
        sys.exit(1)

    rng = random.Random(args.seed)
    client = XAIImageClient(
        api_keys=api_keys,
        model=args.model,
        generate_endpoints=[args.generate_endpoint],
        edit_endpoints=[args.edit_endpoint],
    )

    ensure_dir(args.output_dir)
    samples: List[Dict[str, Any]] = []

    for idx in range(1, args.count + 1):
        sample_id = f"facelift_{idx:03d}"
        sample_dir = os.path.join(args.output_dir, sample_id)
        ensure_dir(sample_dir)

        age = rng.randint(35, 55)
        base_prompt = args.base_prompt.format(age=age)
        edit_prompt = args.edit_prompt.format(age=age)
        negative_prompt = args.negative_prompt.strip() or None

        print(f"[{idx}/{args.count}] Generating front comparison for {sample_id} (age {age})")
        front_bytes = client.generate(base_prompt, negative_prompt=negative_prompt)
        if not front_bytes:
            sys.stderr.write(f"[-] Failed front generation for {sample_id}\n")
            continue
        front_path = os.path.join(sample_dir, "front.jpg")
        with open(front_path, "wb") as f:
            f.write(front_bytes)

        time.sleep(args.delay)

        print(f"[{idx}/{args.count}] Editing side view for {sample_id}")
        side_bytes = client.edit(front_bytes, edit_prompt, negative_prompt=negative_prompt)
        if side_bytes:
            side_path = os.path.join(sample_dir, "side.jpg")
            with open(side_path, "wb") as f:
                f.write(side_bytes)
        else:
            sys.stderr.write(f"[!] Side edit failed for {sample_id}\n")
            side_path = ""

        samples.append(
            {
                "id": sample_id,
                "age": age,
                "base_prompt": base_prompt,
                "edit_prompt": edit_prompt,
                "negative_prompt": negative_prompt or "",
                "front_path": front_path,
                "side_path": side_path,
            }
        )

        time.sleep(args.delay)

    index_data = {
        "model": args.model,
        "generate_endpoint": args.generate_endpoint,
        "edit_endpoint": args.edit_endpoint,
        "count": len(samples),
        "requested_count": args.count,
        "generated_at": int(time.time()),
        "samples": samples,
    }
    index_path = os.path.join(args.output_dir, "index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

    print(f"Done. Created {len(samples)} samples. Index written to {index_path}")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate before/after images from pre-built prompts using xAI Grok image API.

This script:
  - Reads prompts from a file produced by generate_procedure_image_prompts.py
  - For each procedure, creates 25 diverse personas
  - For each persona, selects 4 angles and generates 'before' and 'after' images
  - Optionally composes side-by-side comparison images
  - Saves images into a structured directory layout with a metadata JSON

IMPORTANT:
  - This script assumes an xAI image generation endpoint compatible with an OpenAI-like schema.
  - Configure the endpoint/model via CLI. Defaults may need adjustment per latest xAI docs.
  - Network access and API availability are required at runtime.

Example:
  export XAI_API_KEYS="xai-KEY1,xai-KEY2"
  python generate_images_from_prompts_xai.py \
    --prompts-file /Users/haowang/Desktop/medical-china-comb/procedure_image_prompts_en.json \
    --output-dir /Users/haowang/Desktop/medical-china-comb/generated_images \
    --model grok-2-image-1212 \
    --endpoint https://api.x.ai/v1/images/generations \
    --personas 25 \
    --angles-per-persona 3 \
    --compose
"""
import argparse
import base64
import io
import json
import os
import random
import re
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import requests
from PIL import Image


def read_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\s-]+", "", value)
    value = re.sub(r"[\s_-]+", "-", value)
    value = re.sub(r"^-+|-+$", "", value)
    return value or "item"


def deduplicate_preserve_order(items: List[str]) -> List[str]:
    seen = set()
    result = []
    for x in items:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result


# ---------------- Persona generation (controlled diversity) ----------------

FITZPATRICK = ["I", "II", "III", "IV", "V", "VI"]
ETHNICITIES = [
    "East Asian", "South Asian", "Southeast Asian",
    "Black/African descent", "White/European", "Hispanic/Latino",
    "Middle Eastern/North African", "Native American", "Mixed ethnicity"
]
GENDERS = ["female", "male"]
HAIR_COLORS = ["black hair", "dark brown hair", "light brown hair", "blonde hair", "auburn hair"]

MANDATORY_PERSONA_TEMPLATES = [
    {
        "label": "white_female",
        "gender": "female",
        "ethnicity": "White/European",
        "fitzpatrick": "II",
        "hair": "soft blonde hair",
        "age_range": (32, 46),
    },
    {
        "label": "black_female",
        "gender": "female",
        "ethnicity": "Black/African descent",
        "fitzpatrick": "V",
        "hair": "natural coily black hair",
        "age_range": (34, 48),
    },
    {
        "label": "arab_female",
        "gender": "female",
        "ethnicity": "Middle Eastern/North African",
        "fitzpatrick": "IV",
        "hair": "chestnut brown hair",
        "age_range": (30, 44),
    },
    {
        "label": "asian_female",
        "gender": "female",
        "ethnicity": "East Asian",
        "fitzpatrick": "III",
        "hair": "sleek dark brown hair",
        "age_range": (30, 42),
    },
    {
        "label": "male_general",
        "gender": "male",
        "ethnicity": "White/European",
        "fitzpatrick": "III",
        "hair": "short dark brown hair",
        "age_range": (35, 52),
    },
]

FEMALE_ONLY_CATEGORIES = {"SENSITIVE_LABIA"}

ANGLE_TARGETS = [
    ("front", ["front", "frontal", "straight-on", "neutral"]),
    ("left", ["left profile", "left lateral", "left oblique", "left 3/4", "45° left"]),
    ("right", ["right profile", "right lateral", "right oblique", "right 3/4", "45° right"]),
]


def categorize_procedure(procedure: str) -> str:
    p = procedure.lower()
    if any(k in p for k in ["rhinoplasty", "revision rhinoplasty", "nose"]):
        return "RHINOPLASTY"
    if any(k in p for k in ["eyelid", "blepharoplasty"]):
        return "EYELIDS"
    if "brow" in p or "forehead" in p:
        return "BROW_FOREHEAD"
    if "otoplasty" in p or "ear" in p:
        return "EAR"
    if "hair" in p:
        return "HAIR"
    if "neck" in p:
        return "NECK"
    if any(k in p for k in ["facelift", "mid facelift", "mini facelift", "cheek augmentation", "chin augmentation", "fat transfer", "skin resurfacing"]):
        return "FACE_GENERAL"
    if "labiaplasty" in p:
        return "SENSITIVE_LABIA"
    if "nipple" in p:
        return "SENSITIVE_NIPPLE"
    if "gynecomastia" in p:
        return "MALE_CHEST"
    if any(k in p for k in ["breast augmentation", "breast lift", "breast reduction", "breast augmentation revision", "preservation breast augmentation"]):
        return "BREAST"
    if any(k in p for k in ["tummy tuck", "abdominoplasty"]):
        return "ABDOMEN"
    if any(k in p for k in ["arm lift"]):
        return "ARM"
    if any(k in p for k in ["thigh lift"]):
        return "THIGH"
    if any(k in p for k in ["lipo", "liposuction", "body contouring", "mommy makeover", "back lift"]):
        return "BODY_CONTOURING"
    if any(k in p for k in ["mohs", "scar reduction", "scar revision"]):
        return "SKIN_SCAR"
    if "weight loss injections" in p or "avéli" in p or "renuvion" in p:
        return "NON_SURGICAL_BODY"
    return "GENERAL"


def _instantiate_persona(template: Dict[str, Any], rng: random.Random) -> Dict[str, str]:
    age_min, age_max = template.get("age_range", (33, 49))
    return {
        "gender": template["gender"],
        "ethnicity": template["ethnicity"],
        "fitzpatrick": template.get("fitzpatrick") or rng.choice(FITZPATRICK),
        "hair": template.get("hair") or rng.choice(HAIR_COLORS),
        "age": str(rng.randint(age_min, age_max)),
        "label": template.get("label", "custom"),
    }


def persona_pool_for_category(category: str, desired_count: int) -> List[Dict[str, str]]:
    rng = random.Random(12345 + hash(category) % 1000000)
    personas: List[Dict[str, str]] = []
    female_only = category in FEMALE_ONLY_CATEGORIES

    for tpl in MANDATORY_PERSONA_TEMPLATES:
        if female_only and tpl["gender"] == "male":
            continue
        personas.append(_instantiate_persona(tpl, rng))
        if len(personas) >= desired_count:
            return personas[:desired_count]

    while len(personas) < desired_count:
        gender = rng.choice(GENDERS)
        if female_only:
            gender = "female"
        ethnicity = rng.choice(ETHNICITIES)
        fitz = rng.choice(FITZPATRICK)
        hair = rng.choice(HAIR_COLORS)
        age = rng.randint(32, 55)
        personas.append({
            "gender": gender,
            "ethnicity": ethnicity,
            "fitzpatrick": fitz,
            "hair": hair,
            "age": str(age),
            "label": "random",
        })
    return personas


def persona_prefix(persona: Dict[str, str], category: str, language: str) -> str:
    # Ensure safety language for sensitive categories
    imperfection_en = "include subtle real-life skin texture, faint asymmetry, pores, gentle imperfections; no airbrushed perfection."
    imperfection_zh = "呈现真实皮肤纹理与轻微不对称，保留毛孔与小瑕疵，避免过度光滑。"
    if language.lower().startswith("zh"):
        base = f"成人人像，{persona['age']}岁，{persona['gender']}，{persona['ethnicity']}，皮肤类型 Fitzpatrick {persona['fitzpatrick']}，{persona['hair']}，"
        safety = f"中性背景，柔和均匀光；统一主体、同机位同光线；仅外观对比；{imperfection_zh}"
        return base + safety
    else:
        base = f"Adult portrait, age {persona['age']}, {persona['gender']}, {persona['ethnicity']}, Fitzpatrick skin type {persona['fitzpatrick']}, {persona['hair']}, "
        safety = f"neutral background, soft even lighting; same subject/camera/light; appearance-only before/after; {imperfection_en} "
        if category == "SENSITIVE_LABIA":
            safety += "use mannequin/diagrammatic non-explicit representation with modesty coverage; "
        if category in ["BREAST", "SENSITIVE_NIPPLE"]:
            safety += "use modesty coverage or mannequin; no nipple exposure; "
        return base + safety


def merge_prompts(prefix: str, core_prompt: str) -> str:
    # Combine persona prefix with the core prompt, ensuring spacing and clarity
    if not core_prompt:
        return prefix.strip()
    if prefix.endswith(" "):
        return (prefix + core_prompt).strip()
    return (prefix + " " + core_prompt).strip()


def select_required_views(angle_entries: List[Dict[str, Any]], targets=ANGLE_TARGETS) -> List[Dict[str, Any]]:
    if not angle_entries:
        return []

    used_indices = set()
    selected: List[Dict[str, Any]] = []

    def normalize_entry(entry: Dict[str, Any], target_label: str) -> Dict[str, Any]:
        clone = dict(entry)
        clone["targetView"] = target_label
        return clone

    def match_keywords(keywords: List[str]) -> Optional[Tuple[int, Dict[str, Any]]]:
        for idx, entry in enumerate(angle_entries):
            if idx in used_indices:
                continue
            text = f"{entry.get('view', '')} {entry.get('region', '')}".lower()
            if any(keyword in text for keyword in keywords):
                return idx, entry
        return None

    for target_label, keywords in targets:
        match = match_keywords(keywords)
        if match:
            idx, entry = match
            used_indices.add(idx)
            selected.append(normalize_entry(entry, target_label))
            continue

        fallback_entry = None
        for idx, entry in enumerate(angle_entries):
            if idx not in used_indices:
                fallback_entry = (idx, entry)
                break
        if fallback_entry:
            idx, entry = fallback_entry
            used_indices.add(idx)
            selected.append(normalize_entry(entry, target_label))
        elif selected:
            selected.append(normalize_entry(selected[-1], target_label))

    return selected


# ---------------- xAI image generation ----------------

class XAIImageClient:
    def __init__(self, api_keys: List[str], endpoint_candidates: List[str], model: str, timeout: float = 60.0):
        self.api_keys = [k.strip() for k in api_keys if k.strip()]
        self.endpoint_candidates = endpoint_candidates
        self.model = model
        self.timeout = timeout
        if not self.api_keys:
            raise ValueError("No xAI API keys provided.")

    def _post(self, url: str, key: str, payload: Dict[str, Any]) -> requests.Response:
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        return requests.post(url, headers=headers, json=payload, timeout=self.timeout)

    def generate_one(self, prompt: str, negative_prompt: Optional[str], size: str = "1024x1024") -> Optional[bytes]:
        """
        Try endpoints and keys in order. Expect OpenAI-like image response:
          { "data": [ { "b64_json": "..."} ] } or { "data": [ { "url": "..."} ] }
        """
        base_payload = {
            "model": self.model,
            "prompt": prompt,
            "n": 1,
        }
        # First attempt includes negative_prompt if present; on 400 retry without it
        def build_payload(include_negative: bool) -> Dict[str, Any]:
            payload = dict(base_payload)
            if include_negative and negative_prompt:
                payload["negative_prompt"] = negative_prompt
            return payload

        last_err = None
        for url in self.endpoint_candidates:
            for key in self.api_keys:
                try:
                    # Try with negative prompt (if any)
                    resp = self._post(url, key, build_payload(include_negative=True))
                    if resp.status_code == 200:
                        data = resp.json()
                        item = None
                        if isinstance(data, dict) and isinstance(data.get("data"), list) and data["data"]:
                            item = data["data"][0]
                        if not item:
                            # Some APIs use a direct 'image' b64 or 'images' array; try to detect
                            if "image" in data and isinstance(data["image"], str):
                                try:
                                    return base64.b64decode(data["image"])
                                except Exception:
                                    pass
                            if "images" in data and isinstance(data["images"], list) and data["images"]:
                                item = data["images"][0]
                        if not item:
                            continue
                        if "b64_json" in item:
                            return base64.b64decode(item["b64_json"])
                        if "url" in item:
                            try:
                                r = requests.get(item["url"], timeout=self.timeout)
                                if r.status_code == 200:
                                    return r.content
                            except Exception:
                                continue
                    elif resp.status_code == 400 and negative_prompt:
                        # Retry once without negative_prompt (some providers don't support it)
                        resp2 = self._post(url, key, build_payload(include_negative=False))
                        if resp2.status_code == 200:
                            data = resp2.json()
                            item = None
                            if isinstance(data, dict) and isinstance(data.get("data"), list) and data["data"]:
                                item = data["data"][0]
                            if not item:
                                if "image" in data and isinstance(data["image"], str):
                                    try:
                                        return base64.b64decode(data["image"])
                                    except Exception:
                                        pass
                                if "images" in data and isinstance(data["images"], list) and data["images"]:
                                    item = data["images"][0]
                            if not item:
                                continue
                            if "b64_json" in item:
                                return base64.b64decode(item["b64_json"])
                            if "url" in item:
                                try:
                                    r = requests.get(item["url"], timeout=self.timeout)
                                    if r.status_code == 200:
                                        return r.content
                                except Exception:
                                    continue
                        else:
                            last_err = (url, resp2.status_code, resp2.text)
                    else:
                        last_err = (url, resp.status_code, resp.text)
                        # Rate limit or transient? backoff a bit
                        if resp.status_code in (429, 500, 502, 503, 504):
                            time.sleep(1.2)
                            continue
                except Exception as e:
                    last_err = (url, "exception", str(e))
                    time.sleep(0.5)
                    continue
        # Failed
        if last_err:
            sys.stderr.write(f"[xAI] Generation failed: {last_err}\n")
        return None


def save_image_bytes(path: str, content: bytes) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(content)


def compose_side_by_side(before_bytes: bytes, after_bytes: bytes, background_color=(245, 245, 245)) -> bytes:
    img_before = Image.open(io.BytesIO(before_bytes)).convert("RGB")
    img_after = Image.open(io.BytesIO(after_bytes)).convert("RGB")
    # Resize to same height
    h = min(img_before.height, img_after.height)
    def resize_by_height(img: Image.Image, target_h: int) -> Image.Image:
        w = int(img.width * (target_h / img.height))
        return img.resize((w, target_h), Image.LANCZOS)
    b = resize_by_height(img_before, h)
    a = resize_by_height(img_after, h)
    gap = 12
    w_total = b.width + gap + a.width
    out = Image.new("RGB", (w_total, h), background_color)
    out.paste(b, (0, 0))
    out.paste(a, (b.width + gap, 0))
    buf = io.BytesIO()
    out.save(buf, format="JPEG", quality=92)
    return buf.getvalue()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Use xAI Grok image API to generate before/after images from prompts.")
    parser.add_argument("--prompts-file", type=str, required=True, help="Path to JSON produced by generate_procedure_image_prompts.py")
    parser.add_argument("--output-dir", type=str, required=True, help="Directory to save generated images and metadata")
    parser.add_argument("--personas", type=int, default=25, help="Number of personas per procedure")
    parser.add_argument("--angles-per-persona", type=int, default=3, help="Angles per persona (default fixed to front/left/right)")
    parser.add_argument("--size", type=str, default="1024x1024", help="Image size hint (kept for metadata)")
    parser.add_argument("--compose", action="store_true", help="Create side-by-side comparison images")
    parser.add_argument("--endpoint", type=str, default="", help="xAI images endpoint (default tries known candidates)")
    parser.add_argument("--model", type=str, default="grok-2-image-1212", help="xAI image model name")
    parser.add_argument("--language", type=str, default="", help="Override language ('en' or 'zh'); defaults to prompts file language")
    parser.add_argument("--delay", type=float, default=0.7, help="Delay between generations to reduce rate-limits")
    parser.add_argument("--max-procedures", type=int, default=0, help="For testing: limit number of procedures (0 = all)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    # API keys
    api_keys_env = os.environ.get("XAI_API_KEYS", "")
    api_keys = [k.strip() for k in api_keys_env.split(",") if k.strip()]
    # Fallback to explicit variables if provided (not recommended to hardcode)
    if not api_keys and os.environ.get("XAI_API_KEY"):
        api_keys = [os.environ.get("XAI_API_KEY")]
    if not api_keys:
        print("ERROR: Provide xAI keys via env XAI_API_KEYS='key1,key2' (or XAI_API_KEY).", file=sys.stderr)
        sys.exit(1)

    prompts_doc = read_json(args.prompts_file)
    items = []
    language = args.language.strip().lower()
    if isinstance(prompts_doc, dict):
        # Try v1 schema
        language = language or str(prompts_doc.get("language", "")).lower()
        if isinstance(prompts_doc.get("items"), list):
            items = prompts_doc["items"]
        elif isinstance(prompts_doc.get("procedures"), list):
            items = prompts_doc["procedures"]
    elif isinstance(prompts_doc, list):
        items = prompts_doc
    if not items:
        print("ERROR: No items found in prompts file.", file=sys.stderr)
        sys.exit(1)
    if language not in ("en", "zh"):
        language = "en"

    # Endpoint candidates
    endpoint_candidates = []
    if args.endpoint.strip():
        # Respect user-specified endpoint ONLY
        endpoint_candidates = [args.endpoint.strip()]
    else:
        # Known/common possibilities; actual may vary by xAI updates
        endpoint_candidates.extend([
            "https://api.x.ai/v1/images/generations",
            "https://api.x.ai/v1/images/generate",
            "https://api.x.ai/v1/images",
        ])
    endpoint_candidates = deduplicate_preserve_order(endpoint_candidates)

    client = XAIImageClient(api_keys=api_keys, endpoint_candidates=endpoint_candidates, model=args.model)

    os.makedirs(args.output_dir, exist_ok=True)
    overall_meta: Dict[str, Any] = {
        "provider": "xai",
        "model": args.model,
        "endpoint_candidates": endpoint_candidates,
        "language": language,
        "personas_per_procedure": args.personas,
        "angles_per_persona": args.angles_per_persona,
        "size": args.size,
        "compose": bool(args.compose),
        "generated_at": int(time.time()),
        "required_views": [label for label, _ in ANGLE_TARGETS],
        "procedures": [],
    }

    procedure_count = 0
    for proc_item in items:
        name = proc_item.get("procedureName") or proc_item.get("name") or "Unknown Procedure"
        angles = proc_item.get("angles") or []
        if not angles:
            continue
        category = categorize_procedure(name)
        proc_slug = slugify(name)
        proc_dir = os.path.join(args.output_dir, proc_slug)
        os.makedirs(proc_dir, exist_ok=True)

        selected_angles = select_required_views(angles, ANGLE_TARGETS)
        personas = persona_pool_for_category(category, args.personas)

        proc_meta = {
            "procedureName": name,
            "slug": proc_slug,
            "category": category,
            "personas": [],
        }
        print(f"[+] Procedure: {name} | category={category} | angles={len(selected_angles)} | personas={len(personas)}")

        for persona_idx, persona in enumerate(personas, start=1):
            persona_id = f"persona-{persona_idx:02d}"
            persona_dir = os.path.join(proc_dir, persona_id)
            os.makedirs(persona_dir, exist_ok=True)
            prefix = persona_prefix(persona, category, language)

            persona_meta = {
                "id": persona_id,
                "attributes": persona,
                "angles": [],
            }

            for angle_idx, angle_entry in enumerate(selected_angles, start=1):
                view = angle_entry.get("view", "view")
                region = angle_entry.get("region", "region")
                target_view = angle_entry.get("targetView", view)
                prompts_list = angle_entry.get("prompts", [])
                # Choose variant cyclically to maintain diversity
                variant = prompts_list[(persona_idx + angle_idx) % max(1, len(prompts_list))] if prompts_list else {}
                before_core = variant.get("beforePrompt") or ""
                after_core = variant.get("afterPrompt") or ""
                negative = variant.get("negativePrompt") or ""
                # Merge with persona prefix
                before_prompt = merge_prompts(prefix, before_core)
                after_prompt = merge_prompts(prefix, after_core)

                angle_slug = slugify(f"{view}-{region}")
                angle_dir = os.path.join(persona_dir, f"angle-{angle_idx:02d}-{angle_slug}")
                os.makedirs(angle_dir, exist_ok=True)

                # Generate BEFORE
                before_bytes = client.generate_one(prompt=before_prompt, negative_prompt=negative, size=args.size)
                if not before_bytes:
                    sys.stderr.write(f"[-] Failed BEFORE: {name} | {persona_id} | {view}\n")
                    continue
                before_path = os.path.join(angle_dir, "before.jpg")
                save_image_bytes(before_path, before_bytes)
                time.sleep(args.delay)

                # Generate AFTER
                after_bytes = client.generate_one(prompt=after_prompt, negative_prompt=negative, size=args.size)
                if not after_bytes:
                    sys.stderr.write(f"[-] Failed AFTER: {name} | {persona_id} | {view}\n")
                    continue
                after_path = os.path.join(angle_dir, "after.jpg")
                save_image_bytes(after_path, after_bytes)

                comparison_path = ""
                if args.compose:
                    try:
                        comp_bytes = compose_side_by_side(before_bytes, after_bytes)
                        comparison_path = os.path.join(angle_dir, "comparison.jpg")
                        save_image_bytes(comparison_path, comp_bytes)
                    except Exception as e:
                        sys.stderr.write(f"[!] Compose failed ({name} | {persona_id} | {view}): {e}\n")

                persona_meta["angles"].append({
                    "index": angle_idx,
                    "view": view,
                    "region": region,
                    "target_view": target_view,
                    "before_prompt": before_prompt,
                    "after_prompt": after_prompt,
                    "negative_prompt": negative,
                    "before_path": before_path,
                    "after_path": after_path,
                    "comparison_path": comparison_path,
                })
                time.sleep(args.delay)

            # Save persona metadata
            write_json(os.path.join(persona_dir, "meta.json"), persona_meta)
            proc_meta["personas"].append(persona_meta)

        # Save procedure metadata
        write_json(os.path.join(proc_dir, "meta.json"), proc_meta)
        overall_meta["procedures"].append(proc_meta)
        procedure_count += 1
        if args.max_procedures and procedure_count >= args.max_procedures:
            break

    # Save overall metadata
    write_json(os.path.join(args.output_dir, "index.json"), overall_meta)
    print(f"Done. Procedures processed: {procedure_count}. Output at: {args.output_dir}")


if __name__ == "__main__":
    main()


