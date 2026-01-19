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

# 50个多样化的医生名字池（中国人和欧美人混合）
SURGEON_NAMES = [
    # 中国医生（拼音格式）
    "Min Zhang", "Wei Chen", "Li Wang", "Yue Liu", "Xin Zhou",
    "Jing Wu", "Mei Lin", "Han Zhao", "Ying Sun", "Jun Yang",
    "Hua Xu", "Qing Ma", "Fang Zheng", "Lan Huang", "Bo Li",
    "Rui Zhang", "Xia Chen", "Feng Wang", "Hong Liu", "Yu Zhou",

    # 欧美医生
    "Michael Anderson", "Sarah Thompson", "David Rodriguez", "Emily Parker", "James Mitchell",
    "Jennifer Coleman", "Robert Harrison", "Lisa Bennett", "William Foster", "Amanda Brooks",
    "Christopher Hayes", "Michelle Turner", "Daniel Cooper", "Rachel Morgan", "Matthew Sullivan",
    "Jessica Richardson", "Joseph Reynolds", "Lauren Peterson", "Andrew Marshall", "Nicole Sanders",
    "Brandon Hughes", "Stephanie Powell", "Ryan Barnes", "Melissa Griffin", "Kevin Ross",
    "Angela Butler", "Justin Wallace", "Samantha Wood", "Nathan Phillips", "Rebecca Carter"
]

# 全局索引，用于按顺序选择名字
_name_index = 0

def get_next_surgeon_name():
    """按顺序获取下一个医生名字"""
    global _name_index
    if _name_index >= len(SURGEON_NAMES):
        _name_index = 0  # 如果超过50个，重新开始
    name = SURGEON_NAMES[_name_index]
    _name_index += 1
    return name

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

医生姓名：{name}
医生类型：{specialty}
性别：{gender}
经验年限：{experience_years}年
主要专长：{main_specialties}

