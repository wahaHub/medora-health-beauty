# 医生信息批量生成器

这个 Python 脚本使用 OpenAI GPT-4 API 批量生成整容外科医生的专业信息和照片生成 prompt。

## 功能特点

- 自动生成医生的完整专业背景信息
- 包含教育经历、认证、专长等详细信息
- 生成专业的 bio（简介、专长描述、治疗理念）
- 自动生成 AI 图像 prompt 用于创建医生照片
- 支持批量生成（1-10 位医生）
- JSON 格式输出，易于集成到网站中

## 安装依赖

```bash
pip install openai
```

## 使用方法

### 1. 设置 OpenAI API Key

```bash
export OPENAI_API_KEY='your-api-key-here'
```

### 2. 运行脚本

```bash
cd scripts
python3 generate_surgeons.py
```

### 3. 按照提示操作

脚本会询问你要生成多少位医生（1-10），然后自动生成。

## 输出格式

脚本会生成一个 `surgeons_generated.json` 文件，包含所有医生的信息：

```json
[
  {
    "id": "zhang-yimei",
    "name": "Dr. Zhang Yimei",
    "title": "Board-Certified Plastic Surgeon",
    "specialties": [
      "Deep Plane Facelift",
      "Rhinoplasty",
      "Eyelid Surgery"
    ],
    "languages": ["English", "Mandarin Chinese"],
    "education": [
      "MD - Harvard Medical School",
      "Residency - Johns Hopkins Hospital",
      "Fellowship - Facial Plastic Surgery"
    ],
    "certifications": [
      "American Board of Plastic Surgery",
      "American Board of Facial Plastic Surgery"
    ],
    "experience_years": 20,
    "procedures_count": {
      "facelifts": 600,
      "rhinoplasty": 500,
      "eyelid_surgery": 800
    },
    "bio": {
      "intro": "Dr. Zhang is a double board-certified facial plastic surgeon with over 20 years of experience...",
      "expertise": "Dr. Zhang specializes in advanced facial rejuvenation techniques...",
      "philosophy": "Dr. Zhang believes in creating natural, harmonious results...",
      "achievements": [
        "Named Top Doctor by New York Magazine (2020-2024)",
        "Published over 50 peer-reviewed articles",
        "International lecturer and trainer"
      ]
    },
    "image_prompt": "Professional portrait photo of an Asian female plastic surgeon in her 40s, wearing a white medical coat over professional attire, standing in a modern medical office with soft natural lighting. She has a warm, confident smile, shoulder-length dark hair, and is positioned at a slight angle to the camera. The background shows blurred medical equipment and elegant office decor. High-quality, professional photography with shallow depth of field, approachable and trustworthy expression, medical professional aesthetic."
  }
]
```

## 生成的医生类型

脚本会生成不同类型的医生，包括：

1. **面部整形外科** - 主攻面部年轻化手术
2. **身体塑形** - 专注于身体轮廓改善
3. **乳房手术** - 乳房美容和重建
4. **重建外科** - 术后修复和创伤重建
5. **美容医学** - 非手术美容项目
6. 等等...

## 使用生成的图像 Prompt

生成的 `image_prompt` 可以直接用于：

- **DALL-E 3**: OpenAI 的图像生成工具
- **Midjourney**: 在 Discord 中使用
- **Stable Diffusion**: 本地或在线生成

示例使用 DALL-E 3：

```python
from openai import OpenAI

client = OpenAI()

response = client.images.generate(
    model="dall-e-3",
    prompt=surgeon_data["image_prompt"],
    size="1024x1024",
    quality="standard",
    n=1,
)

image_url = response.data[0].url
```

## 自定义配置

如果需要自定义医生配置，可以编辑脚本中的 `surgeon_configs` 列表：

```python
surgeon_configs = [
    {
        "specialty": "Facial Plastic Surgery",
        "gender": "male",
        "experience_years": 20,
        "main_specialties": ["Deep Plane Facelift", "Rhinoplasty", "Eyelid Surgery"]
    },
    # 添加更多配置...
]
```

## 注意事项

- 每次运行会使用 OpenAI API 的 tokens（每个医生约 1000-2000 tokens）
- 生成的信息是虚构的，用于演示和测试
- 建议在实际使用前review生成的内容
- 如需用于真实医生，请修改生成的信息以匹配实际情况

## 成本估算

使用 GPT-4o 模型：
- 每位医生约 $0.01-0.02 USD
- 生成 10 位医生约 $0.10-0.20 USD

## 故障排除

**问题**: `ModuleNotFoundError: No module named 'openai'`
**解决**: 运行 `pip install openai`

**问题**: `Error: API key not set`
**解决**: 确保设置了 `OPENAI_API_KEY` 环境变量

**问题**: 生成的内容不符合预期
**解决**: 修改 `SYSTEM_PROMPT` 或 `USER_PROMPT_TEMPLATE` 中的提示词

## 后续步骤

1. 生成医生信息
2. 使用 image_prompt 生成医生照片
3. 将照片上传到 R2 存储
4. 将 JSON 数据集成到网站中
5. 创建医生页面路由

## 相关文件

- `generate_surgeons.py` - 主脚本
- `surgeons_generated.json` - 输出文件
- `../data/surgeons.json` - 可以将生成的数据复制到这里
