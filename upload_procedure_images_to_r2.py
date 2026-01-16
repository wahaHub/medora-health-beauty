#!/usr/bin/env python3
"""
上传生成的手术页面图片到 Cloudflare R2

根据 UPLOAD_MAPPING_ANALYSIS.md 的映射关系:
- 本地文件夹名: XX_procedure_name (下划线分隔)
- R2 slug: procedure-name (连字符分隔)

图片路径规则:
- Hero 图: procedures/{slug}/hero.jpg
- Benefits 图: procedures/{slug}/benefits.jpg
- Candidate 图: procedures/{slug}/candidate.jpg
"""
import os
import sys
import re
import boto3
from botocore.exceptions import ClientError

# 本地文件夹 -> R2 slug 的映射表
# 根据 UPLOAD_MAPPING_ANALYSIS.md 生成
FOLDER_TO_SLUG_MAPPING = {
    "01_eyelid_surgery": "eyelid-surgery",
    "02_rhinoplasty": "rhinoplasty",
    "03_revision_rhinoplasty": "revision-rhinoplasty",
    "04_nose_tip_refinement": "nose-tip-refinement",
    "05_facelift": "facelift",
    "06_mini_facelift": "mini-facelift",
    "07_midface_lift": "midface-lift",
    "08_neck_lift": "neck-lift",
    "09_deep_neck_contouring": "deep-neck-contouring",
    "10_brow_lift": "brow-lift",
    "11_temples_lift": "temples-lift",
    "12_forehead_reduction_surgery": "forehead-reduction-surgery",
    "13_cheek_augmentation": "cheek-augmentation",
    "14_chin_augmentation": "chin-augmentation",
    "15_jawline_contouring": "jawline-contouring",
    "16_zygomatic_arch_contouring": "zygomatic-arch-contouring",
    "17_otoplasty": "otoplasty",
    "18_buccal_fat_removal": "buccal-fat-removal",
    "19_facial_implants": "facial-implants",
    "19_renuvion_skin_tightening": "renuvion-skin-tightening",
    "20_submalar_implants": "submalar-implants",
    "20_laser_liposuction": "laser-liposuction",
    "21_skin_resurfacing": "skin-resurfacing",
    "24_laser_skin_resurfacing": "laser-skin-resurfacing",
    "25_microdermabrasion": "microdermabrasion",
    "26_chemical_peels": "chemical-peels",
    "27_non-surgical_skin_tightening": "non-surgical-skin-tightening",
    "28_botox_&_neurotoxins": "botox-neurotoxins",
    "29_dermal_fillers": "dermal-fillers",
    "30_fat_dissolving_injections": "fat-dissolving-injections",
    "31_fat_transfer": "fat-transfer",
    "32_facial_rejuvenation_with_prp": "facial-rejuvenation-with-prp",
    "33_lip_filler": "lip-filler",
    "34_lip_injections": "lip-injections",
    "35_lip_augmentation": "lip-augmentation",
    "36_lip_lift": "lip-lift",
    "37_neck_liposuction": "neck-liposuction",
    "38_neck_tightening": "neck-tightening",
    "39_platysmaplasty": "platysmaplasty",
    "40_cervicoplasty": "cervicoplasty",
    "41_hair_restoration": "hair-restoration",
    "42_laser_hair_removal": "laser-hair-removal",
    "43_ipl___photofacial": "ipl-photofacial",
    "44_collagen_stimulators___non-ha_fillers": "collagen-stimulators-non-ha-fillers",
    "45_microneedling": "microneedling",
    "46_prp___prf": "prp-prf",
    "47_mohs_skin_cancer_reconstruction": "mohs-skin-cancer-reconstruction",
    "48_liposuction": "liposuction",
    "49_tummy_tuck": "tummy-tuck",
    "50_mommy_makeover": "mommy-makeover",
    "51_scar_reduction": "scar-reduction",
    "52_weight_loss_injections": "weight-loss-injections",
    "53_arm_lift": "arm-lift",
    "54_thigh_lift": "thigh-lift",
    "55_bra_line_back_lift": "bra-line-back-lift",
    "56_body_contouring_after_weight_loss": "body-contouring-after-weight-loss",
    "57_lower_body_lift": "lower-body-lift",
    "58_upper_body_lift": "upper-body-lift",
    "59_panniculectomy": "panniculectomy",
    "60_mons_pubis_reduction___lift": "mons-pubis-reduction-lift",
    "61_breast_augmentation": "breast-augmentation",
    "62_breast_lift": "breast-lift",
    "63_breast_reduction": "breast-reduction",
    "64_breast_implant_removal___exchange_&_revision": "breast-implant-removal-exchange-revision",
    "65_gynecomastia_surgery": "gynecomastia-surgery",
    "66_brazilian_butt_lift": "brazilian-butt-lift",
    "67_buttock_lift": "buttock-lift",
    "68_labiaplasty": "labiaplasty",
    "69_aveli_cellulite_treatment": "aveli-cellulite-treatment",
}


