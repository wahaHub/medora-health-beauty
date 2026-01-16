#!/usr/bin/env python3
"""
验证所有上传到 R2 的手术图片是否可访问
"""
import os
import sys
import json
import requests
from typing import Dict, List

# R2 公共 URL
R2_PUBLIC_URL = "https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev"

def create_slug(procedure_name: str) -> str:
    """将手术名称转换为 slug"""
    import re
    slug = procedure_name.lower()
    slug = re.sub(r'[®™©]', '', slug)
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

def check_image_exists(url: str, timeout: int = 10) -> bool:
    """检查图片是否存在"""
    try:
        response = requests.head(url, timeout=timeout)
        return response.status_code == 200
    except Exception:
        return False

def main():
    # 读取 metadata.json
    metadata_path = "generated_procedure_hero_images/metadata.json"

    if not os.path.exists(metadata_path):
        print(f"❌ 错误: 找不到 {metadata_path}")
        sys.exit(1)

    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    print(f"🔍 开始验证 R2 图片上传...")
    print(f"   R2 URL: {R2_PUBLIC_URL}")
    print(f"   总手术: {metadata['total_procedures']}")
    print("=" * 70)

    total_expected = 0
    total_found = 0
    total_missing = 0
    missing_images = []

    for proc_data in metadata['procedures']:
        procedure = proc_data['procedure']
        slug = create_slug(procedure)
        images = proc_data.get('images', {})

        print(f"\n[{procedure}]")
        print(f"   Slug: {slug}")

        for img_type in ['hero', 'benefits', 'candidate']:
            img_data = images.get(img_type, {})

            # 只检查生成成功的图片
            if img_data.get('status') == 'success':
                total_expected += 1
                url = f"{R2_PUBLIC_URL}/procedures/{slug}/{img_type}.jpg"

                if check_image_exists(url):
                    print(f"   ✅ {img_type}.jpg - 可访问")
                    total_found += 1
                else:
                    print(f"   ❌ {img_type}.jpg - 不存在或无法访问")
                    total_missing += 1
                    missing_images.append({
                        'procedure': procedure,
                        'slug': slug,
                        'type': img_type,
                        'url': url
                    })
            else:
                print(f"   ⏭️  {img_type}.jpg - 未生成")

    print("\n" + "=" * 70)
    print(f"📊 验证结果:")
    print(f"   预期上传: {total_expected} 张")
    print(f"   ✅ 成功访问: {total_found} 张")
    print(f"   ❌ 无法访问: {total_missing} 张")
    print("=" * 70)

    if missing_images:
        print(f"\n⚠️  缺失的图片:")
        for img in missing_images:
            print(f"   - {img['procedure']} ({img['type']}.jpg)")
            print(f"     URL: {img['url']}")
    else:
        print(f"\n🎉 所有图片都已成功上传并可访问！")

    # 保存验证报告
    report_path = "r2_upload_verification_report.json"
    report = {
        'total_expected': total_expected,
        'total_found': total_found,
        'total_missing': total_missing,
        'missing_images': missing_images,
        'timestamp': metadata.get('timestamp', 'unknown')
    }

    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n📄 验证报告已保存: {report_path}")

if __name__ == "__main__":
    main()
