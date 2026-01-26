# Medora 数据库性能优化分析

## 1. 当前数据架构概览

### 数据库结构
```
procedures (手术类型)
├── procedure_translations (多语言翻译)
├── procedure_recovery (恢复信息)
├── procedure_benefits (优势)
├── procedure_candidacy (适应症)
├── procedure_techniques (技术)
├── procedure_recovery_timeline (恢复时间线)
├── procedure_recovery_tips (恢复提示)
├── complementary_procedures (配套手术)
└── procedure_risks (风险)

surgeons (医生信息)
└── procedure_cases (术前术后案例)
```

### 数据特点分析
| 特征 | 描述 |
|------|------|
| **数据量** | 小规模（~70 procedures, ~50 surgeons, ~332 cases） |
| **更新频率** | 极低（内容几乎不变，仅偶尔新增） |
| **读写比例** | 99%+ 读取，< 1% 写入 |
| **查询模式** | 以 slug/id 为主的精确查询 |
| **多语言** | 9 种语言（en, zh, es, fr, de, ru, ar, vi, id） |

---

## 2. 优化方案对比

### 方案一：Materialized Views（不推荐）
```sql
CREATE MATERIALIZED VIEW procedure_full AS
SELECT p.*, pt.overview, pt.procedure_description, ...
FROM procedures p
JOIN procedure_translations pt ON p.id = pt.procedure_id
...
```

**优点**：
- 减少 JOIN 次数
- PostgreSQL 原生支持

**缺点**：
- ❌ 你的数据量太小，JOIN 本身已经很快（< 10ms）
- ❌ 需要手动刷新（REFRESH MATERIALIZED VIEW）
- ❌ 增加数据库存储和维护复杂度
- ❌ Supabase 免费版不支持 CONCURRENTLY 刷新

**结论**：**过度工程化，不推荐**

---

### 方案二：CDN 边缘缓存（推荐 ⭐⭐⭐）
利用 Vercel Edge 或 Cloudflare CDN 进行 API 响应缓存。

**实现方式**：
```javascript
// api/surgeons.js
export default async function handler(req, res) {
  // 设置 CDN 缓存头
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  // ...
}
```

**优点**：
- ✅ 零延迟（边缘节点响应）
- ✅ 全球加速
- ✅ 实现简单
- ✅ Vercel/Cloudflare 免费额度充足

**缺点**：
- 需要手动清缓存或等待过期
- 不适合实时数据

**推荐配置**：
| 数据类型 | Cache-Control | 说明 |
|---------|---------------|------|
| procedures | `s-maxage=86400, stale-while-revalidate=604800` | 1天缓存，7天 stale |
| surgeons | `s-maxage=86400, stale-while-revalidate=604800` | 1天缓存，7天 stale |
| cases | `s-maxage=3600, stale-while-revalidate=86400` | 1小时缓存，1天 stale |

---

### 方案三：前端 React Query 缓存（强烈推荐 ⭐⭐⭐⭐⭐）
最适合你这种静态数据场景。

**实现方式**：
```typescript
// 安装: npm install @tanstack/react-query

import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1小时内认为数据新鲜
      cacheTime: 1000 * 60 * 60 * 24, // 24小时本地缓存
      refetchOnWindowFocus: false, // 禁用窗口聚焦刷新
    },
  },
});

// 使用
function useProcedure(slug: string) {
  return useQuery({
    queryKey: ['procedure', slug],
    queryFn: () => getProcedureBySlug(slug),
    staleTime: Infinity, // 永不过期（手动刷新）
  });
}
```

**优点**：
- ✅ 首次加载后，后续访问**零网络请求**
- ✅ 自动处理 loading/error 状态
- ✅ 支持预取（prefetch）提升感知性能
- ✅ 自动去重请求
- ✅ 支持离线访问

**缺点**：
- 首次加载仍需请求
- 需要添加依赖

---

### 方案四：静态生成 + ISR（最佳方案 ⭐⭐⭐⭐⭐）
将数据在构建时静态化。

