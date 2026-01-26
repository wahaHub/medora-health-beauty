# Medora Health Beauty 项目重构计划

## 📊 当前问题分析

### 1. 根目录混乱
当前根目录有 **太多文件**，混杂了：
- 文档文件 (`.md`)
- 配置文件
- 源代码文件 (`App.tsx`, `index.tsx`, `types.ts`)
- Python 脚本
- JavaScript 工具脚本

### 2. 重复的文件夹
- `admin/public/` 和 `public/admin/` 内容几乎相同
- `dist/admin/` 是构建产物，也有相同内容

### 3. 文档散落
多个 `.md` 文档文件散落在根目录：
- `ADMIN_UPLOAD_SUMMARY.md`
- `CASE_ALLOCATION_PLAN.md`
- `CLOUDFLARE_MANUAL_SETUP.md`
- `ENV_TEMPLATE.md`
- `PROCEDURE_PROMPTS_REVIEW.md`
- `R2_QUICKSTART.md`
- `SUPABASE_SETUP.md`
- `TERRAFORM_QUICKSTART.md`

### 4. 脚本文件混乱
- 根目录有 Python 脚本 (`generate_procedure_hero_images.py`)
- 根目录有 JS 脚本 (`add-nav-translations.js`)
- `scripts/` 文件夹也有脚本
- `__pycache__/` 不应该被追踪

### 5. 照片/资源文件
- `photos/` 文件夹过大，不应在代码仓库中
- 应该使用 R2/CDN 存储

### 6. API 结构问题
- `api/` 下有重复文件 (`surgeons.js` 和 `admin/surgeons-full.js`)
- `api/update-surgeon-image.js` 和 `api/admin/update-surgeon-image.js` 重复

### 7. 翻译文件分散
- `i18n/` 文件夹
- `translations/` 文件夹
- 功能类似但分开存放

---

## 🎯 重构目标

1. **清晰的目录结构** - 让项目一目了然
2. **减少重复** - 合并重复的文件和文件夹
3. **分离关注点** - 文档、脚本、源码分开
4. **保持功能不变** - 重构不影响现有功能

---

## 📁 建议的新目录结构

