# 🛡️ Cloudflare 手动配置指南

完整的 CDN 和安全配置步骤。

---

## 📋 配置顺序

1. DNS 记录 ✅ (您可能已完成)
2. SSL/TLS 设置
3. 速度优化（CDN）
4. 安全设置
5. Page Rules（缓存优化）

---

## 1️⃣ DNS 记录设置

访问: https://dash.cloudflare.com → 选择 `medorahealth.com` → **DNS** → **Records**

### 添加两条记录：

**记录 1:**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: Proxied (橙色云图标 ☁️)
TTL: Auto
```

**记录 2:**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: Proxied (橙色云图标 ☁️)
TTL: Auto
```

**⚠️ 重要**: Proxy status 必须是 **Proxied**（橙色云），这样才能使用 CDN！

---

## 2️⃣ SSL/TLS 设置（加密）

### A. SSL/TLS 加密模式

1. 左侧菜单点击 **SSL/TLS** → **Overview**
2. 选择 **Full (strict)** ✅
   - ⚠️ 不要选 Flexible（不安全）
   - ⚠️ 不要选 Full（不够严格）

### B. Always Use HTTPS

1. 在同一页面下方
2. 找到 **Always Use HTTPS**
3. 切换为 **ON** ✅

### C. Minimum TLS Version

1. 点击 **Edge Certificates**
2. 找到 **Minimum TLS Version**
3. 选择 **TLS 1.2** ✅

### D. HSTS (HTTP Strict Transport Security)

1. 在 **Edge Certificates** 页面
2. 找到 **HTTP Strict Transport Security (HSTS)**
3. 点击 **Enable HSTS**
4. 配置：
   ```
   Max Age Header (max-age): 12 months (31536000)
   Include subdomains: ✅ ON
   Preload: ✅ ON
   No-Sniff Header: ✅ ON
   ```
5. 点击 **Next** → **I understand** → **Enable HSTS**

### E. Automatic HTTPS Rewrites

1. 在 **Edge Certificates** 页面
2. 找到 **Automatic HTTPS Rewrites**
3. 切换为 **ON** ✅

---

## 3️⃣ 速度优化（CDN 配置）

### A. Auto Minify（代码压缩）

1. 左侧菜单点击 **Speed** → **Optimization**
2. 找到 **Auto Minify**
3. 勾选：
   - ✅ **JavaScript**
   - ✅ **CSS**
   - ✅ **HTML**

### B. Brotli（高级压缩）

1. 在同一页面找到 **Brotli**
2. 切换为 **ON** ✅

### C. Early Hints

1. 找到 **Early Hints**
2. 切换为 **ON** ✅

### D. Rocket Loader（建议关闭）

1. 找到 **Rocket Loader**
2. 切换为 **OFF** ❌
   - ⚠️ Rocket Loader 可能与 React 冲突，建议关闭

### E. HTTP/3 (QUIC)

1. 左侧菜单点击 **Network**
2. 找到 **HTTP/3 (with QUIC)**
3. 切换为 **ON** ✅

### F. 0-RTT Connection Resumption

1. 在同一页面找到 **0-RTT Connection Resumption**
2. 切换为 **ON** ✅

### G. WebSockets

1. 找到 **WebSockets**
2. 切换为 **ON** ✅

---

## 4️⃣ 缓存设置

### A. Caching Level

1. 左侧菜单点击 **Caching** → **Configuration**
2. 找到 **Caching Level**
3. 选择 **Standard** ✅

### B. Browser Cache TTL

1. 在同一页面找到 **Browser Cache TTL**
2. 选择 **4 hours** ✅

---

## 5️⃣ Page Rules（缓存优化）

⚠️ **免费套餐限制**: 只能创建 **3 条** Page Rules

访问: **Rules** → **Page Rules** → **Create Page Rule**

### Rule 1: 缓存静态资源

