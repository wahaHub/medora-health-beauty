# Surgeons Manager 修复总结

## 问题

surgeons-manager.html 在本地（通过 Node.js server）能正常工作，但部署到 Vercel 后不能用。

## 根本原因

surgeons-manager 需要的一些 API 端点在 Vercel serverless functions 中**不存在**。

## 解决方案

参考 procedures-manager（已经成功部署）的模式，创建缺失的 serverless API 端点。

### procedures-manager 的工作模式（参考）

```
前端调用: /admin/api/upload
           ↓
Vercel 重写: /admin/api/* → /api/admin/*
           ↓
Serverless: /api/admin/upload.js ✅ (已存在)
```

### 为 surgeons-manager 创建的新 API

我创建了以下 serverless functions：

#### 1. `/api/admin/surgeons-full.js`
- **前端调用**: `/admin/api/surgeons-full`
- **功能**: 获取所有医生及其图片信息
- **返回**:
```json
{
  "success": true,
  "surgeons": [
    {
      "surgeon_id": "min-zhang",
      "name": "Dr. Min Zhang",
      "title": "Board-Certified Plastic Surgeon",
      "images": {
        "hero": "https://...",
        "certification": "https://...",
        "with_patients": "https://..."
      }
    }
  ]
}
```

#### 2. `/api/admin/surgeons/update-image.js`
- **前端调用**: `/admin/api/surgeons/update-image`
- **功能**: 更新医生图片 URL 到 Supabase
- **请求体**:
```json
{
  "surgeonId": "min-zhang",
  "slotType": "hero" | "certification" | "with_patients",
  "imageUrl": "https://..." or null
}
```

#### 3. `/api/admin/images/[...path].js`
- **前端调用**: `/admin/api/images/surgeons/1/hero.jpg` (DELETE)
- **功能**: 删除 R2 中的图片（支持动态路径）
- **说明**: 使用 Vercel 的 catch-all 路由 `[...path].js`

## 数据库修改

surgeons 表需要添加 `images` JSONB 字段：

```sql
-- 在 Supabase SQL Editor 中运行
ALTER TABLE surgeons
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_surgeons_images
ON surgeons USING GIN (images);
```

SQL 脚本位置: [migrations/add_images_field_to_surgeons.sql](./migrations/add_images_field_to_surgeons.sql)

## 部署步骤

1. **运行数据库迁移**
   - 在 Supabase SQL Editor 中运行 `migrations/add_images_field_to_surgeons.sql`

2. **部署到 Vercel**
   ```bash
   git add .
   git commit -m "修复 surgeons-manager: 添加缺失的 serverless API"
   git push
   ```

3. **验证**
   - 访问 `https://your-domain.vercel.app/admin/surgeons-manager.html`
   - 测试上传、删除、更新图片功能

## 文件清单

### 新增的 API 文件
- ✅ `api/admin/surgeons-full.js` - 获取医生列表
- ✅ `api/admin/surgeons/update-image.js` - 更新图片 URL
- ✅ `api/admin/images/[...path].js` - 删除图片（动态路径）

### 数据库迁移
- ✅ `migrations/add_images_field_to_surgeons.sql` - 添加 images 字段

### Vercel 配置
- ✅ `vercel.json` - 已有的重写规则 `/admin/api/*` → `/api/admin/*`

## API 路由对比

| 功能 | procedures-manager | surgeons-manager | 状态 |
|------|-------------------|------------------|------|
| 上传图片 | `/admin/api/upload` | `/admin/api/upload` | ✅ 共用 |
| 列出图片 | `/admin/api/images?prefix=` | - | - |
| 删除图片 | `/admin/api/images/${key}` | `/admin/api/images/${key}` | ✅ 共用 |
| 获取列表 | (前端静态数据) | `/admin/api/surgeons-full` | ✅ 新增 |
| 更新数据 | - | `/admin/api/surgeons/update-image` | ✅ 新增 |

## 完成 ✅

所有必要的 API 端点已创建，surgeons-manager 应该能够像 procedures-manager 一样正常工作了！
