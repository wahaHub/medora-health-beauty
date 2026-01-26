# 环境变量配置模板

复制以下内容到 `.env` 文件：

```bash
# ==================== Supabase 配置 ====================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ==================== Gemini AI 配置 ====================
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# ==================== Cloudflare R2 配置 ====================
# 在 Cloudflare Dashboard -> R2 -> Manage R2 API Tokens 中创建
R2_ACCOUNT_ID=你的账号ID
R2_ACCESS_KEY_ID=你的Access_Key
R2_SECRET_ACCESS_KEY=你的Secret_Key
R2_BUCKET_NAME=medora-images
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev

# Cloudflare R2 自定义域名（可选）
VITE_R2_CUSTOM_DOMAIN=https://images.medorahealth.com

# ==================== Admin Console 配置 ====================
# 管理后台登录凭证（请修改为复杂密码！）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-to-secure-password-123

# 管理后台端口
ADMIN_PORT=5000

# Session 密钥（请修改为随机字符串！）
SESSION_SECRET=change-this-to-random-secret-key-xyz

# ==================== 其他配置 ====================
NODE_VERSION=20.11.0
```

## 🔐 重要提示

1. **不要提交 `.env` 文件到 Git！**
2. **修改默认密码！** `ADMIN_PASSWORD` 必须改成复杂密码
3. **修改 `SESSION_SECRET`** 为随机字符串（至少 32 位）
4. **保管好 R2 凭证**，这些是敏感信息

## 📝 快速生成随机密钥

```bash
# 生成随机 Session Secret (macOS/Linux)
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