```
medora-health-beauty/
├── .claude/                    # Claude 配置 (保留)
├── .env                        # 环境变量 (保留)
├── .env.local                  # 本地环境变量 (保留)
├── .gitignore                  # Git 忽略配置 (更新)
│
├── docs/                       # 📚 所有文档
│   ├── README.md               # 项目主文档
│   ├── setup/                  # 部署和配置文档
│   │   ├── CLOUDFLARE_MANUAL_SETUP.md
│   │   ├── ENV_TEMPLATE.md
│   │   ├── R2_QUICKSTART.md
│   │   ├── SUPABASE_SETUP.md
│   │   └── TERRAFORM_QUICKSTART.md
│   ├── admin/                  # 管理后台文档
│   │   └── ADMIN_UPLOAD_SUMMARY.md
│   └── data/                   # 数据相关文档
│       ├── CASE_ALLOCATION_PLAN.md
│       └── PROCEDURE_PROMPTS_REVIEW.md
│
├── src/                        # 🎨 前端源代码
│   ├── App.tsx                 # 主应用组件
│   ├── index.tsx               # 入口文件
│   ├── types.ts                # 类型定义
│   ├── components/             # React 组件
│   │   ├── layout/             # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── LanguageSelector.tsx
│   │   ├── pages/              # 页面组件
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── ReviewsPage.tsx
│   │   │   ├── TravelPage.tsx
│   │   │   ├── AllSurgeons.tsx
│   │   │   └── ProceduresList.tsx
│   │   ├── procedure/          # 手术相关组件
│   │   │   ├── ProcedureDetail.tsx
│   │   │   ├── ProcedureGallery.tsx
│   │   │   ├── CaseDetail.tsx
│   │   │   └── Categories.tsx
│   │   ├── surgeon/            # 医生相关组件
│   │   │   ├── SurgeonProfile.tsx
│   │   │   ├── Doctors.tsx
│   │   │   ├── OurTeam.tsx
│   │   │   └── TeamIntro.tsx
│   │   ├── home/               # 首页组件
│   │   │   ├── Hero.tsx
│   │   │   ├── Intro.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Reputation.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Partnership.tsx
│   │   │   └── GalleryCTA.tsx
│   │   └── shared/             # 共享组件
│   │       ├── ChatWidget.tsx
│   │       ├── PatientForm.tsx
│   │       ├── SearchBar.tsx
│   │       └── TravelProgram.tsx
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useScrollReveal.ts
│   │   └── useTranslation.ts
│   ├── contexts/               # React Contexts
│   │   └── LanguageContext.tsx
│   ├── services/               # 服务层
│   │   ├── geminiService.ts
│   │   └── supabaseClient.ts
│   ├── config/                 # 配置文件
│   │   ├── cloudflare.ts
│   │   └── images.ts
│   ├── utils/                  # 工具函数
│   │   └── imageUtils.ts
│   └── i18n/                   # 国际化
│       ├── translations.ts
│       └── procedureNames.json
│
├── api/                        # 🔌 API 路由 (Vercel Functions)
│   ├── _utils/                 # API 工具函数
│   │   ├── auth.js
│   │   └── r2.js
│   ├── public/                 # 公开 API
│   │   ├── surgeons.js
│   │   └── surgeons-full.js
│   └── admin/                  # 管理 API
│       ├── login.js
│       ├── cases.js
│       ├── delete.js
│       ├── images.js
│       ├── upload.js
│       └── update-surgeon-image.js
│
├── admin/                      # 🛠️ 管理后台 (静态页面)
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── surgeons-manager.html
│   ├── procedures-manager.html
│   ├── gallery-manager.html
│   ├── reviews-manager.html
│   └── js/                     # 管理后台 JS
│       ├── auth.js
│       ├── image-slots-config.js
│       ├── procedures-categories.js
│       ├── site-images-config.js
│       └── surgeons-data.js
│
├── scripts/                    # 🔧 工具脚本
│   ├── python/                 # Python 脚本
│   │   ├── deploy.py
│   │   ├── generate_surgeons.py
│   │   ├── generate_procedure_hero_images.py
│   │   ├── setup_and_update_translations.py
│   │   └── translate_surgeons.py
│   ├── node/                   # Node.js 脚本
│   │   └── add-nav-translations.js
│   └── data/                   # 脚本生成的数据
│       ├── surgeons_generated.json
│       └── surgeons_translations.json
│
├── migrations/                 # 🗄️ 数据库迁移 (保留)
│   ├── 000_complete_schema.sql
│   └── 002_populate_surgeon_ids.sql
│
├── terraform/                  # ☁️ 基础设施代码 (保留)
│
├── translations/               # 🌐 翻译文件 (保留，可考虑合并到 src/i18n)
│
├── public/                     # 📦 静态资源
│   ├── _headers
│   ├── _redirects
│   └── index.css
│
├── dist/                       # 🏗️ 构建输出 (自动生成，gitignore)
│
├── index.html                  # HTML 入口 (Vite 需要)
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
└── README.md                   # 项目简介
```

---

## 📋 重构步骤

### 阶段 1: 整理文档 (低风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 1.1 | 创建 `docs/` 文件夹 | 无 |
| 1.2 | 移动所有 `.md` 文档到 `docs/` | 无 |
| 1.3 | 创建子文件夹 `docs/setup/`, `docs/admin/`, `docs/data/` | 无 |
| 1.4 | 分类移动文档 | 无 |

**命令：**
```bash
mkdir -p docs/setup docs/admin docs/data

# 移动文档
mv CLOUDFLARE_MANUAL_SETUP.md docs/setup/
mv ENV_TEMPLATE.md docs/setup/
mv R2_QUICKSTART.md docs/setup/
mv SUPABASE_SETUP.md docs/setup/
mv TERRAFORM_QUICKSTART.md docs/setup/
mv ADMIN_UPLOAD_SUMMARY.md docs/admin/
mv CASE_ALLOCATION_PLAN.md docs/data/
mv PROCEDURE_PROMPTS_REVIEW.md docs/data/
```

