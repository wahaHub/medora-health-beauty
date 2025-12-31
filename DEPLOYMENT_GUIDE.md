# 🚀 Medora Health & Beauty 部署指南

## 📋 目录
1. [项目架构](#项目架构)
2. [部署前准备](#部署前准备)
3. [Supabase 配置](#supabase-配置)
4. [Vercel 部署（前端）](#vercel-部署前端)
5. [Cloudflare 配置](#cloudflare-配置)
6. [环境变量配置](#环境变量配置)
7. [域名配置](#域名配置)
8. [部署检查清单](#部署检查清单)

---

## 🏗️ 项目架构

```
┌─────────────────┐
│   用户浏览器     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Cloudflare    │ ← DNS + CDN + 安全防护
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Vercel      │ ← 前端托管（React + Vite）
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Supabase     │ ← 后端数据库 + API
└─────────────────┘
```

**技术栈：**
- **前端**: React 19 + TypeScript + Vite + React Router + Tailwind CSS
- **后端**: Supabase (PostgreSQL + REST API)
- **AI**: Google Gemini API
- **部署**: Vercel (前端) + Cloudflare (DNS/CDN)

---

## 📦 部署前准备

### 1. **必需的账号**

| 服务 | 用途 | 链接 | 费用 |
|------|------|------|------|
| **Vercel** | 前端部署 | https://vercel.com | 免费（Hobby Plan） |
| **Cloudflare** | DNS + CDN | https://cloudflare.com | 免费（Free Plan） |
| **Supabase** | 数据库 + API | https://supabase.com | 已有账号 |
| **GitHub** | 代码托管 | https://github.com | 免费 |

### 2. **域名准备**

- [ ] 购买域名（推荐：Namecheap, GoDaddy, Cloudflare Registrar）
- [ ] 例如：`medorahealth.com` 或 `medora-beauty.com`

### 3. **API Keys 收集**

需要准备以下 API Keys：

| API Key | 从哪获取 | 用途 |
|---------|---------|------|
| `VITE_SUPABASE_URL` | Supabase Dashboard | 数据库连接 |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard | 公开 API 访问 |
| `VITE_GEMINI_API_KEY` | Google AI Studio | AI 聊天功能 |

---

## 🗄️ Supabase 配置

### 1. **确认数据库已部署**

登录 Supabase Dashboard: https://supabase.com/dashboard

```bash
# 检查以下表是否存在：
✅ procedures
✅ procedure_benefits
✅ procedure_candidacy
✅ procedure_techniques
✅ procedure_recovery_timeline
✅ procedure_recovery_tips
✅ procedure_risks
✅ complementary_procedures
✅ cases
✅ case_translations
✅ case_photos
✅ case_procedures
```

### 2. **获取 Supabase Credentials**

在 Supabase Dashboard:

1. 进入你的项目
2. 点击 **Settings** → **API**
3. 复制以下信息：

```bash
Project URL: https://yamlikuqgmqiigeaqzaz.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. **数据库权限设置**

确保 Row Level Security (RLS) 已正确配置：

```sql
-- 公开读取权限（所有表）
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON procedures FOR SELECT USING (true);

-- 对所有相关表重复上述操作
```

### 4. **数据导入确认**

```bash
# 本地运行数据导入（如果还没导入）
cd /Users/haowang/Desktop/medora-health-beauty
node import-to-supabase.js
node import-sample-cases.js
```

---

## 🚢 Vercel 部署（前端）

### 步骤 1: 准备代码仓库

```bash
# 1. 初始化 Git（如果还没有）
cd /Users/haowang/Desktop/medora-health-beauty
git init

# 2. 创建 .gitignore（如果没有）
cat > .gitignore << 'EOF'
# dependencies
node_modules
.pnpm-debug.log*

# production
dist
dist-ssr
*.local

# environment variables
.env
.env.local
.env.production.local

# IDE
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store

# misc
*.log
.cache
EOF

# 3. 提交代码
git add .
git commit -m "Initial commit"

# 4. 推送到 GitHub
# 先在 GitHub 创建一个新仓库（例如：medora-health-beauty）
git remote add origin https://github.com/YOUR_USERNAME/medora-health-beauty.git
git branch -M main
git push -u origin main
```

### 步骤 2: 在 Vercel 创建项目

1. **登录 Vercel**: https://vercel.com/login
2. **Import Project**:
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 连接 GitHub 并选择你的仓库

3. **配置构建设置**:

```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. **Root Directory**: 留空（根目录）

### 步骤 3: 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables，添加：

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://yamlikuqgmqiigeaqzaz.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `VITE_GEMINI_API_KEY` | `你的 Gemini API Key` | Production, Preview, Development |

**⚠️ 重要**: 
- Vite 环境变量必须以 `VITE_` 开头
- 所有环境都要添加（Production, Preview, Development）

### 步骤 4: 部署

点击 **Deploy** 按钮，等待构建完成（约 2-3 分钟）

部署成功后，你会得到一个 Vercel 域名：
```
https://medora-health-beauty.vercel.app
```

### 步骤 5: 测试部署

访问 Vercel 提供的 URL，检查：
- [ ] 首页加载正常
- [ ] 图片显示正常
- [ ] 手术详情页加载（测试：`/procedure/Facelift`）
- [ ] Gallery 页面正常
- [ ] AI 聊天功能正常

---

## ☁️ Cloudflare 配置

### 步骤 1: 添加网站到 Cloudflare

1. **登录 Cloudflare**: https://dash.cloudflare.com
2. **添加站点**:
   - 点击 "Add a Site"
   - 输入你的域名（例如：`medorahealth.com`）
   - 选择 Free Plan
   - 点击 "Continue"

3. **更新 Nameservers**:
   - Cloudflare 会提供两个 nameservers：
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - 到你的域名注册商（Namecheap/GoDaddy）修改 nameservers
   - 等待 DNS 传播（最多 24 小时，通常几分钟）

### 步骤 2: 配置 DNS 记录

在 Cloudflare Dashboard → DNS → Records，添加：

#### A. 主域名指向 Vercel

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| CNAME | @ | `cname.vercel-dns.com` | ✅ Proxied | Auto |
| CNAME | www | `cname.vercel-dns.com` | ✅ Proxied | Auto |

**或者使用 A 记录**（推荐 CNAME）：

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| A | @ | `76.76.21.21` | ✅ Proxied | Auto |
| A | www | `76.76.21.21` | ✅ Proxied | Auto |

> 💡 Vercel 的 IP 地址可能变化，推荐使用 CNAME

### 步骤 3: 在 Vercel 添加自定义域名

1. 回到 **Vercel Dashboard** → 你的项目 → **Settings** → **Domains**
2. 添加域名：
   ```
   medorahealth.com
   www.medorahealth.com
   ```
3. Vercel 会自动验证并配置 SSL

### 步骤 4: 配置 Cloudflare 设置

#### SSL/TLS 设置

1. **SSL/TLS** → **Overview**:
   - 选择 **Full (strict)**
   
2. **Edge Certificates**:
   - ✅ Always Use HTTPS: ON
   - ✅ HTTP Strict Transport Security (HSTS): ON
   - ✅ Minimum TLS Version: TLS 1.2
   - ✅ Automatic HTTPS Rewrites: ON

#### Speed 优化

1. **Speed** → **Optimization**:
   - ✅ Auto Minify: HTML, CSS, JavaScript
   - ✅ Brotli: ON
   - ✅ Early Hints: ON
   - ✅ Rocket Loader: OFF (可能与 React 冲突)

2. **Caching**:
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

#### Security 设置

1. **Security** → **Settings**:
   - Security Level: Medium
   - ✅ Browser Integrity Check: ON
   - ✅ Challenge Passage: 30 minutes

2. **Firewall Rules**（可选）:
   ```
   阻止非中国/美国流量（如果只服务特定地区）
   ```

#### Page Rules（优化）

创建以下 Page Rules：

| URL Pattern | Settings |
|-------------|----------|
| `medorahealth.com/static/*` | Cache Level: Cache Everything, Edge Cache TTL: 1 month |
| `medorahealth.com/*.jpg` | Cache Level: Cache Everything, Edge Cache TTL: 1 month |
| `medorahealth.com/*.png` | Cache Level: Cache Everything, Edge Cache TTL: 1 month |
| `www.medorahealth.com/*` | Forwarding URL (301) → https://medorahealth.com/$1 |

---

## 🔐 环境变量配置

### 本地开发环境

创建 `.env.local` 文件：

```bash
# Supabase
VITE_SUPABASE_URL=https://yamlikuqgmqiigeaqzaz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API
VITE_GEMINI_API_KEY=AIzaSy...
```

### Vercel 生产环境

在 Vercel Dashboard 添加（已在上面说明）

### 环境变量使用

在代码中使用：

```typescript
// ✅ 正确 - Vite 方式
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❌ 错误 - Node.js 方式（Vite 不支持）
const supabaseUrl = process.env.VITE_SUPABASE_URL;
```

---

## 🌐 域名配置

### 推荐域名结构

```
主站: https://medorahealth.com
Gallery: https://medorahealth.com/gallery
手术页: https://medorahealth.com/procedure/[name]
团队页: https://medorahealth.com/our-team
医生页: https://medorahealth.com/surgeon/[name]
```

### 自定义域名绑定

1. **在 Vercel 添加域名**:
   ```
   medorahealth.com
   www.medorahealth.com
   ```

2. **在 Cloudflare 添加 DNS 记录** (已在上面说明)

3. **等待 SSL 证书生成**:
   - Vercel 自动提供 Let's Encrypt SSL
   - 通常 1-5 分钟完成

4. **测试**:
   ```bash
   curl -I https://medorahealth.com
   # 应该返回 200 OK
   ```

---

## ✅ 部署检查清单

### 部署前

- [ ] 代码已推送到 GitHub
- [ ] 所有数据已导入 Supabase
- [ ] Supabase RLS 权限已配置
- [ ] 环境变量已准备好
- [ ] 域名已购买（如果使用自定义域名）

### Vercel 部署

- [ ] 项目已从 GitHub 导入
- [ ] 构建设置正确（Vite, `npm run build`, `dist`）
- [ ] 环境变量已添加（3个：SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY）
- [ ] 首次部署成功
- [ ] Vercel 域名可访问

### Cloudflare 配置

- [ ] 域名已添加到 Cloudflare
- [ ] Nameservers 已更新
- [ ] DNS 记录已配置（CNAME 指向 Vercel）
- [ ] SSL/TLS 设置为 Full (strict)
- [ ] Always Use HTTPS 已启用
- [ ] 缓存规则已配置

### 自定义域名

- [ ] 域名已添加到 Vercel
- [ ] DNS 传播完成（可用 https://dnschecker.org 检查）
- [ ] SSL 证书已生成
- [ ] HTTPS 正常工作
- [ ] www 重定向到主域名

### 功能测试

- [ ] 首页加载正常
- [ ] 导航菜单工作正常
- [ ] 手术详情页加载数据（测试多个手术）
- [ ] Gallery 页面正常
- [ ] 图片加载正常
- [ ] AI 聊天功能正常
- [ ] 表单提交正常
- [ ] 移动端显示正常
- [ ] 页面加载速度 < 3秒

---

## 🔧 故障排查

### 1. **部署失败**

```bash
# 检查构建日志
# 常见问题：
- 环境变量缺失 → 添加所有 VITE_ 开头的变量
- TypeScript 错误 → 本地运行 npm run build 检查
- 依赖问题 → 删除 node_modules 重新安装
```

### 2. **数据不显示**

```bash
# 检查 Supabase 连接
- 确认环境变量正确
- 检查 Supabase RLS 权限
- 在浏览器 Console 查看错误信息
```

### 3. **域名不解析**

```bash
# 检查 DNS
dig medorahealth.com
nslookup medorahealth.com

# 等待 DNS 传播（最多 24 小时）
```

### 4. **SSL 证书错误**

```bash
# 在 Vercel 重新生成证书
# 确保 Cloudflare SSL 模式为 Full (strict)
```

### 5. **页面加载慢**

```bash
# 检查 Cloudflare 缓存设置
# 优化图片（使用 WebP 格式）
# 启用 Brotli 压缩
```

---

## 📞 需要帮助？

### 文档资源

- Vercel Docs: https://vercel.com/docs
- Cloudflare Docs: https://developers.cloudflare.com
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev

### 常用命令

```bash
# 本地开发
npm run dev

# 本地构建测试
npm run build
npm run preview

# 数据导入
npm run import-data
npm run import-cases

# Git 推送
git add .
git commit -m "Update"
git push
```

---

## 🎉 部署完成！

当所有检查清单都完成后，你的网站就已经成功部署了！

**访问你的网站**: https://medorahealth.com

**监控和维护**:
- Vercel Dashboard: 查看部署日志和分析
- Cloudflare Dashboard: 查看流量和安全事件
- Supabase Dashboard: 查看数据库使用情况

---

**创建日期**: 2025-01-01  
**版本**: 1.0  
**项目**: Medora Health & Beauty

