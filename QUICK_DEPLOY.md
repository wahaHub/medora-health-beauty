# ⚡ 快速部署指南（5分钟版本）

如果你想快速部署，按照这个简化版本执行即可。

---

## 🚀 第一步：准备 GitHub 仓库（2分钟）

```bash
cd /Users/haowang/Desktop/medora-health-beauty

# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub（先在 GitHub 创建仓库）
git remote add origin https://github.com/YOUR_USERNAME/medora-health-beauty.git
git branch -M main
git push -u origin main
```

---

## 🌐 第二步：Vercel 部署（2分钟）

1. 访问: https://vercel.com/new
2. 导入 GitHub 仓库
3. 配置构建:
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```

4. 添加环境变量:
   ```
   VITE_SUPABASE_URL = https://yamlikuqgmqiigeaqzaz.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_GEMINI_API_KEY = 你的 Gemini API Key
   ```

5. 点击 **Deploy**

✅ 完成！你会得到: `https://your-project.vercel.app`

---

## ☁️ 第三步：Cloudflare + 自定义域名（1分钟）

### A. 添加域名到 Cloudflare
1. https://dash.cloudflare.com → Add Site
2. 输入域名 → 选择 Free Plan
3. 更新域名的 Nameservers

### B. 配置 DNS
添加记录:
```
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: ON
```

### C. 在 Vercel 添加域名
1. Vercel → Settings → Domains
2. 添加你的域名
3. 等待 SSL 生成（1-5分钟）

✅ 完成！访问: `https://yourdomain.com`

---

## 🔍 验证部署

```bash
# 检查网站
✅ 首页: https://yourdomain.com
✅ Gallery: https://yourdomain.com/gallery  
✅ 手术页: https://yourdomain.com/procedure/Facelift
✅ HTTPS 工作
✅ 移动端正常
```

---

## 🆘 遇到问题？

### 部署失败
→ 检查 Vercel 构建日志，确认环境变量

### 数据不显示
→ 检查 Supabase 环境变量是否正确

### 域名不解析
→ 等待 DNS 传播（最多 24 小时）

### 详细文档
→ 查看 `DEPLOYMENT_GUIDE.md`

---

**完成时间**: 约 5-10 分钟 ⏱️