**如果迁移到 Next.js**：
```typescript
// pages/procedures/[slug].tsx
export async function getStaticProps({ params }) {
  const procedure = await getProcedureBySlug(params.slug);
  return {
    props: { procedure },
    revalidate: 86400, // 24小时增量静态再生成
  };
}

export async function getStaticPaths() {
  const procedures = await getAllProcedures();
  return {
    paths: procedures.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking',
  };
}
```

**当前 Vite + React 方案**：
构建时生成 JSON 静态文件：
```javascript
// scripts/generate-static-data.js
const procedures = await supabase.from('procedures').select('*');
fs.writeFileSync('public/data/procedures.json', JSON.stringify(procedures));
```

**优点**：
- ✅ 完全静态，无数据库查询
- ✅ CDN 直接服务
- ✅ 最快加载速度

**缺点**：
- 需要构建脚本
- 更新需要重新部署

---

## 3. 最佳实践推荐

### 针对 Medora 项目的最优方案

```
┌─────────────────────────────────────────────────────────────┐
│                    推荐架构层次                              │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: CDN 边缘缓存 (Vercel/Cloudflare)                  │
│           - API 响应缓存 24 小时                             │
│           - stale-while-revalidate 策略                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: React Query 客户端缓存                            │
│           - staleTime: Infinity (永不自动刷新)              │
│           - 预取高频访问页面                                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: 构建时静态 JSON (可选)                            │
│           - procedures.json / surgeons.json                 │
│           - 部署时自动更新                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Supabase PostgreSQL                               │
│           - 仅在缓存未命中时查询                             │
│           - 已有完善索引                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 具体实施步骤

### 第一步：添加 API 缓存头（立即生效）

```javascript
// api/surgeons.js
export default async function handler(req, res) {
  // 添加这一行
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

  // ... 现有代码
}
```

为所有 API 端点添加：
- `/api/surgeons` - 缓存 24 小时
- `/api/admin/cases` - 缓存 1 小时

### 第二步：集成 React Query

```bash
npm install @tanstack/react-query
```

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24小时
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7天
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  );
}
```

### 第三步：（可选）构建时静态化

```javascript
// scripts/generate-static-data.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateStaticData() {
  const { data: procedures } = await supabase
    .from('procedures')
    .select('*, procedure_translations(*)');

  fs.writeFileSync(
    'public/data/procedures.json',
    JSON.stringify(procedures, null, 2)
  );

  console.log('Static data generated!');
}

generateStaticData();
```

在 `package.json` 添加：
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-static-data.js",
    "build": "vite build"
  }
}
```

---

## 5. 为什么不用 Materialized Views？

| 考量因素 | Materialized View | CDN + React Query |
|---------|-------------------|-------------------|
| 数据量小 | 过度复杂 ❌ | 完美匹配 ✅ |
| 更新频率低 | 需要手动刷新 ❌ | 自动过期 ✅ |
| 多语言支持 | 需要多个视图 ❌ | 按需获取 ✅ |
| 运维复杂度 | 高 ❌ | 低 ✅ |
| 成本 | Supabase 计费 ❌ | CDN 免费 ✅ |
| 实现难度 | 中等 | 简单 ✅ |

**结论**：Materialized View 适合大数据量、复杂聚合查询。你的场景用 CDN + React Query 即可获得 99% 的性能提升，且实现简单、维护成本低。

---

## 6. 性能预估

| 优化层级 | 请求延迟 | 数据库负载 |
|---------|---------|-----------|
| 无优化 | 100-300ms | 每次请求 |
| + CDN 缓存 | 10-50ms | 每小时/天 |
| + React Query | 0ms (本地) | 首次/刷新时 |
| + 静态 JSON | 0ms (本地) | 仅构建时 |

---

## 7. 总结

**对于 Medora 这种小数据量、低更新频率的项目：**

1. ✅ **推荐**：CDN 缓存 + React Query 组合
2. ⚠️ **可选**：构建时静态 JSON 生成
3. ❌ **不推荐**：Materialized Views（过度工程化）
4. ❌ **不推荐**：Redis 缓存层（增加复杂度无必要）

**最小改动方案**：仅添加 `Cache-Control` 头，立即获得 CDN 加速。

**推荐改动方案**：CDN + React Query，获得最佳用户体验。
