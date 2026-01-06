# Cloudflare R2 图片存储 - 快速配置指南 ⚡

**只需 5 分钟** - 配置 Cloudflare R2 用于网站图片存储！

---

## 🎯 配置步骤

### 第1步：创建 R2 Bucket（2分钟）

1. 访问 https://dash.cloudflare.com/
2. 左侧菜单 → **R2**
3. 点击 **Create bucket**
4. 填写：
   - Bucket名称: `medora-images` (或你喜欢的名称)
   - 位置: `Automatic`
5. 点击 **Create bucket**

---

### 第2步：开启公开访问（1分钟）

1. 进入刚创建的 `medora-images` bucket
2. 点击 **Settings** 标签
3. 找到 **Public access** → 点击 **Allow Access**
4. **复制并保存** 公开URL（重要！）：
   ```
   https://pub-xxxxxxxxxxxxx.r2.dev
   ```

---

### 第3步：配置前端项目（1分钟）

编辑 `config/cloudflare.ts`，替换你的公开URL：

```typescript
export const R2_CONFIG = {
  PUBLIC_URL: 'https://pub-xxxxxxxxxxxxx.r2.dev', // 🔴 替换为你的实际URL
  BUCKET_NAME: 'medora-images',
};
```

---

### 第4步：上传图片（通过 Admin Console）

有两种方式上传图片：

#### 方式A：使用自建 Admin Console（推荐）

1. 配置 `.env` 文件（参考 `ENV_TEMPLATE.md`）
2. 安装依赖: `npm install`
3. 启动 Admin Console: `npm run admin`
4. 访问 `http://localhost:5000/admin/login`
5. 使用用户名密码登录
6. 拖拽图片上传！

**详细文档**: 查看 `ADMIN_CONSOLE_SETUP.md`

#### 方式B：直接使用 Cloudflare Dashboard

1. 在 R2 Dashboard，进入 `medora-images` bucket
2. 点击 **Upload** 按钮
3. 拖拽图片或点击选择文件
4. 等待上传完成

**建议的目录结构**:
```
medora-images/
├── hero/              # 首页大图
├── doctors/           # 医生照片
├── procedures/        # 手术项目图片
├── gallery/           # 图库
│   ├── face/
│   ├── body/
│   └── nonsurgical/
├── logos/             # Logo
└── icons/             # 图标
```

---

### 第5步：在前端使用图片

```typescript
import { getImageUrl } from '../config/cloudflare';

function MyComponent() {
  return (
    <div>
      {/* 直接使用 */}
      <img src={getImageUrl('hero/hero-main.jpg')} alt="Hero" />
      
      {/* 嵌套路径 */}
      <img src={getImageUrl('doctors/dr-zhang.jpg')} alt="Dr. Zhang" />
      
      {/* 响应式图片 */}
      <picture>
        <source 
          media="(min-width: 1024px)" 
          srcSet={getImageUrl('hero/hero-main-large.jpg')} 
        />
        <img 
          src={getImageUrl('hero/hero-main.jpg')} 
          alt="Hero" 
        />
      </picture>
    </div>
  );
}
```

---

## ✅ 完成！测试一下

1. 上传一张测试图片到 R2（如 `test.jpg`）
2. 在浏览器访问：`https://pub-xxxxx.r2.dev/test.jpg`
3. 如果能看到图片，配置成功！✨
4. 在项目中使用 `getImageUrl('test.jpg')` 来引用图片

---

## 📁 图片命名建议

**好的命名**:
- `hero-main.jpg`
- `procedure-facelift-01.jpg`
- `doctor-zhang-profile.jpg`
- `case-001-before.jpg`

**不好的命名**:
- `IMG_1234.jpg`
- `photo.jpg`
- `new image final.jpg`

---

## 🔧 （可选）绑定自定义域名

如果不想使用 `pub-xxxxx.r2.dev`：

1. R2 bucket → **Settings** → **Custom Domains**
2. 点击 **Connect Domain**
3. 输入：`images.medorahealth.com`
4. Cloudflare 会自动添加 DNS 记录
5. 更新 `config/cloudflare.ts`:
   ```typescript
   export const R2_CONFIG = {
     PUBLIC_URL: 'https://images.medorahealth.com',
     BUCKET_NAME: 'medora-images',
   };
   ```

---

## 💰 费用说明

### 免费额度（足够个人/小型网站使用）:
- **存储**: 10GB 免费
- **请求**: 100万次 Class A + 1000万次 Class B 免费
- **流量**: **无限制免费** 🎉（这是最大优势！）

### 成本示例：
假设 500 张图片，每张 200KB：
```
存储: 500 × 0.2MB = 100MB ≈ 0.1GB → 免费
请求: 每月 50,000 次访问 → 免费
流量: 10GB/月 → 免费（R2 无出口费用！）
总成本: $0/月 🎉
```

**对比 AWS S3 + CloudFront 同样使用量**: $0.87/月

---

## 📝 核心文件说明

### `config/cloudflare.ts` - 前端配置文件
- ✅ **必须保留** - 前端获取图片URL的核心文件
- 提供了 `getImageUrl()` 等辅助函数
- 需要配置你的 R2 公开URL

### `CLOUDFLARE_R2_SETUP.md` - 详细参考文档
- 📚 可选阅读 - 包含更多高级配置和优化建议
- 如果需要批量上传、图片优化等高级功能，可以参考

---

## 🚀 下一步

1. ✅ 创建 R2 bucket
2. ✅ 开启公开访问
3. ✅ 配置 `config/cloudflare.ts`
4. ✅ 通过管理台上传图片
5. ✅ 在代码中使用 `getImageUrl()`

---

## 💡 常见问题

**Q: 免费额度够用吗？**
A: 10GB 可以放几千张优化后的图片，对大多数网站完全够用。

**Q: 会产生流量费用吗？**
A: **不会！** R2 最大优势就是无出口流量费用。

**Q: 图片访问速度快吗？**
A: 是的！自动通过 Cloudflare 全球 CDN 分发。

**Q: 如何删除图片？**
A: 在 R2 Dashboard 中选择文件，点击删除即可。

**Q: 可以批量上传吗？**
A: 可以，在管理台可以拖拽多个文件一次性上传。

---

需要更多帮助？查看详细文档 `CLOUDFLARE_R2_SETUP.md` 或随时提问！🎨