请按照以下 JSON 格式返回（只返回 JSON，不要其他文字）。注意：必须使用我提供的姓名 "{name}"：
{{
    "name": "Dr. {name}",
    "title": "[职称，如 'Board-Certified Plastic Surgeon']",
    "specialties": ["[专长1]", "[专长2]", "[专长3]"],
    "languages": ["English", "[其他语言]"],
    "education": [
        "MD - [大学名称]",
        "Residency - [医院名称]",
        "Fellowship - [专业领域]"
    ],
    "certifications": [
        "[从以下选择2-3个相关认证：American Board of Plastic Surgery, American Board of Facial Plastic Surgery, International Society of Aesthetic Plastic Surgery (ISAPS), Chinese Society of Plastic Surgery (CSPS), World Society of Aesthetic Plastic Surgeons (WSAPS), Royal College of Surgeons, European Board of Plastic Surgery, Asian Association of Plastic Surgeons]"
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
    "image_prompt": "[生成一个详细的 AI 图像生成 prompt，用于创建这位医生的专业照片。IMPORTANT: 根据医生姓名判断种族 - 如果是中文拼音名字（如 Min Zhang, Wei Chen 等），必须描述为 Asian/East Asian appearance；如果是西方名字，描述为 Caucasian。描述应该包括：年龄范围、性别、种族特征、穿着（白大褂）、姿势、表情、背景（现代医疗环境）、光线等。要求照片看起来专业、值得信赖、友好。]"
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
    # 从名字池中按顺序获取下一个名字
    surgeon_name = get_next_surgeon_name()

    # 根据经验生成合理的手术数量
    facelifts_count = experience_years * 30
    rhinoplasty_count = experience_years * 25
    eyelid_count = experience_years * 40

    user_prompt = USER_PROMPT_TEMPLATE.format(
        name=surgeon_name,
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
            model="gpt-5",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            # GPT-5 only supports default temperature (1)
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

    # 定义不同类型的医生配置 - 涵盖所有主要手术类型
    surgeon_configs = [
        # Facial Surgery Specialists
        {
            "specialty": "Facial Plastic Surgery",
            "gender": "male",
            "experience_years": 20,
            "main_specialties": ["Deep Plane Facelift", "Rhinoplasty", "Eyelid Surgery"]
        },
        {
            "specialty": "Facial Rejuvenation",
            "gender": "female",
            "experience_years": 15,
            "main_specialties": ["Facelift", "Brow Lift", "Neck Lift"]
        },
        {
            "specialty": "Rhinoplasty & Nasal Surgery",
            "gender": "male",
            "experience_years": 18,
            "main_specialties": ["Revision Rhinoplasty", "Nose Tip Refinement", "Rhinoplasty"]
        },
        {
            "specialty": "Eyelid & Brow Surgery",
            "gender": "female",
            "experience_years": 12,
            "main_specialties": ["Eyelid Surgery", "Brow Lift", "Temples Lift"]
        },
        {
            "specialty": "Facial Contouring",
            "gender": "male",
            "experience_years": 16,
            "main_specialties": ["Chin Augmentation", "Cheek Augmentation", "Jawline Contouring"]
        },
        {
            "specialty": "Neck & Jawline Surgery",
            "gender": "female",
            "experience_years": 14,
            "main_specialties": ["Deep Neck Contouring", "Neck Liposuction", "Platysmaplasty"]
        },
        {
            "specialty": "Facial Implants & Contouring",
            "gender": "male",
            "experience_years": 19,
            "main_specialties": ["Facial Implants", "Submalar Implants", "Zygomatic Arch Contouring"]
        },

        # Body Contouring Specialists
        {
            "specialty": "Body Contouring",
            "gender": "female",
            "experience_years": 17,
            "main_specialties": ["Liposuction", "Tummy Tuck", "Mommy Makeover"]
        },
        {
            "specialty": "Post-Weight Loss Surgery",
            "gender": "male",
            "experience_years": 22,
            "main_specialties": ["Body Contouring After Weight Loss", "Lower Body Lift", "Panniculectomy"]
        },
        {
            "specialty": "Extremity Contouring",
            "gender": "female",
            "experience_years": 13,
            "main_specialties": ["Arm Lift", "Thigh Lift", "Bra Line Back Lift"]
        },

        # Breast Surgery Specialists
        {
            "specialty": "Breast Surgery",
            "gender": "female",
            "experience_years": 16,
            "main_specialties": ["Breast Augmentation", "Breast Lift", "Breast Reduction"]
        },
        {
            "specialty": "Breast Revision & Reconstruction",
            "gender": "male",
            "experience_years": 20,
            "main_specialties": ["Breast Implant Removal", "Breast Revision", "Gynecomastia Surgery"]
        },

        # Buttocks & Lower Body Specialists
        {
            "specialty": "Buttocks & Lower Body Contouring",
            "gender": "female",
            "experience_years": 14,
            "main_specialties": ["Brazilian Butt Lift", "Buttock Lift", "Mons Pubis Lift"]
        },

        # Intimate Surgery Specialist
        {
            "specialty": "Intimate & Reconstructive Surgery",
            "gender": "female",
            "experience_years": 11,
            "main_specialties": ["Labiaplasty", "Intimate Rejuvenation", "Scar Revision"]
        },

        # Non-Surgical & Injectables Specialists
        {
            "specialty": "Non-Surgical Aesthetics",
            "gender": "female",
            "experience_years": 10,
            "main_specialties": ["BOTOX & Neurotoxins", "Dermal Fillers", "Lip Injections"]
        },
        {
            "specialty": "Regenerative & Injectable Medicine",
            "gender": "male",
            "experience_years": 12,
            "main_specialties": ["Fat Transfer", "PRP/PRF", "Facial Rejuvenation with PRP"]
        },

        # Skin & Laser Specialists
        {
            "specialty": "Laser & Skin Resurfacing",
            "gender": "female",
            "experience_years": 9,
            "main_specialties": ["Laser Skin Resurfacing", "Chemical Peels", "Microdermabrasion"]
        },
        {
            "specialty": "Skin Tightening & Body Treatments",
            "gender": "male",
            "experience_years": 13,
            "main_specialties": ["Renuvion Skin Tightening", "Laser Liposuction", "Avéli Cellulite Treatment"]
        },
        {
            "specialty": "Light-Based Treatments",
            "gender": "female",
            "experience_years": 8,
            "main_specialties": ["IPL/Photofacial", "Laser Hair Removal", "Skin Tightening"]
        },

        # Lip Surgery Specialist
        {
            "specialty": "Lip & Perioral Surgery",
            "gender": "female",
            "experience_years": 11,
            "main_specialties": ["Lip Augmentation", "Lip Lift", "Lip Filler"]
        },

        # Hair Restoration Specialist
        {
            "specialty": "Hair Restoration Surgery",
            "gender": "male",
            "experience_years": 15,
            "main_specialties": ["Hair Restoration", "Follicular Unit Transplantation", "Scalp Micropigmentation"]
        },

        # Reconstructive & Special Procedures
        {
            "specialty": "Reconstructive & Mohs Surgery",
            "gender": "male",
            "experience_years": 25,
            "main_specialties": ["Mohs Skin Cancer Reconstruction", "Scar Reduction & Revision", "Facial Trauma"]
        },
        {
            "specialty": "Ear & Facial Features Surgery",
            "gender": "male",
            "experience_years": 14,
            "main_specialties": ["Otoplasty", "Ear Pinning", "Buccal Fat Removal"]
        },

        # Collagen & Regenerative Specialist
        {
            "specialty": "Collagen & Regenerative Treatments",
            "gender": "female",
            "experience_years": 10,
            "main_specialties": ["Collagen Stimulators", "Microneedling", "PRP/PRF"]
        },

        # Weight Loss & Medical Aesthetics
        {
            "specialty": "Medical Weight Loss & Body Sculpting",
            "gender": "male",
            "experience_years": 12,
            "main_specialties": ["Weight Loss Injections", "Fat Dissolving Injections", "Body Contouring"]
        },

        # Forehead & Upper Face Specialist
        {
            "specialty": "Forehead & Upper Face Surgery",
            "gender": "female",
            "experience_years": 13,
            "main_specialties": ["Forehead Reduction Surgery", "Brow Lift", "Temples Lift"]
        },

        # Midface & Cheek Specialist
        {
            "specialty": "Midface & Cheek Rejuvenation",
            "gender": "male",
            "experience_years": 17,
            "main_specialties": ["Midface Lift", "Cheek Augmentation", "Submalar Implants"]
        },

        # Mini Procedures Specialist
        {
            "specialty": "Mini & Quick Recovery Procedures",
            "gender": "female",
            "experience_years": 11,
            "main_specialties": ["Mini Facelift", "Neck Tightening", "Fat Transfer"]
        },

        # Comprehensive Body Lift Specialist
        {
            "specialty": "Comprehensive Body Lift Surgery",
            "gender": "male",
            "experience_years": 21,
            "main_specialties": ["360 Body Lift", "Upper Body Lift", "Lower Body Lift"]
        },

        # Neck Surgery Specialist
        {
            "specialty": "Neck Surgery & Rejuvenation",
            "gender": "female",
            "experience_years": 15,
            "main_specialties": ["Neck Lift", "Cervicoplasty", "Platysmaplasty"]
        },

        # Additional specialists to reach 50 total (configs 31-50)
        {
            "specialty": "Advanced Rhinoplasty",
            "gender": "female",
            "experience_years": 19,
            "main_specialties": ["Ethnic Rhinoplasty", "Functional Rhinoplasty", "Nasal Reconstruction"]
        },
        {
            "specialty": "Facial Feminization Surgery",
            "gender": "male",
            "experience_years": 16,
            "main_specialties": ["Facial Feminization", "Forehead Contouring", "Jaw Feminization"]
        },
        {
            "specialty": "Scar Revision & Skin Surgery",
            "gender": "female",
            "experience_years": 14,
            "main_specialties": ["Scar Revision", "Keloid Treatment", "Skin Lesion Removal"]
        },
        {
            "specialty": "Fat Grafting & Transfer",
            "gender": "male",
            "experience_years": 18,
            "main_specialties": ["Facial Fat Grafting", "Structural Fat Grafting", "Autologous Fat Transfer"]
        },
        {
            "specialty": "Pediatric Plastic Surgery",
            "gender": "female",
            "experience_years": 21,
            "main_specialties": ["Cleft Lip and Palate", "Pediatric Burns", "Congenital Deformities"]
        },
        {
            "specialty": "Hand & Upper Extremity Surgery",
            "gender": "male",
            "experience_years": 23,
            "main_specialties": ["Hand Surgery", "Wrist Reconstruction", "Nerve Repair"]
        },
        {
            "specialty": "Microsurgery & Reconstruction",
            "gender": "female",
            "experience_years": 20,
            "main_specialties": ["Microsurgical Reconstruction", "Free Flap Surgery", "Lymphedema Treatment"]
        },
        {
            "specialty": "Facial Asymmetry Correction",
            "gender": "male",
            "experience_years": 17,
            "main_specialties": ["Facial Asymmetry", "Hemifacial Microsomia", "Jaw Alignment"]
        },
        {
            "specialty": "Lip Enhancement & Rejuvenation",
            "gender": "female",
            "experience_years": 9,
            "main_specialties": ["Advanced Lip Fillers", "Lip Lift Techniques", "Perioral Rejuvenation"]
        },
        {
            "specialty": "Non-Surgical Facial Contouring",
            "gender": "male",
            "experience_years": 11,
            "main_specialties": ["Non-Surgical Nose Job", "Liquid Facelift", "Thread Lifts"]
        },
        {
            "specialty": "Body Sculpting & Contouring",
            "gender": "female",
            "experience_years": 15,
            "main_specialties": ["CoolSculpting", "Body Contouring", "Non-Invasive Fat Reduction"]
        },
        {
            "specialty": "Gynecomastia & Male Chest",
            "gender": "male",
            "experience_years": 14,
            "main_specialties": ["Male Breast Reduction", "Chest Masculinization", "Pectoral Implants"]
        },
        {
            "specialty": "Abdominoplasty Specialist",
            "gender": "female",
            "experience_years": 16,
            "main_specialties": ["Extended Tummy Tuck", "Mini Abdominoplasty", "Fleur-de-Lis Tummy Tuck"]
        },
        {
            "specialty": "Facial Nerve Surgery",
            "gender": "male",
            "experience_years": 24,
            "main_specialties": ["Facial Paralysis", "Bell's Palsy Treatment", "Nerve Grafting"]
        },
        {
            "specialty": "Aesthetic Dermatology",
            "gender": "female",
            "experience_years": 12,
            "main_specialties": ["Advanced Skin Treatments", "Pigmentation Correction", "Acne Scar Treatment"]
        },
        {
            "specialty": "Blepharoplasty Specialist",
            "gender": "male",
            "experience_years": 18,
            "main_specialties": ["Asian Eyelid Surgery", "Revision Blepharoplasty", "Lower Eyelid Surgery"]
        },
        {
            "specialty": "Injectable Expertise",
            "gender": "female",
            "experience_years": 10,
            "main_specialties": ["Advanced Filler Techniques", "Facial Volumization", "Jawline Sculpting with Fillers"]
        },
        {
            "specialty": "Brazilian Butt Lift Specialist",
            "gender": "male",
            "experience_years": 15,
            "main_specialties": ["BBL", "Buttock Enhancement", "Hip Augmentation"]
        },
        {
            "specialty": "Mommy Makeover Specialist",
            "gender": "female",
            "experience_years": 17,
            "main_specialties": ["Post-Pregnancy Body Restoration", "Combined Body Procedures", "Abdominal Restoration"]
        },
        {
            "specialty": "Male Aesthetic Surgery",
            "gender": "male",
            "experience_years": 19,
            "main_specialties": ["Male Facelift", "Male Rhinoplasty", "Male Body Contouring"]
        }
    ]

    for i, config in enumerate(surgeon_configs[:count]):
        print(f"Generating surgeon {i+1}/{count}...")
        surgeon = generate_surgeon_profile(**config)
        if surgeon:
            surgeons.append(surgeon)
            print(f"✓ Generated: {surgeon['name']}")
            # 打印完整的 JSON
            print("\n" + "=" * 60)
            print(f"医生 #{i+1} 完整信息:")
            print("=" * 60)
            print(json.dumps(surgeon, indent=2, ensure_ascii=False))
            print("=" * 60 + "\n")
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
        count = int(input("请输入要生成的医生数量 (1-50): ") or "50")
        count = min(max(1, count), 50)  # 限制在 1-50 之间
    except ValueError:
        count = 50

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