### 阶段 2: 整理脚本 (低风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 2.1 | 创建 `scripts/python/` 和 `scripts/node/` | 无 |
| 2.2 | 移动 Python 脚本 | 无 |
| 2.3 | 移动 Node.js 脚本 | 无 |
| 2.4 | 移动数据文件到 `scripts/data/` | 无 |
| 2.5 | 删除 `__pycache__/` | 无 |

**命令：**
```bash
mkdir -p scripts/python scripts/node scripts/data

# 移动 Python 脚本
mv generate_procedure_hero_images.py scripts/python/
mv scripts/deploy.py scripts/python/
mv scripts/generate_surgeons.py scripts/python/
mv scripts/setup_and_update_translations.py scripts/python/
mv scripts/translate_surgeons.py scripts/python/

# 移动 Node 脚本
mv add-nav-translations.js scripts/node/

# 移动数据文件
mv scripts/surgeons_generated.json scripts/data/
mv scripts/surgeons_translations.json scripts/data/

# 清理
rm -rf __pycache__
```

### 阶段 3: 创建 src 目录结构 (中风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 3.1 | 创建 `src/` 及子目录 | 无 |
| 3.2 | 移动源代码文件 | 中 - 需要更新导入路径 |
| 3.3 | 更新 `vite.config.ts` | 中 |
| 3.4 | 更新 `tsconfig.json` | 中 |
| 3.5 | 测试构建 | - |

**注意：** 这一步需要更新所有导入路径，建议使用 IDE 的重构功能。

### 阶段 4: 整理组件 (中风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 4.1 | 创建组件子目录 | 无 |
| 4.2 | 按功能分类移动组件 | 中 - 需要更新导入 |
| 4.3 | 更新所有导入路径 | 中 |

### 阶段 5: 清理 admin 重复 (中风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 5.1 | 确认 `admin/public/` 和 `public/admin/` 内容一致 | 无 |
| 5.2 | 删除 `admin/public/`，保留 `public/admin/` | 低 |
| 5.3 | 或者重构为单一 admin 目录 | 中 |

### 阶段 6: 清理 API 重复 (低风险)

| 步骤 | 操作 | 风险 |
|------|------|------|
| 6.1 | 删除根目录重复的 API 文件 | 低 |
| 6.2 | 确保 `vercel.json` 路由正确 | 中 |

### 阶段 7: 更新 .gitignore (无风险)

添加以下内容：
```gitignore
# Python
__pycache__/
*.pyc
.venv/

# Build
dist/

# Photos (should be in R2/CDN)
photos/

# IDE
.DS_Store
```

---

## ⚠️ 风险评估

| 操作 | 风险等级 | 说明 |
|------|----------|------|
| 移动文档 | 🟢 低 | 不影响代码 |
| 移动脚本 | 🟢 低 | 手动执行，不影响运行 |
| 创建 src 目录 | 🟡 中 | 需要更新配置和导入 |
| 组件分类 | 🟡 中 | 需要更新大量导入 |
| 清理重复 | 🟡 中 | 需要验证功能 |

---

## 🚀 建议执行顺序

1. **先做阶段 1-2** (低风险) - 整理文档和脚本
2. **更新 .gitignore** (阶段 7)
3. **暂时保留** 阶段 3-6，等项目稳定后再做

---

## 📝 可选的进一步优化

1. **合并翻译文件夹** - 将 `translations/` 合并到 `src/i18n/`
2. **移除 photos 文件夹** - 全部使用 R2 CDN
3. **添加 ESLint/Prettier** - 代码规范
4. **添加 Husky** - Git hooks
5. **添加单元测试** - Jest/Vitest

---

## ✅ 重构检查清单

- [ ] 文档整理完成
- [ ] 脚本整理完成
- [ ] .gitignore 更新
- [ ] 本地开发正常 (`npm run dev`)
- [ ] 构建成功 (`npm run build`)
- [ ] Vercel 部署正常
- [ ] Admin 后台功能正常
- [ ] API 接口正常

---

**创建日期**: 2026-01-26
**作者**: Claude Code
