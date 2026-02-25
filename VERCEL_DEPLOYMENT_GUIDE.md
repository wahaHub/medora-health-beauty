# Vercel 生产环境部署指南

## 📋 必需的环境变量

### 1. 应用配置
```bash
NEXT_PUBLIC_APP_URL=https://medical-crm-rouge.vercel.app
```

### 2. 数据库
```bash
DATABASE_URL=postgresql://postgres.zysulhfukqgnhfjufoip:Shenge%405816907@aws-1-us-east-2.pooler.supabase.com:5432/postgres?connection_limit=3
```

### 3. Keycloak 认证
```bash
KEYCLOAK_ISSUER=https://auth.medicaltourismchina.health/realms/medical-crm
NEXT_PUBLIC_KEYCLOAK_ISSUER=https://auth.medicaltourismchina.health/realms/medical-crm
KEYCLOAK_REALM=medical-crm
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=你的管理员密码
KEYCLOAK_CLIENT_ID=medical-crm
KEYCLOAK_CLIENT_SECRET=从 Keycloak Admin Console 获取
```

### 4. 邮件服务（Resend）
```bash
RESEND_API_KEY=re_PRy3SBfk_HPwyhtnNgyhc1nxB1uZd1VcM
EMAIL_FROM=MedCare <noreply@medicaltourismchina.health>
```

## 🔍 如何获取 Keycloak 凭证

### KEYCLOAK_ADMIN_PASSWORD
- 这是你创建 Keycloak 时设置的管理员密码
- 如果忘记，需要访问 Keycloak 的部署环境重置

### KEYCLOAK_CLIENT_SECRET
1. 访问 https://auth.medicaltourismchina.health/admin
2. 登录管理员账号
3. 选择 realm: `medical-crm`
4. 左侧菜单 → Clients → 点击 `medical-crm`
5. 切换到 Credentials 标签
6. 复制 Client Secret

## ⚠️ 部署后必做

1. **添加/修改环境变量后，必须重新部署：**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

2. **验证邮件功能：**
   - 访问 https://medical-crm-rouge.vercel.app/admin/hospitals/new
   - 创建测试医院，填写邮箱: contact@medicaltourismchina.health
   - 检查邮箱是否收到注册邀请

3. **查看部署日志：**
   - Vercel Dashboard → Deployments → Functions
   - 查找 `/api/admin/hospitals` 的日志
   - 确认看到 `✅ 邮件发送成功:` 而不是 `📧 [Mock] 发送邮件:`

## 🔒 安全提醒

⚠️ **你的 RESEND_API_KEY 已在聊天中暴露，建议立即更换：**

1. 访问 https://resend.com/api-keys
2. 删除旧的 API Key: `re_PRy3SBfk_HPwyhtnNgyhc1nxB1uZd1VcM`
3. 生成新的 API Key
4. 在 Vercel 更新 `RESEND_API_KEY` 环境变量
5. 重新部署应用

## 📝 验证域名（可选，推荐）

当前使用测试域名 `onboarding@resend.dev`，只能发送到注册邮箱。

如果需要发送到任意邮箱：
1. 访问 https://resend.com/domains
2. 添加域名 `medicaltourismchina.health`
3. 配置 DNS 记录（SPF, DKIM, DMARC）
4. 验证通过后，更新 `EMAIL_FROM` 为自定义发件人

## 🐛 常见问题

### 问题1: 创建医院后没收到邮件
- **原因**: RESEND_API_KEY 未配置或未重新部署
- **解决**: 确认 Vercel 环境变量已配置，并重新部署

### 问题2: Vercel 日志显示 [Mock] 发送邮件
- **原因**: RESEND_API_KEY 为空，进入 Mock 模式
- **解决**: 检查环境变量拼写，确保没有多余空格

### 问题3: Keycloak 注册失败
- **原因**: KEYCLOAK_ADMIN_PASSWORD 或 CLIENT_SECRET 错误
- **解决**: 重新从 Keycloak Admin Console 获取正确的凭证
