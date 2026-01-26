#!/usr/bin/env python3
"""
批量生成手术页面的3种图片：
1. Hero 图 - 展示手术效果的主图
2. Benefits 图 - 展示手术优势
3. Good Candidate 图 - 展示理想候选人
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

# 官网所有手术列表（完整版 - 71个手术）
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
    "Facial Implants",
    "Submalar Implants",

    # Face - Skin & Resurfacing
    "Renuvion Skin Tightening",
    "Laser Liposuction",
    "Skin Resurfacing",
    "Laser Skin Resurfacing",
    "Microdermabrasion",
    "Chemical Peels",
    "Non-surgical Skin Tightening",

    # Face - Injectables
    "BOTOX & Neurotoxins",
    "Dermal Fillers",
    "Fat Dissolving Injections",
    "Fat Transfer",
    "Facial Rejuvenation with PRP",
    "Lip Filler",
    "Lip Injections",
    "Lip Augmentation",
    "Lip Lift",

    # Neck
    "Neck Liposuction",
    "Neck Tightening",
    "Platysmaplasty",
    "Cervicoplasty",

    # Hair & Laser
    "Hair Restoration",
    "Laser Hair Removal",

    # Light / Laser Treatments
    "IPL / Photofacial",

    # Collagen / Regenerative
    "Collagen Stimulators / Non-HA Fillers",
    "Microneedling",
    "PRP / PRF",

    # Other Facial
    "Mohs Skin Cancer Reconstruction",

    # Body - Core
    "Liposuction",
    "Tummy Tuck",
    "Mommy Makeover",
    "Scar Reduction",
    "Weight Loss Injections",

    # Body - Arms/Legs
    "Arm Lift",
    "Thigh Lift",
    "Bra Line Back Lift",

    # Body - After Weight Loss
    "Body Contouring After Weight Loss",
    "Lower Body Lift",
    "Upper Body Lift",
    "Panniculectomy",
    "Mons Pubis Reduction / Lift",

    # Breast
    "Breast Augmentation",
    "Breast Lift",
    "Breast Reduction",
    "Breast Implant Removal / Exchange & Revision",
    "Gynecomastia Surgery",

    # Buttocks
    "Brazilian Butt Lift",
    "Buttock Lift",

    # Intimate
    "Labiaplasty",

    # Cellulite
    "Aveli Cellulite Treatment"
]

# 三种图片类型
IMAGE_TYPES = {
    "hero": "主视觉图，展示手术的专业性和效果",
    "benefits": "优势图，体现手术带来的积极改变",
    "candidate": "理想患者图，展示适合接受该手术的人群"
}


def generate_image(api_key: str, prompt: str, max_retries: int = 3, timeout: float = 120.0) -> Optional[bytes]:
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

    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait_time = 2 * (attempt + 1)
                print(f"         🔄 重试 {attempt + 1}/{max_retries}，等待 {wait_time}s...")
                time.sleep(wait_time)

            resp = requests.post(API_ENDPOINT, headers=headers, json=payload, timeout=timeout)

            if resp.status_code == 200:
                data = resp.json()

                if isinstance(data, dict) and isinstance(data.get("data"), list) and data["data"]:
                    item = data["data"][0]

                    if "b64_json" in item:
                        return base64.b64decode(item["b64_json"])

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

                if isinstance(data, dict) and isinstance(data.get("image"), str):
                    try:
                        return base64.b64decode(data["image"])
                    except Exception:
                        pass

            elif resp.status_code == 429:
                print(f"         ⚠️  Rate limit，等待 10s...")
                time.sleep(10)
                continue

            elif resp.status_code in (500, 502, 503, 504):
                print(f"         ⚠️  服务器错误 ({resp.status_code})...")
                time.sleep(3)
                continue

            else:
                print(f"         ❌ API Error: {resp.status_code}")
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
            print(f"         ⚠️  异常: {str(e)[:100]}")
            if attempt < max_retries - 1:
                time.sleep(2)
                continue

    return None


def get_hero_feature(procedure: str) -> str:
    """根据手术类型返回重点展示的特征"""
    p = procedure.lower()

    # 眼部手术
    if 'eyelid' in p or 'brow' in p:
        return "明亮有神的双眼，眼神清澈"

    # 鼻部手术
    if 'nose' in p or 'rhino' in p:
        return "精致优美的鼻梁线条，侧脸完美"

    # 面部提升
    if 'facelift' in p or 'temples' in p or 'forehead' in p:
        return "紧致光滑的面部轮廓，肌肤年轻"

    # 面部轮廓与植入
    if 'cheek' in p or 'chin' in p or 'jawline' in p or 'contour' in p or 'implant' in p or 'submalar' in p:
        return "立体优雅的面部线条，轮廓清晰"

    # 耳部
    if 'ear' in p or 'otoplasty' in p:
        return "精致对称的耳部轮廓，侧脸优雅"

    # 颈部
    if 'neck' in p:
        return "优雅修长的颈部线条，天鹅颈"

    # 嘴唇
    if 'lip' in p:
        return "饱满自然的双唇，微笑迷人"

    # 皮肤护理（换肤、激光等）
    if 'skin' in p or 'resurfacing' in p or 'peel' in p or 'microderm' in p or 'laser' in p or 'ipl' in p or 'photofacial' in p:
        return "光滑细腻的肌肤，容光焕发"

    # 注射类（BOTOX、填充剂等）
    if 'botox' in p or 'filler' in p or 'injectable' in p or 'neurotoxin' in p:
        return "光滑年轻的肌肤，自然无痕"

    # 再生治疗（PRP、胶原等）
    if 'prp' in p or 'prf' in p or 'collagen' in p or 'microneedling' in p or 'rejuvenation' in p:
        return "焕发新生的肌肤，充满活力"

    # 头发
    if 'hair' in p:
        return "浓密健康的秀发，自信飘逸"

    # 身体塑形
    if 'lipo' in p or 'tummy' in p or 'body' in p or 'weight' in p:
        return "优美流畅的身体曲线，健康活力"

    # 胸部
    if 'breast' in p:
        return "自然优美的身材比例，自信优雅"

    # 臂部/腿部
    if 'arm' in p or 'thigh' in p or 'bra line' in p:
        return "纤细修长的肢体线条，轻盈灵动"

    # 臀部
    if 'butt' in p or 'brazilian' in p:
        return "优美挺翘的身体曲线，健康性感"

    # 私密部位
    if 'labiapl' in p or 'mons' in p:
        return "自信优雅的身体线条，焕然一新"

    # 疤痕、皮肤重建
    if 'scar' in p or 'mohs' in p or 'reconstruction' in p:
        return "平滑自然的肌肤，重获自信"

    # 橘皮组织
    if 'cellulite' in p or 'aveli' in p:
        return "光滑紧致的肌肤，优美线条"

    # 默认
    return "自然美好的外表，充满自信"


def create_hero_prompt(procedure: str) -> str:
    """生成 Hero 图 - 诗意阳光的侧面肖像"""
    feature = get_hero_feature(procedure)

    return (
        f"一位年轻女性的优雅侧面肖像，{feature}，"
        f"温暖的阳光洒在脸上，营造柔和的光影效果，"
        f"背景是柔焦的自然环境，整体氛围清新、诗意、充满希望，"
        f"16:9 横版构图，电影级摄影质感，色调明亮温暖"
    )


def create_benefits_prompt(procedure: str) -> str:
    """生成 Benefits 图 - 展现术后自信美好的生活场景"""
    p = procedure.lower()

    # 根据手术类型选择场景
    if 'eye' in p or 'brow' in p or 'face' in p or 'nose' in p or 'lip' in p or 'skin' in p or 'botox' in p or 'filler' in p:
        scene = "女性在阳光明媚的户外，微笑着与朋友交谈，展现自信的笑容"
    elif 'body' in p or 'lipo' in p or 'tummy' in p or 'breast' in p or 'butt' in p or 'arm' in p or 'thigh' in p:
        scene = "女性穿着优雅的服装，在镜子前欣赏自己，充满自信"
    elif 'hair' in p or 'laser hair' in p:
        scene = "女性在微风中，秀发飘逸，享受户外阳光"
    elif 'cellulite' in p or 'aveli' in p:
        scene = "女性穿着泳装，在海边自信地享受阳光"
    elif 'weight' in p or 'injection' in p:
        scene = "女性在健身房或户外运动，展现健康活力的状态"
    else:
        scene = "女性在明亮的环境中，展现自信美好的状态"

    return (
        f"{scene}，"
        f"画面充满积极正能量，色调明亮温暖，"
        f"体现手术带来的自信与美好改变，"
        f"自然光线，清新的氛围，16:9 横版"
    )


def create_candidate_prompt(procedure: str) -> str:
    """生成 Good Candidate 图 - 温馨专业的咨询场景"""

    return (
        f"温馨的医美诊所咨询室，女性患者与专业医生进行友好的交流，"
        f"医生在耐心倾听和解答，患者表情放松自然，"
        f"室内光线柔和明亮，现代简约的装修风格，"
        f"营造专业、安心、值得信赖的氛围，"
        f"16:9 横版，电影级摄影质感"
    )


def main():
    # 检查 API Key
    api_key = os.environ.get("XAI_API_KEY")
    if not api_key:
        print("❌ 错误: 请设置环境变量 XAI_API_KEY")
        print("   export XAI_API_KEY='your-key-here'")
        sys.exit(1)

    # 创建输出目录
    output_dir = "generated_procedure_hero_images"
    os.makedirs(output_dir, exist_ok=True)

    total_images = len(PROCEDURES) * 3  # 每个手术3张图
    print(f"🚀 开始生成手术页面图片...")
    print(f"   手术数量: {len(PROCEDURES)}")
    print(f"   每个手术: 3 种图片 (hero, benefits, candidate)")
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

        proc_results = {
            "procedure": procedure,
            "slug": proc_slug,
            "images": {}
        }

        # 1. Hero 图
        print(f"\n   📸 生成 Hero 图...")
        hero_prompt = create_hero_prompt(procedure)
        print(f"      Prompt: {hero_prompt}")
        hero_bytes = generate_image(api_key, hero_prompt)

        if hero_bytes:
            hero_path = os.path.join(proc_dir, "hero.jpg")
            with open(hero_path, "wb") as f:
                f.write(hero_bytes)
            print(f"      ✅ 已保存: hero.jpg ({len(hero_bytes)} bytes)")
            proc_results["images"]["hero"] = {
                "filename": "hero.jpg",
                "path": hero_path,
                "prompt": hero_prompt,
                "status": "success"
            }
            success_count += 1
        else:
            print(f"      ❌ 失败")
            proc_results["images"]["hero"] = {"status": "failed", "prompt": hero_prompt}
            failed_count += 1

        time.sleep(1.5)

        # 2. Benefits 图
        print(f"\n   📸 生成 Benefits 图...")
        benefits_prompt = create_benefits_prompt(procedure)
        print(f"      Prompt: {benefits_prompt}")
        benefits_bytes = generate_image(api_key, benefits_prompt)

        if benefits_bytes:
            benefits_path = os.path.join(proc_dir, "benefits.jpg")
            with open(benefits_path, "wb") as f:
                f.write(benefits_bytes)
            print(f"      ✅ 已保存: benefits.jpg ({len(benefits_bytes)} bytes)")
            proc_results["images"]["benefits"] = {
                "filename": "benefits.jpg",
                "path": benefits_path,
                "prompt": benefits_prompt,
                "status": "success"
            }
            success_count += 1
        else:
            print(f"      ❌ 失败")
            proc_results["images"]["benefits"] = {"status": "failed", "prompt": benefits_prompt}
            failed_count += 1

        time.sleep(1.5)

        # 3. Good Candidate 图
        print(f"\n   📸 生成 Good Candidate 图...")
        candidate_prompt = create_candidate_prompt(procedure)
        print(f"      Prompt: {candidate_prompt}")
        candidate_bytes = generate_image(api_key, candidate_prompt)

        if candidate_bytes:
            candidate_path = os.path.join(proc_dir, "candidate.jpg")
            with open(candidate_path, "wb") as f:
                f.write(candidate_bytes)
            print(f"      ✅ 已保存: candidate.jpg ({len(candidate_bytes)} bytes)")
            proc_results["images"]["candidate"] = {
                "filename": "candidate.jpg",
                "path": candidate_path,
                "prompt": candidate_prompt,
                "status": "success"
            }
            success_count += 1
        else:
            print(f"      ❌ 失败")
            proc_results["images"]["candidate"] = {"status": "failed", "prompt": candidate_prompt}
            failed_count += 1

        results.append(proc_results)

        success_in_proc = len([v for v in proc_results["images"].values() if v.get("status") == "success"])
        print(f"\n   ✅ {procedure} 完成: {success_in_proc}/3 成功")

    # 保存总体 metadata
    metadata = {
        "total_procedures": len(PROCEDURES),
        "images_per_procedure": 3,
        "image_types": list(IMAGE_TYPES.keys()),
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
