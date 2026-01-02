# ⚡ Terraform 快速开始 (5分钟)

使用 Terraform 自动配置 Cloudflare DNS、CDN 和安全防护。

---

## 📦 需要准备的信息

在开始之前，请准备以下信息：

### 1. Cloudflare Zone ID

```
登录: https://dash.cloudflare.com
→ 选择你的域名
→ Overview 页面右侧
→ 复制 "Zone ID"
```

### 2. Cloudflare Account ID

```
Cloudflare Dashboard
→ 右上角头像下拉菜单
→ 复制 "Account ID"
```

### 3. 你的域名

例如: `medorahealth.com`

---

## 🚀 开始部署 (3步)

### 步骤 1: 安装 Terraform

```bash
# macOS
brew install terraform

# 验证
terraform version
```

### 步骤 2: 配置信息

```bash
cd /Users/haowang/Desktop/medora-health-beauty/terraform

# 创建配置文件
cp terraform.tfvars.example terraform.tfvars

# 编辑配置 (填入上面准备的信息)
nano terraform.tfvars
```

在 `terraform.tfvars` 中填入:

```hcl
cloudflare_zone_id    = "你的-zone-id"
cloudflare_account_id = "你的-account-id"
domain_name           = "你的域名.com"
```

### 步骤 3: 部署

```bash
# 初始化
terraform init

# 查看计划
terraform plan

# 执行部署 (输入 yes 确认)
terraform apply
```

---

## ✅ 完成！

部署成功后，你的 Cloudflare 将自动配置：

- ✅ DNS 记录 (@ 和 www 指向 Vercel)
- ✅ SSL/TLS (Full strict + HSTS)
- ✅ CDN 加速 (Brotli, HTTP/3)
- ✅ 缓存优化 (静态资源 30 天)
- ✅ 安全防护 (Firewall + WAF + Rate Limiting)
- ✅ 性能优化 (Minify, Early Hints)

访问你的网站: `https://你的域名.com`

---

## 🔍 验证部署

```bash
# 检查 DNS
dig 你的域名.com

# 检查 HTTPS
curl -I https://你的域名.com
```

---

## 📚 详细文档

查看完整文档: `terraform/README.md`

---

## 🆘 遇到问题？

### 常见问题:

1. **API Token 错误**
   - 检查 `variables.tf` 中的 token
   - 确认 token 有 Zone.DNS 和 Zone Settings 权限

2. **Zone ID 错误**
   - 重新检查 Cloudflare Dashboard
   - 确认域名已添加到 Cloudflare

3. **DNS 未生效**
   - 等待 DNS 传播 (最多 24 小时)
   - 使用 `dig` 或 https://dnschecker.org 检查

---

**预计时间**: 5-10 分钟 ⏱️  
**难度**: 简单 ⭐

