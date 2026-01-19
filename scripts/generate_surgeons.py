#!/usr/bin/env python3
"""
批量生成整容医生信息的脚本
使用 OpenAI API 生成医生简介和照片 prompt
"""

import json
import os
from openai import OpenAI

# 初始化 OpenAI 客户端
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# 医生数据模型模板
SURGEON_TEMPLATE = {
    "id": "",
    "name": "",
    "title": "",
    "specialties": [],
    "languages": [],
    "education": [],
    "certifications": [],
    "experience_years": 0,
    "procedures_count": {
        "facelifts": 0,
        "rhinoplasty": 0,
        "eyelid_surgery": 0
    },
    "bio": {
        "intro": "",
        "expertise": "",
        "philosophy": "",
        "achievements": []
    },
    "image_prompt": ""
}

# 系统提示词
SYSTEM_PROMPT = """你是一个专业的医疗内容生成专家，专门为高端整容外科诊所创建医生简介。
请生成真实、专业、高质量的医生信息。信息应该：
1. 听起来真实可信
2. 符合整容外科领域的专业标准
3. 突出医生的专业特长和成就
4. 语气专业、温暖、令人信赖
"""

# 用户提示词模板
USER_PROMPT_TEMPLATE = """请为以下整容外科医生生成完整的专业简介（用英语）：

医生类型：{specialty}
性别：{gender}
经验年限：{experience_years}年
主要专长：{main_specialties}

请按照以下 JSON 格式返回（只返回 JSON，不要其他文字）：
{{
    "name": "Dr. [姓名]",
    "title": "[职称，如 'Board-Certified Plastic Surgeon']",
    "specialties": ["[专长1]", "[专长2]", "[专长3]"],
    "languages": ["English", "[其他语言]"],
    "education": [
        "MD - [大学名称]",
        "Residency - [医院名称]",
        "Fellowship - [专业领域]"
    ],
    "certifications": [
        "American Board of Plastic Surgery",
        "[其他认证]"
    ],
    "experience_years": {experience_years},
    "procedures_count": {{
        "facelifts": {facelifts_count},
        "rhinoplasty": {rhinoplasty_count},
        "eyelid_surgery": {eyelid_count}
    }},
    "bio": {{
        "intro": "[2-3句话的简介，介绍医生的背景和声誉]",
        "expertise": "[详细描述医生的专业技能和独特方法，2-3段]",
        "philosophy": "[医生的治疗理念和对患者的承诺，1-2段]",
        "achievements": [
            "[重要成就1]",
            "[重要成就2]",
            "[重要成就3]"
        ]
    }},
    "image_prompt": "[生成一个详细的 AI 图像生成 prompt，用于创建这位医生的专业照片。描述应该包括：年龄范围、性别、种族、穿着（白大褂）、姿势、表情、背景（现代医疗环境）、光线等。要求照片看起来专业、值得信赖、友好。]"
}}
"""

def generate_surgeon_profile(specialty, gender, experience_years, main_specialties):
    """
    使用 OpenAI API 生成单个医生的信息

    Args:
        specialty: 医生专长类型（如 'Facial Plastic Surgery'）
        gender: 性别（'male' 或 'female'）
        experience_years: 经验年数
        main_specialties: 主要专长列表

    Returns:
        dict: 生成的医生信息
    """
    # 根据经验生成合理的手术数量
    facelifts_count = experience_years * 30
    rhinoplasty_count = experience_years * 25
    eyelid_count = experience_years * 40

    user_prompt = USER_PROMPT_TEMPLATE.format(
        specialty=specialty,
        gender=gender,
        experience_years=experience_years,
        main_specialties=", ".join(main_specialties),
        facelifts_count=facelifts_count,
        rhinoplasty_count=rhinoplasty_count,
        eyelid_count=eyelid_count
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.8,
            response_format={"type": "json_object"}
        )

        surgeon_data = json.loads(response.choices[0].message.content)

        # 生成 ID（从名字转换）
        name = surgeon_data.get("name", "")
        surgeon_id = name.replace("Dr. ", "").replace(" ", "-").lower()
        surgeon_data["id"] = surgeon_id

        return surgeon_data

    except Exception as e:
        print(f"Error generating surgeon profile: {e}")
        return None

