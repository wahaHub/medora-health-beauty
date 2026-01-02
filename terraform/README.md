# 🚀 Cloudflare Terraform 配置

使用 Terraform 自动化配置 Cloudflare 的 DNS、CDN、SSL/TLS 和安全防护。

---

## 📋 前提条件

- ✅ Terraform 已安装 (v1.0+)
- ✅ Cloudflare API Token: `nlgGhLpemq96nd3bEEUyFiqkwwfTxyg-tLG95U8a`
- ✅ Vercel 部署: `medora-health-beauty.vercel.app`
- ✅ 域名已添加到 Cloudflare

---

## 🛠️ 安装 Terraform

### macOS (使用 Homebrew):
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### 验证安装:
```bash
terraform version
# 应该显示: Terraform v1.x.x
```

---

## ⚙️ 配置步骤

### 步骤 1: 获取必需信息

#### A. Cloudflare Zone ID

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
2. 选择你的域名
3. 在 **Overview** 页面右侧找到 **Zone ID**
4. 复制 Zone ID (格式: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

#### B. Cloudflare Account ID

1. 在 Cloudflare Dashboard
2. 点击右上角头像
3. 下拉菜单中找到 **Account ID**
4. 复制 Account ID

#### C. 你的域名

确定你要使用的域名 (例如: `medorahealth.com`)

### 步骤 2: 创建配置文件

```bash
cd /Users/haowang/Desktop/medora-health-beauty/terraform

# 复制示例配置文件
cp terraform.tfvars.example terraform.tfvars

# 编辑配置文件
nano terraform.tfvars
# 或者
code terraform.tfvars
```

### 步骤 3: 填写配置信息

在 `terraform.tfvars` 中填入:

```hcl
cloudflare_zone_id    = "你的-zone-id"
cloudflare_account_id = "你的-account-id"
domain_name           = "你的域名.com"
```

**示例**:
```hcl
cloudflare_zone_id    = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
cloudflare_account_id = "1234567890abcdef1234567890abcdef"
domain_name           = "medorahealth.com"
```

---

## 🚀 部署

### 步骤 1: 初始化 Terraform

```bash
cd /Users/haowang/Desktop/medora-health-beauty/terraform
terraform init
```

**预期输出**:
```
Initializing the backend...
Initializing provider plugins...
- Installing cloudflare/cloudflare v4.x.x...
Terraform has been successfully initialized!
```

### 步骤 2: 预览更改

```bash
terraform plan
```

**预期输出**: 会显示将要创建的所有资源:
```
Plan: 15 to add, 0 to change, 0 to destroy.
```

查看输出，确认配置正确。

### 步骤 3: 应用配置

```bash
terraform apply
```

输入 `yes` 确认执行。

**预期输出**:
```
Apply complete! Resources: 15 added, 0 changed, 0 destroyed.

Outputs:

deployment_url = "https://medorahealth.com"
dns_records = {
  "root" = "medorahealth.com"
  "www" = "www.medorahealth.com"
}
ssl_status = "Full (strict) with HSTS enabled"
```

---

## ✅ 部署后验证

### 1. 检查 DNS 记录

```bash
# 查看 DNS 记录
dig medorahealth.com

# 或者使用在线工具
# https://dnschecker.org
```

### 2. 检查 SSL/TLS

```bash
# 访问网站
curl -I https://medorahealth.com

# 应该返回 200 OK 和 HTTPS
```

### 3. 在 Cloudflare Dashboard 验证

登录 Cloudflare Dashboard，检查:

- ✅ **DNS**: 记录已创建 (@, www)
- ✅ **SSL/TLS**: 模式为 Full (strict)
- ✅ **Speed**: Brotli, Minify 已启用
- ✅ **Security**: Firewall rules 已创建
- ✅ **Page Rules**: 缓存规则已设置

---

## 📊 Terraform 创建的资源

### DNS 记录:
- ✅ `@` (root) → CNAME to Vercel (Proxied)
- ✅ `www` → CNAME to Vercel (Proxied)

### SSL/TLS 设置:
- ✅ SSL Mode: Full (strict)
- ✅ Always Use HTTPS: ON
- ✅ HSTS: Enabled (1 year, preload)
- ✅ Minimum TLS: 1.2
- ✅ TLS 1.3: ON

### 性能优化:
- ✅ Brotli Compression: ON
- ✅ Auto Minify: HTML, CSS, JS
- ✅ Early Hints: ON
- ✅ HTTP/2: ON
- ✅ HTTP/3 (QUIC): ON

### 缓存规则 (Page Rules):
- ✅ `/assets/*` → Cache Everything (30 days)
- ✅ `/*.{jpg,png,gif,webp}` → Cache Everything (30 days)
- ✅ `/*.{css,js}` → Cache Everything (7 days)
- ✅ `www.*` → Redirect to non-www (301)

### 安全防护 (Firewall):
- ✅ Block bad bots (threat score > 30)
- ✅ Challenge suspicious traffic (threat score 10-30)
- ✅ Rate limiting (100 req/min)
- ✅ WAF Managed Ruleset: Enabled

---

## 🔄 更新配置

如果需要修改配置:

### 1. 编辑 Terraform 文件

```bash
# 编辑主配置
nano terraform/main.tf

# 或编辑变量
nano terraform/terraform.tfvars
```

### 2. 查看更改

```bash
terraform plan
```

### 3. 应用更改

```bash
terraform apply
```

---

## 🗑️ 删除所有资源

**⚠️ 警告**: 这会删除所有 Terraform 管理的资源！

```bash
terraform destroy
```

输入 `yes` 确认。

---

## 📝 常见任务

### 查看当前状态

```bash
terraform show
```

### 查看输出信息

```bash
terraform output
```

### 刷新状态

```bash
terraform refresh
```

### 格式化代码

```bash
terraform fmt
```

### 验证配置

```bash
terraform validate
```

---

## 🔍 故障排查

### 问题 1: `Error: Invalid API Token`

**原因**: API Token 无效或权限不足

**解决**:
1. 检查 `variables.tf` 中的 token
2. 确认 token 有以下权限:
   - Zone.DNS: Edit
   - Zone.Zone Settings: Edit
   - Zone.Zone: Read
   - Account.Account Settings: Read

### 问题 2: `Error: Zone not found`

**原因**: Zone ID 错误

**解决**:
1. 重新检查 Cloudflare Dashboard 中的 Zone ID
2. 确认域名已添加到 Cloudflare

### 问题 3: `Error: Resource already exists`

**原因**: 资源已手动创建

**解决**:
```bash
# 导入已存在的资源
terraform import cloudflare_record.root <record-id>

# 或者删除手动创建的资源
```

### 问题 4: DNS 未生效

**原因**: DNS 传播需要时间

**解决**:
```bash
# 等待 DNS 传播 (最多 24 小时，通常几分钟)
# 检查传播状态
dig medorahealth.com
```

---

## 🔐 安全最佳实践

### 1. 保护 API Token

```bash
# 不要提交 terraform.tfvars 到 Git
echo "terraform.tfvars" >> .gitignore

# 使用环境变量 (可选)
export TF_VAR_cloudflare_api_token="your-token"
```

### 2. 使用 Terraform Cloud (可选)

更安全的方式是使用 Terraform Cloud 存储状态:

1. 注册 Terraform Cloud: https://app.terraform.io
2. 创建 Organization
3. 创建 Workspace
4. 修改 `main.tf`:

```hcl
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "medora-health-beauty"
    }
  }
}
```

### 3. State 文件加密

```bash
# 本地加密 state 文件
terraform state encrypt
```

---

## 📚 进阶配置

### 添加自定义 WAF 规则

编辑 `main.tf`，添加:

```hcl
resource "cloudflare_firewall_rule" "block_country" {
  zone_id     = var.cloudflare_zone_id
  description = "Block specific countries"
  filter_id   = cloudflare_filter.country_filter.id
  action      = "block"
  priority    = 10
}

resource "cloudflare_filter" "country_filter" {
  zone_id     = var.cloudflare_zone_id
  description = "Filter for countries"
  expression  = "(ip.geoip.country in {\"CN\" \"RU\"})"
}
```

### 添加自定义缓存规则

```hcl
resource "cloudflare_page_rule" "cache_api" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain_name}/api/*"
  priority = 5

  actions {
    cache_level = "bypass"  # 不缓存 API 请求
  }
}
```

### 添加自定义响应头

```hcl
resource "cloudflare_ruleset" "transform_headers" {
  zone_id     = var.cloudflare_zone_id
  name        = "Custom Response Headers"
  description = "Add custom security headers"
  kind        = "zone"
  phase       = "http_response_headers_transform"

  rules {
    action = "rewrite"
    action_parameters {
      headers {
        name      = "X-Custom-Header"
        operation = "set"
        value     = "Powered by Medora Health"
      }
    }
    expression  = "true"
    description = "Add custom header"
    enabled     = true
  }
}
```

---

## 🎓 相关资源

- Terraform 文档: https://www.terraform.io/docs
- Cloudflare Provider: https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs
- Cloudflare API: https://developers.cloudflare.com/api

---

## 📞 需要帮助？

### Terraform 命令速查

```bash
# 初始化
terraform init

# 验证配置
terraform validate

# 格式化代码
terraform fmt

# 查看计划
terraform plan

# 应用更改
terraform apply

# 查看状态
terraform show

# 查看输出
terraform output

# 删除资源
terraform destroy
```

### 检查清单

- [ ] Terraform 已安装
- [ ] API Token 已配置
- [ ] Zone ID 已获取
- [ ] Account ID 已获取
- [ ] 域名已确认
- [ ] `terraform.tfvars` 已创建并填写
- [ ] `terraform init` 成功
- [ ] `terraform plan` 无错误
- [ ] `terraform apply` 成功
- [ ] DNS 记录已创建
- [ ] SSL 证书已生成
- [ ] 网站可访问

---

**创建日期**: 2025-01-01  
**版本**: 1.0  
**作者**: AI Assistant  
**项目**: Medora Health & Beauty

