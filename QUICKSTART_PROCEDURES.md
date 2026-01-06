# 🚀 快速开始 - 手术项目图片管理

5分钟上手！

---

## ✅ 前置要求

确保已配置 `.env` 文件:

```bash
# R2 配置
R2_ACCOUNT_ID=你的账号ID
R2_ACCESS_KEY_ID=你的Access_Key
R2_SECRET_ACCESS_KEY=你的Secret_Key
R2_BUCKET_NAME=medora-images
R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev

# Admin Console
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

---

## 📝 步骤 1: 启动 Admin Console

```bash
npm install
npm run admin
```

输出:
```
🚀 Admin Console 启动成功！

📊 管理后台: http://localhost:5000/admin
🔐 登录页面: http://localhost:5000/admin/login

🔑 登录凭证:
   用户名: admin
   密码: your-secure-password

💾 R2 Bucket: medora-images
🌐 公开 URL: https://pub-xxxxx.r2.dev
```

---

## 🔐 步骤 2: 登录

访问: http://localhost:5000/admin/login

输入用户名和密码

---

## 📸 步骤 3: 上传图片

### 方式 A: 通过管理界面

1. 点击侧边栏 **"Procedures"**
2. 搜索或选择手术项目（如 "Facelift"）
3. 点击项目卡片进入图片管理页
4. 点击任意空槽位
5. 选择图片 → 上传

### 方式 B: 直接访问

http://localhost:5000/admin/procedure-detail.html?name=Facelift

---

## 🎯 支持的图片类型

每个手术项目可上传:

| 类型 | 数量 | 用途 |
|-----|------|-----|
| Hero | 1张 | 页面横幅 |
| Before/After | 10组 | 术前术后对比 |
| Detail | 8张 | 手术细节 |
| Gallery | 20张 | 案例展示 |

---

## 💻 步骤 4: 在官网使用图片

### 简单方式 (直接使用 URL)

```tsx
const R2_URL = 'https://pub-xxxxx.r2.dev';

// Hero 图片
<img src={`${R2_URL}/procedures/facelift/hero.jpg`} />

// Before/After
<img src={`${R2_URL}/procedures/facelift/before-1.jpg`} />
<img src={`${R2_URL}/procedures/facelift/after-1.jpg`} />
```

### 推荐方式 (使用辅助函数)

创建 `src/utils/images.ts`:

```typescript
const R2_URL = import.meta.env.VITE_R2_PUBLIC_URL;

function slugify(name: string) {
  return name.toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getProcedureImage(
  name: string,
  type: 'hero' | 'before' | 'after' | 'detail' | 'gallery',
  index?: number
) {
  const slug = slugify(name);
  const filename = index ? `${type}-${index}` : type;
  return `${R2_URL}/procedures/${slug}/${filename}.jpg`;
}
```

使用:

```tsx
import { getProcedureImage } from '@/utils/images';

function FaceliftPage() {
  return (
    <div>
      <img src={getProcedureImage('Facelift', 'hero')} />

      <div className="before-after">
        <img src={getProcedureImage('Facelift', 'before', 1)} />
        <img src={getProcedureImage('Facelift', 'after', 1)} />
      </div>
    </div>
  );
}
```

---

## ✨ 完成！

你已经成功:
- ✅ 启动了 Admin Console
- ✅ 上传了第一张手术项目图片
- ✅ 知道如何在官网中使用图片

### 下一步

- 为更多手术项目上传图片
- 查看完整文档: [PROCEDURES_IMAGE_MANAGEMENT.md](./PROCEDURES_IMAGE_MANAGEMENT.md)
- 探索所有 100+ 支持的手术项目

---

## 🆘 遇到问题？

### 上传失败？

检查:
1. R2 凭证是否正确配置
2. Bucket 是否开启公开访问
3. 网络连接是否正常

### 前端看不到图片？

检查:
1. R2 公开 URL 是否配置正确
2. 图片路径是否正确 (检查 slug 转换)
3. 浏览器是否缓存了旧内容 (硬刷新)

### 健康检查

访问: http://localhost:5000/admin/api/health

应该返回:
```json
{
  "status": "ok",
  "authenticated": true,
  "bucket": "medora-images",
  "publicUrl": "https://pub-xxxxx.r2.dev",
  "supabase": true
}
```

---

**需要帮助？查看完整文档!** 📚
