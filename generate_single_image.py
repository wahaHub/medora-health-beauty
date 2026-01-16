#!/usr/bin/env python3
"""生成单张图片"""
import os
import sys
import base64
import requests

API_ENDPOINT = "https://api.x.ai/v1/images/generations"
MODEL = "grok-2-image-1212"

def generate_image(api_key: str, prompt: str) -> bytes | None:
    """调用 Grok API 生成图片"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "n": 1
    }

    try:
        resp = requests.post(API_ENDPOINT, headers=headers, json=payload, timeout=120)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("data") and data["data"][0].get("b64_json"):
                return base64.b64decode(data["data"][0]["b64_json"])
            if data.get("data") and data["data"][0].get("url"):
                img_resp = requests.get(data["data"][0]["url"], timeout=60)
                if img_resp.status_code == 200:
                    return img_resp.content
        else:
            print(f"API Error: {resp.status_code} - {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")
    return None

def main():
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        print("❌ 请设置 XAI_API_KEY 环境变量")
        sys.exit(1)

    prompt = """A woman with a tightened, youthful neck after neck tightening. The image should show smooth, firm skin with reduced sagging, emphasizing the rejuvenated appearance and renewed confidence. 16:9 aspect ratio."""

    print(f"🎨 生成图片...")
    print(f"   Prompt: {prompt}")

    img_bytes = generate_image(api_key, prompt)

    if img_bytes:
        output_path = "/Users/haowang/Desktop/neck_tightening_result.jpg"
        with open(output_path, "wb") as f:
            f.write(img_bytes)
        print(f"✅ 图片已保存: {output_path}")
        print(f"   大小: {len(img_bytes) / 1024:.1f} KB")
    else:
        print("❌ 生成失败")
        sys.exit(1)

if __name__ == "__main__":
    main()
