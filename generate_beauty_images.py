#!/usr/bin/env python3
"""
简化版：使用 Grok AI 批量生成 16:9 整容前后对比图
每个手术生成 10 个不同的 cases
"""
import os
import sys
import json
import time
import base64
import requests
from typing import Optional

# Grok API 配置
API_ENDPOINT = "https://api.x.ai/v1/images/generations"
MODEL = "grok-2-image-1212"
CASES_PER_PROCEDURE = 10  # 每个手术生成 10 个 cases

# 官网所有手术列表
PROCEDURES = [
    # Face - Eye & Nose
    "Eyelid Surgery",
    "Rhinoplasty",
    "Revision Rhinoplasty",
    "Nose Tip Refinement",

    # Face - Facelift
    "Facelift",
    "Mini Facelift",
    "Midface Lift",
    "Neck Lift",
    "Deep Neck Contouring",
    "Brow Lift",
    "Temples Lift",
    "Forehead Reduction Surgery",

    # Face - Contouring
    "Cheek Augmentation",
    "Chin Augmentation",
    "Jawline Contouring",
    "Zygomatic Arch Contouring",
    "Otoplasty",
    "Buccal Fat Removal",

    # Face - Skin & Injectables
    "Renuvion Skin Tightening",
    "Laser Liposuction",
    "Skin Resurfacing",
    "Fat Transfer",
    "Lip Filler",
    "Lip Lift",

    # Neck
    "Neck Liposuction",
    "Neck Tightening",
    "Platysmaplasty",
    "Cervicoplasty",

    # Hair
    "Hair Restoration",

    # Body - Core
    "Liposuction",
    "Tummy Tuck",
    "Mommy Makeover",
    "Scar Reduction",

    # Body - Arms/Legs
    "Arm Lift",
    "Thigh Lift",
    "Bra Line Back Lift",

    # Body - After Weight Loss
    "Body Contouring After Weight Loss",
    "Lower Body Lift",
    "Upper Body Lift",
    "Panniculectomy",

    # Breast
    "Breast Augmentation",
    "Breast Lift",
    "Breast Reduction",
    "Gynecomastia Surgery",

    # Buttocks
    "Brazilian Butt Lift",
    "Buttock Lift",

    # Intimate
    "Labiaplasty"
]