def generate_multiple_surgeons(count=10):
    """
    批量生成多个医生信息

    Args:
        count: 要生成的医生数量

    Returns:
        list: 医生信息列表
    """
    surgeons = []

    # 定义不同类型的医生配置
    surgeon_configs = [
        {
            "specialty": "Facial Plastic Surgery",
            "gender": "male",
            "experience_years": 20,
            "main_specialties": ["Deep Plane Facelift", "Rhinoplasty", "Eyelid Surgery"]
        },
        {
            "specialty": "Facial Plastic Surgery",
            "gender": "female",
            "experience_years": 15,
            "main_specialties": ["Facial Rejuvenation", "Brow Lift", "Neck Lift"]
        },
        {
            "specialty": "Body Contouring",
            "gender": "male",
            "experience_years": 18,
            "main_specialties": ["Liposuction", "Tummy Tuck", "Brazilian Butt Lift"]
        },
        {
            "specialty": "Breast Surgery",
            "gender": "female",
            "experience_years": 12,
            "main_specialties": ["Breast Augmentation", "Breast Lift", "Breast Reduction"]
        },
        {
            "specialty": "Reconstructive Surgery",
            "gender": "male",
            "experience_years": 25,
            "main_specialties": ["Mohs Reconstruction", "Scar Revision", "Facial Trauma"]
        },
        {
            "specialty": "Facial Plastic Surgery",
            "gender": "female",
            "experience_years": 10,
            "main_specialties": ["Non-surgical Procedures", "Injectables", "Facial Fillers"]
        },
        {
            "specialty": "Body Contouring",
            "gender": "female",
            "experience_years": 14,
            "main_specialties": ["Mommy Makeover", "Body Lift", "Arm Lift"]
        },
        {
            "specialty": "Facial Plastic Surgery",
            "gender": "male",
            "experience_years": 22,
            "main_specialties": ["Revision Rhinoplasty", "Chin Augmentation", "Cheek Augmentation"]
        },
        {
            "specialty": "Aesthetic Medicine",
            "gender": "female",
            "experience_years": 8,
            "main_specialties": ["Laser Treatments", "Skin Resurfacing", "Chemical Peels"]
        },
        {
            "specialty": "Plastic Surgery",
            "gender": "male",
            "experience_years": 16,
            "main_specialties": ["Hair Restoration", "Otoplasty", "Facial Implants"]
        }
    ]

    for i, config in enumerate(surgeon_configs[:count]):
        print(f"Generating surgeon {i+1}/{count}...")
        surgeon = generate_surgeon_profile(**config)
        if surgeon:
            surgeons.append(surgeon)
            print(f"✓ Generated: {surgeon['name']}")
        else:
            print(f"✗ Failed to generate surgeon {i+1}")

    return surgeons

def save_surgeons_to_file(surgeons, output_file="surgeons_generated.json"):
    """
    将生成的医生信息保存到 JSON 文件

    Args:
        surgeons: 医生信息列表
        output_file: 输出文件名
    """
    output_path = os.path.join(os.path.dirname(__file__), output_file)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(surgeons, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved {len(surgeons)} surgeons to {output_path}")

def main():
    """主函数"""
    print("=" * 60)
    print("整容医生信息批量生成器")
    print("=" * 60)
    print()

    # 检查 API Key
    if not os.environ.get("OPENAI_API_KEY"):
        print("错误: 请设置 OPENAI_API_KEY 环境变量")
        print("示例: export OPENAI_API_KEY='your-api-key'")
        return

    # 询问要生成多少个医生
    try:
        count = int(input("请输入要生成的医生数量 (1-10): ") or "10")
        count = min(max(1, count), 10)  # 限制在 1-10 之间
    except ValueError:
        count = 10

    print(f"\n开始生成 {count} 位医生的信息...\n")

    # 生成医生信息
    surgeons = generate_multiple_surgeons(count)

    # 保存到文件
    if surgeons:
        save_surgeons_to_file(surgeons)

        # 显示摘要
        print("\n" + "=" * 60)
        print("生成完成!")
        print("=" * 60)
        print(f"成功生成: {len(surgeons)} 位医生")
        print("\n医生列表:")
        for i, surgeon in enumerate(surgeons, 1):
            print(f"{i}. {surgeon['name']} - {surgeon['title']}")

        print("\n每位医生的信息都包含:")
        print("  ✓ 完整的专业背景")
        print("  ✓ 教育经历和认证")
        print("  ✓ 详细的专业简介")
        print("  ✓ AI 图像生成 prompt")
    else:
        print("\n✗ 没有成功生成任何医生信息")

if __name__ == "__main__":
    main()