```
URL: medorahealth.com/assets/*

Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

点击 **Save and Deploy**

### Rule 2: 缓存图片

```
URL: medorahealth.com/*.{jpg,jpeg,png,gif,webp,svg,ico}

Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

点击 **Save and Deploy**

### Rule 3: WWW 重定向

```
URL: www.medorahealth.com/*

Settings:
- Forwarding URL: 301 - Permanent Redirect
- Destination URL: https://medorahealth.com/$1
```

点击 **Save and Deploy**

---

## 6️⃣ 安全设置

### A. Security Level

1. 左侧菜单点击 **Security** → **Settings**
2. 找到 **Security Level**
3. 选择 **Medium** ✅

### B. Challenge Passage

1. 在同一页面找到 **Challenge Passage**
2. 选择 **30 minutes** ✅

### C. Browser Integrity Check

1. 找到 **Browser Integrity Check**
2. 切换为 **ON** ✅

### D. Privacy Pass Support

1. 找到 **Privacy Pass Support**
2. 切换为 **ON** ✅

### E. WAF (Web Application Firewall) - 免费套餐

⚠️ **注意**: 免费套餐只有基础 WAF 功能

1. 左侧菜单点击 **Security** → **WAF**
2. 如果有 **Managed Rules**，启用推荐的规则集

---

## 7️⃣ 其他优化设置

### A. Always Online

1. 左侧菜单点击 **Caching** → **Configuration**
2. 找到 **Always Online**
3. 切换为 **ON** ✅

### B. Development Mode（部署完成后关闭）

1. 在同一页面找到 **Development Mode**
2. 确保是 **OFF** ❌

---

## ✅ 配置完成检查清单

### DNS:
- [ ] @ → cname.vercel-dns.com (Proxied)
- [ ] www → cname.vercel-dns.com (Proxied)

### SSL/TLS:
- [ ] SSL Mode: Full (strict)
- [ ] Always Use HTTPS: ON
- [ ] Minimum TLS: 1.2
- [ ] HSTS: Enabled
- [ ] Automatic HTTPS Rewrites: ON

### Speed (CDN):
- [ ] Auto Minify: JavaScript, CSS, HTML
- [ ] Brotli: ON
- [ ] Early Hints: ON
- [ ] Rocket Loader: OFF
- [ ] HTTP/3: ON
- [ ] 0-RTT: ON
- [ ] WebSockets: ON

### Caching:
- [ ] Caching Level: Standard
- [ ] Browser Cache TTL: 4 hours

### Page Rules (3条):
- [ ] /assets/* → Cache Everything
- [ ] /*.{jpg,png...} → Cache Everything
- [ ] www.* → 301 Redirect

### Security:
- [ ] Security Level: Medium
- [ ] Challenge Passage: 30 minutes
- [ ] Browser Integrity Check: ON
- [ ] Privacy Pass: ON

---

## 🧪 验证配置

### 1. 检查 DNS

```bash
dig medorahealth.com
# 应该返回 Cloudflare 的 IP
```

或访问: https://dnschecker.org

### 2. 检查 SSL

访问: https://www.ssllabs.com/ssltest/

输入: `medorahealth.com`

应该得到 **A 或 A+** 评级

### 3. 检查 HTTP 头

```bash
curl -I https://medorahealth.com
```

应该看到：
```
strict-transport-security: max-age=31536000; includeSubDomains; preload
cf-cache-status: HIT  (第二次访问时)
content-encoding: br  (Brotli 压缩)
```

### 4. 测试性能

访问: https://www.webpagetest.org

输入: `medorahealth.com`

应该看到：
- First Byte Time < 200ms
- Fully Loaded < 3s

---

## 📊 预期效果

配置完成后，您的网站将获得：

### 安全性：
- ✅ A+ SSL 评级
- ✅ HSTS 保护
- ✅ 强制 HTTPS
- ✅ WAF 防护

### 性能：
- ✅ 全球 CDN 加速
- ✅ Brotli 压缩（比 gzip 小 20%）
- ✅ 静态资源缓存 30 天
- ✅ HTTP/3 支持
- ✅ 代码自动压缩

### 可靠性：
- ✅ Always Online（离线时显示缓存）
- ✅ DDoS 防护
- ✅ Bot 过滤

---

## 🆘 常见问题

### Q1: 配置后没有立即生效？

**A**: DNS 和 CDN 配置需要时间传播：
- DNS 更改: 5-30 分钟
- SSL 证书: 1-5 分钟
- 缓存清除: 可以手动清除（Caching → Configuration → Purge Everything）

### Q2: 显示 "ERR_TOO_MANY_REDIRECTS"？

**A**: SSL 模式设置错误
- 确保选择 **Full (strict)**
- 不要选 Flexible

### Q3: 缓存没有命中（MISS）？

**A**: 
- 等待几分钟让缓存生效
- 检查 Page Rules 是否正确配置
- 访问静态文件（如图片）测试

### Q4: 想要更高级的功能？

**A**: 考虑升级到 Pro 套餐（$20/月）：
- 更多 Page Rules（20条 vs 3条）
- 高级 WAF 规则
- Image Optimization
- 更详细的分析

---

## 🎓 进阶配置（可选）

### 1. 自定义缓存键

如果您的 URL 有查询参数：

**Caching** → **Configuration** → **Custom Cache Key**

### 2. 图片优化（Pro 套餐）

**Speed** → **Optimization** → **Image Optimization**
- Polish: Lossless
- WebP: Enabled

### 3. 自定义错误页面

**Customization** → **Custom Pages**
- 500 errors
- 404 errors

---

## 📞 需要帮助？

如果遇到问题：

1. **Cloudflare 文档**: https://developers.cloudflare.com
2. **Cloudflare 社区**: https://community.cloudflare.com
3. **Vercel 文档**: https://vercel.com/docs/concepts/projects/domains

---

**配置完成后，您的网站将拥有企业级的性能和安全性！** 🚀

**预计配置时间**: 10-15 分钟