def load_env():
    """加载 .env 文件"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("❌ 错误: 找不到 .env 文件")
        sys.exit(1)

    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()

    return env_vars


def upload_to_r2(
    s3_client,
    bucket_name: str,
    local_path: str,
    r2_key: str,
    content_type: str = 'image/jpeg'
) -> bool:
    """上传文件到 R2（会覆盖已存在的文件）"""
    try:
        with open(local_path, 'rb') as f:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=r2_key,
                Body=f,
                ContentType=content_type,
                CacheControl='public, max-age=31536000'  # 1年缓存
            )
        return True
    except ClientError as e:
        print(f"      ❌ 上传失败: {e}")
        return False
    except FileNotFoundError:
        print(f"      ⚠️  文件不存在: {local_path}")
        return False


def main():
    # 加载环境变量
    env_vars = load_env()

    R2_ACCOUNT_ID = env_vars.get('R2_ACCOUNT_ID')
    R2_ACCESS_KEY_ID = env_vars.get('R2_ACCESS_KEY_ID')
    R2_SECRET_ACCESS_KEY = env_vars.get('R2_SECRET_ACCESS_KEY')
    R2_BUCKET_NAME = env_vars.get('R2_BUCKET_NAME')
    R2_PUBLIC_URL = env_vars.get('R2_PUBLIC_URL')

    if not all([R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME]):
        print("❌ 错误: .env 中缺少 R2 配置")
        print("   需要: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME")
        sys.exit(1)

    # 创建 S3 客户端（R2 兼容 S3 API）
    s3_client = boto3.client(
        's3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name='auto'
    )

    # 本地图片目录
    input_dir = os.path.join(os.path.dirname(__file__), "generated_procedure_hero_images")

    if not os.path.exists(input_dir):
        print(f"❌ 错误: 找不到目录 {input_dir}")
        sys.exit(1)

    print(f"🚀 开始上传图片到 Cloudflare R2...")
    print(f"   Bucket: {R2_BUCKET_NAME}")
    print(f"   Public URL: {R2_PUBLIC_URL}")
    print(f"   本地目录: {input_dir}")
    print(f"   映射数量: {len(FOLDER_TO_SLUG_MAPPING)} 个手术")
    print("=" * 70)

    upload_success = 0
    upload_failed = 0
    skipped = 0

    # 遍历映射表
    for folder_name, r2_slug in sorted(FOLDER_TO_SLUG_MAPPING.items()):
        folder_path = os.path.join(input_dir, folder_name)

        if not os.path.exists(folder_path):
            print(f"\n⚠️  跳过 {folder_name} (文件夹不存在)")
            skipped += 3
            continue

        print(f"\n[{folder_name}]")
        print(f"   -> R2: procedures/{r2_slug}/")

        # 上传 3 种图片
        for img_type in ['hero', 'benefits', 'candidate']:
            local_path = os.path.join(folder_path, f"{img_type}.jpg")

            if not os.path.exists(local_path):
                print(f"   ⚠️  {img_type}.jpg 不存在")
                skipped += 1
                continue

            # R2 路径: procedures/{slug}/{type}.jpg
            r2_key = f"procedures/{r2_slug}/{img_type}.jpg"

            print(f"   📤 {img_type}.jpg -> {r2_key}")

            if upload_to_r2(s3_client, R2_BUCKET_NAME, local_path, r2_key):
                print(f"      ✅ 成功")
                upload_success += 1
            else:
                upload_failed += 1

    print("\n" + "=" * 70)
    print(f"🎉 上传完成！")
    print(f"   ✅ 成功: {upload_success}")
    print(f"   ❌ 失败: {upload_failed}")
    print(f"   ⏭️  跳过: {skipped}")
    print("=" * 70)

    # 显示一些示例 URL
    if upload_success > 0 and R2_PUBLIC_URL:
        print(f"\n示例访问 URL:")
        print(f"   {R2_PUBLIC_URL}/procedures/eyelid-surgery/hero.jpg")
        print(f"   {R2_PUBLIC_URL}/procedures/rhinoplasty/benefits.jpg")
        print(f"   {R2_PUBLIC_URL}/procedures/facelift/candidate.jpg")


if __name__ == "__main__":
    main()