def generate_image(api_key: str, prompt: str, max_retries: int = 3, timeout: float = 120.0) -> Optional[bytes]:
    """调用 Grok API 生成图片，支持重试 - 参考旧脚本的成功实现"""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # 不强制 response_format，让 API 自己决定
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "n": 1
    }

    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait_time = 2 * (attempt + 1)
                print(f"      🔄 重试 {attempt + 1}/{max_retries}，等待 {wait_time}s...")
                time.sleep(wait_time)

            resp = requests.post(API_ENDPOINT, headers=headers, json=payload, timeout=timeout)

            if resp.status_code == 200:
                data = resp.json()

                # 处理标准格式
                if isinstance(data, dict) and isinstance(data.get("data"), list) and data["data"]:
                    item = data["data"][0]

                    # 优先 b64_json
                    if "b64_json" in item:
                        return base64.b64decode(item["b64_json"])

                    # URL 下载（带重试）
                    if "url" in item:
                        for url_retry in range(3):
                            try:
                                if url_retry > 0:
                                    time.sleep(2)
                                img_resp = requests.get(item["url"], timeout=60)
                                if img_resp.status_code == 200:
                                    return img_resp.content
                            except Exception:
                                if url_retry == 2:
                                    continue
                                time.sleep(1)
                                continue

                # 处理直接返回 image 字段的格式
                if isinstance(data, dict) and isinstance(data.get("image"), str):
                    try:
                        return base64.b64decode(data["image"])
                    except Exception:
                        pass

            elif resp.status_code == 429:
                print(f"      ⚠️  Rate limit，等待 10s...")
                time.sleep(10)
                continue

            elif resp.status_code in (500, 502, 503, 504):
                print(f"      ⚠️  服务器错误 ({resp.status_code})...")
                time.sleep(3)
                continue

            else:
                print(f"      ❌ API Error: {resp.status_code}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                return None

        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                time.sleep(3)
                continue

        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                time.sleep(3)
                continue

        except Exception as e:
            print(f"      ⚠️  异常: {str(e)[:100]}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue

    print(f"      ❌ 所有重试失败")
    return None


def create_prompt(procedure: str, case_num: int) -> str:
    """超简单 prompt - 中文"""
    return f"{procedure} 手术的前后对比图，16:9"


def main():
    # 检查 API Key
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        print("❌ 错误: 请设置环境变量 XAI_API_KEY")
        print("   export XAI_API_KEY='your-key-here'")
        sys.exit(1)

    # 创建输出目录
    output_dir = "generated_beauty_images"
    os.makedirs(output_dir, exist_ok=True)

    total_images = len(PROCEDURES) * CASES_PER_PROCEDURE
    print(f"🚀 开始生成图片...")
    print(f"   手术数量: {len(PROCEDURES)}")
    print(f"   每个手术: {CASES_PER_PROCEDURE} cases")
    print(f"   总计: {total_images} 张图片")
    print(f"📁 输出目录: {output_dir}/")
    print("=" * 70)

    results = []
    success_count = 0
    failed_count = 0

    for proc_idx, procedure in enumerate(PROCEDURES, 1):
        print(f"\n{'='*70}")
        print(f"[{proc_idx}/{len(PROCEDURES)}] 手术: {procedure}")
        print(f"{'='*70}")

        # 为该手术创建子目录
        proc_slug = procedure.lower().replace(' ', '_').replace('/', '_')
        proc_dir = os.path.join(output_dir, f"{proc_idx:02d}_{proc_slug}")
        os.makedirs(proc_dir, exist_ok=True)

        proc_results = []

        # 生成 10 个 cases
        for case_num in range(1, CASES_PER_PROCEDURE + 1):
            print(f"\n   Case {case_num}/{CASES_PER_PROCEDURE}:")

            # 生成 prompt
            prompt = create_prompt(procedure, case_num)
            print(f"      📝 Prompt: {prompt}")

            # 调用 API
            image_bytes = generate_image(api_key, prompt)

            if image_bytes:
                # 保存图片
                filename = f"case_{case_num:02d}.jpg"
                filepath = os.path.join(proc_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(image_bytes)

                print(f"      ✅ 已保存: {filename} ({len(image_bytes)} bytes)")

                proc_results.append({
                    "case": case_num,
                    "filename": filename,
                    "filepath": filepath,
                    "prompt": prompt,
                    "status": "success"
                })
                success_count += 1
            else:
                print(f"      ❌ 失败")
                proc_results.append({
                    "case": case_num,
                    "filename": "",
                    "filepath": "",
                    "prompt": prompt,
                    "status": "failed"
                })
                failed_count += 1

            # 延迟避免 rate limit
            if case_num < CASES_PER_PROCEDURE or proc_idx < len(PROCEDURES):
                time.sleep(1.5)

        results.append({
            "procedure": procedure,
            "slug": proc_slug,
            "total_cases": CASES_PER_PROCEDURE,
            "success_cases": len([r for r in proc_results if r["status"] == "success"]),
            "cases": proc_results
        })

        print(f"\n   ✅ {procedure} 完成: {len([r for r in proc_results if r['status'] == 'success'])}/{CASES_PER_PROCEDURE} 成功")

    # 保存总体 metadata
    metadata = {
        "total_procedures": len(PROCEDURES),
        "cases_per_procedure": CASES_PER_PROCEDURE,
        "total_images": total_images,
        "success": success_count,
        "failed": failed_count,
        "model": MODEL,
        "endpoint": API_ENDPOINT,
        "procedures": results
    }

    metadata_path = os.path.join(output_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 70)
    print(f"🎉 全部完成！")
    print(f"   ✅ 成功: {success_count}/{total_images}")
    print(f"   ❌ 失败: {failed_count}/{total_images}")
    print(f"   📄 详细信息: {metadata_path}")
    print("=" * 70)


if __name__ == "__main__":
    main()
