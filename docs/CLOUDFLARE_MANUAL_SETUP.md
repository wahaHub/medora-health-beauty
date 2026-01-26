# Cloudflare + Vercel + React Query 缓存架构

> **域名**: `medorabeauty.com`
> **最后更新**: 2026-01-26
> **状态**: 已完成配置

---

## 架构概览

```
用户请求
    ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Cloudflare CDN (边缘缓存)                      │
│  - 全球 300+ 节点                                        │
│  - Brotli 压缩                                          │
│  - HSTS 安全                                            │
│  - Page Rules 静态资源缓存                               │
└─────────────────────────────────────────────────────────┘
    ↓ (缓存未命中时)
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Vercel Edge (API 缓存)                        │
│  - Cache-Control: s-maxage=86400                        │
│  - stale-while-revalidate=604800                        │
└─────────────────────────────────────────────────────────┘
    ↓ (缓存未命中时)
┌─────────────────────────────────────────────────────────┐
│  Layer 3: React Query (客户端缓存)                       │
│  - staleTime: 24小时                                    │
│  - gcTime: 7天                                          │
│  - 禁用自动刷新                                          │
└─────────────────────────────────────────────────────────┘
    ↓ (缓存未命中时)
┌─────────────────────────────────────────────────────────┐
│  Supabase (数据库)                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 当前配置状态

### DNS 记录 (已完成)

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | cname.vercel-dns.com | Proxied (橙色云) |
| CNAME | www | cname.vercel-dns.com | Proxied (橙色云) |

**重要**: Proxy status 必须是 **Proxied**（橙色云），否则 CDN 不生效！

### SSL/TLS 设置 (已完成)

| 配置项 | 值 | 状态 |
|--------|-----|------|
| SSL Mode | Full (strict) | ✅ |
| Always Use HTTPS | ON | ✅ |
| Minimum TLS Version | TLS 1.2 | ✅ |
| HSTS | max-age=15552000 (6个月), includeSubDomains, preload | ✅ |
| Automatic HTTPS Rewrites | ON | ✅ |

### 速度优化 (已完成)

| 配置项 | 值 | 状态 |
|--------|-----|------|
| Brotli | ON | ✅ |
| Early Hints | ON | ✅ |
| Rocket Loader | OFF (与 React 冲突) | ✅ |
| HTTP/3 (QUIC) | ON | ✅ |
| 0-RTT Connection Resumption | ON | ✅ |
| WebSockets | ON | ✅ |

### 缓存设置 (已完成)

| 配置项 | 值 | 状态 |
|--------|-----|------|
| Caching Level | Standard | ✅ |
| Browser Cache TTL | 4 hours | ✅ |
| Always Online | ON | ✅ |
| Development Mode | OFF | ✅ |

### Page Rules (已完成 - 3条/3条限额)

**优先级顺序很重要！**

| 优先级 | URL 匹配 | 动作 |
|--------|----------|------|
| 1 | `www.medorabeauty.com/*` | 301 重定向到 `https://medorabeauty.com/$1` |
| 2 | `medorabeauty.com/assets/*` | Cache Everything, Edge TTL: 1 month |
| 3 | `medorabeauty.com/*.jpg` | Cache Everything, Edge TTL: 1 month |

### 安全设置 (已完成)

| 配置项 | 值 | 状态 |
|--------|-----|------|
| Security Level | Medium | ✅ |
| Challenge Passage | 30 minutes | ✅ |
| Browser Integrity Check | ON | ✅ |
| Privacy Pass Support | ON | ✅ |

---

## Vercel 配置

### 域名设置

| 域名 | 配置 |
|------|------|
| `medorabeauty.com` | Connect to Production (主域名) |
| `www.medorabeauty.com` | 由 Cloudflare Page Rule 处理重定向 |

**注意**: Vercel 中 `www.medorabeauty.com` 可能显示 "Invalid Configuration"，这是正常的，因为 Cloudflare Page Rule 会在请求到达 Vercel 之前完成 301 重定向。

### API 缓存头配置

**文件**: `api/surgeons.js`
```javascript
// CDN 缓存：24小时缓存，7天 stale-while-revalidate
res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
```

**文件**: `api/admin/cases.js` (GET 请求)
```javascript
// CDN 缓存：1小时缓存，24小时 stale-while-revalidate
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
```

---

## React Query 配置

**文件**: `index.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24小时内认为数据新鲜
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7天本地缓存
      refetchOnWindowFocus: false,     // 禁用窗口聚焦刷新
      refetchOnMount: false,           // 禁用挂载时刷新
      refetchOnReconnect: false,       // 禁用重连时刷新
      retry: 1,                        // 失败只重试1次
    },
  },
});
```

**文件**: `hooks/useData.ts`

提供以下 hooks:
- `useSurgeon(surgeonSlug)` - 获取医生详情
- `useSurgeonCases(surgeonUuid)` - 获取医生案例
- `useAllSurgeons()` - 获取所有医生列表
- `useProcedure(procedureName, languageCode)` - 获取手术详情
- `useProcedureCases(procedureId)` - 获取手术案例

所有 hooks 都配置了 `staleTime: Infinity`，数据永不自动过期。

---

## 验证命令

### 检查 CDN 缓存状态

```bash
curl -sI https://medorabeauty.com | grep -E "(cf-cache-status|cache-control|content-encoding)"
```

**期望输出**:
```
cache-control: public, max-age=31536000, immutable
cf-cache-status: HIT
content-encoding: br
```

### 检查 HSTS

```bash
curl -sI https://medorabeauty.com | grep strict-transport-security
```

**期望输出**:
```
strict-transport-security: max-age=15552000; includeSubDomains; preload
```

### 检查 www 重定向

```bash
curl -sI https://www.medorabeauty.com | grep -E "(HTTP|location)"
```

**期望输出**:
```
HTTP/2 301
location: https://medorabeauty.com/
```

### 检查 DNS (Cloudflare IP)

```bash
dig medorabeauty.com +short
```

**期望输出**: Cloudflare 的 IP 地址 (104.x.x.x 或 172.x.x.x)

---

## 常见问题

### Q1: `cf-cache-status` 显示 MISS 或 DYNAMIC？

**A**:
- MISS: 第一次请求，缓存还未建立，刷新几次后应变为 HIT
- DYNAMIC: 该资源不被缓存（如 HTML 页面、API 响应），这是正常的

### Q2: 出现 ERR_TOO_MANY_REDIRECTS？

**A**: 检查以下配置：
1. Cloudflare SSL Mode 必须是 **Full (strict)**，不是 Flexible
2. Vercel 中 `medorabeauty.com` 必须是 "Connect to Production"，不是重定向

### Q3: www 重定向不工作？

**A**: 确保 Cloudflare Page Rule #1 配置正确：
- URL: `www.medorabeauty.com/*`
- Setting: Forwarding URL → 301 → `https://medorabeauty.com/$1`

### Q4: 如何清除缓存？

**A**:
- Cloudflare: Caching → Configuration → Purge Everything
- React Query: 用户刷新页面或 `queryClient.invalidateQueries()`

---

## 性能预期

| 指标 | 预期值 |
|------|--------|
| TTFB (首字节时间) | < 100ms |
| 静态资源加载 | < 200ms (CDN HIT) |
| 页面完全加载 | < 3s |
| SSL 评级 | A+ |

---

## 成本

| 服务 | 费用 |
|------|------|
| Cloudflare (Free Plan) | $0/月 |
| Vercel (Hobby/Pro) | 按现有计划 |
| React Query | $0 (开源) |
| **总计** | **$0 额外成本** |

---

## 修改历史

| 日期 | 修改内容 |
|------|----------|
| 2026-01-26 | 完成全部配置，更新文档为实际状态 |
| 2026-01-26 | 修复 Vercel/Cloudflare 重定向循环问题 |
| 2026-01-26 | 添加 React Query 客户端缓存 |
| 2026-01-26 | 配置 Cloudflare Page Rules |

---

## 相关文件

- [hooks/useData.ts](../hooks/useData.ts) - React Query hooks
- [index.tsx](../index.tsx) - QueryClient 配置
- [api/surgeons.js](../api/surgeons.js) - Surgeons API 缓存头
- [api/admin/cases.js](../api/admin/cases.js) - Cases API 缓存头
- [PERFORMANCE_OPTIMIZATION_ANALYSIS.md](./PERFORMANCE_OPTIMIZATION_ANALYSIS.md) - 性能优化分析
