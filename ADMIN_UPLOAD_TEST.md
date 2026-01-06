# 📸 Admin Console 图片上传测试清单

## 🎯 测试目标

验证所有图片上传功能按照 `R2_IMAGE_PATHS.md` 规范正常工作。

---

## 🚀 准备工作

### 1. 启动服务器

```bash
cd admin
node server.js
```

服务器将在 http://localhost:5001 启动

### 2. 登录

访问: http://localhost:5001/admin/login

**登录凭证**:
- 用户名: `admin`
- 密码: `Medora2026@SecureAdmin`

---

## ✅ 测试清单

### 测试 1: Homepage 图片上传 (6 张)

**访问**: Dashboard → Homepage

**测试步骤**:

1. **Hero 图片**
   - [ ] 点击 "Hero" 槽位
   - [ ] 选择图片上传
   - [ ] 验证上传成功提示
   - [ ] 验证图片显示正确
   - [ ] 验证 R2 路径: `homepage/hero.jpg`

2. **Face 图片**
   - [ ] 点击 "Face" 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `homepage/face.jpg`

3. **Body 图片**
   - [ ] 点击 "Body" 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `homepage/body.jpg`

4. **Non-Surgical 图片**
   - [ ] 点击 "Non-Surgical" 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `homepage/non-surgical.jpg`

5. **Concierge Program 图片**
   - [ ] 点击 "Concierge Program" 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `homepage/concierge.jpg`

6. **Gallery 图片**
   - [ ] 点击 "Gallery" 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `homepage/gallery.jpg`

**验证点**:
- [ ] 所有图片上传后页面自动刷新
- [ ] 图片正确显示在槽位中
- [ ] 鼠标悬停显示 "查看"、"替换"、"删除" 按钮
- [ ] 点击 "查看" 在新标签页打开图片
- [ ] 点击 "替换" 可以更换图片
- [ ] 点击 "删除" 可以删除图片（需要确认）

---

### 测试 2: Gallery 子分类图片上传 (6 张)

**访问**: Dashboard → Gallery

**测试步骤**:

1. **Face & Neck**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/face-neck.jpg`

2. **Facial Contouring & Implants**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/facial-contouring-implants.jpg`

3. **Injectables & Regenerative**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/injectables-regenerative.jpg`

4. **Lips**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/lips.jpg`

5. **Skin Tightening & Resurfacing**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/skin-tightening-resurfacing.jpg`

6. **Hair**
   - [ ] 上传图片
   - [ ] 验证路径: `gallery/hair.jpg`

**验证点**:
- [ ] 所有功能（查看、替换、删除）正常工作
- [ ] 刷新页面后图片仍然显示

---

### 测试 3: Reviews 步骤图片上传 (3 张)

**访问**: Dashboard → Travel (实际显示 Reviews)

**测试步骤**:

1. **Step 1**
   - [ ] 上传图片
   - [ ] 验证路径: `reviews/step-1.jpg`

2. **Step 2**
   - [ ] 上传图片
   - [ ] 验证路径: `reviews/step-2.jpg`

3. **Step 3**
   - [ ] 上传图片
   - [ ] 验证路径: `reviews/step-3.jpg`

**验证点**:
- [ ] 所有 3 张图片上传成功
- [ ] 所有功能正常工作

---

### 测试 4: Procedures 图片上传

**访问**: Dashboard → Procedures → 选择任意手术项目

**推荐测试项目**: Facelift

**测试步骤**:

1. **Hero 图片**
   - [ ] 点击 Hero 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `procedures/facelift/hero.jpg`

2. **Benefits 图片**
   - [ ] 点击 Benefits 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `procedures/facelift/benefits.jpg`

3. **Candidate 图片**
   - [ ] 点击 Candidate 槽位
   - [ ] 上传图片
   - [ ] 验证路径: `procedures/facelift/candidate.jpg`

4. **Case 1 - 多张图片**
   - [ ] 点击 "Add Image" 按钮添加第 1 张图片
   - [ ] 验证路径: `procedures/facelift/case-1-1.jpg`
   - [ ] 再添加第 2 张图片
   - [ ] 验证路径: `procedures/facelift/case-1-2.jpg`
   - [ ] 再添加第 3 张图片（不同尺寸：横向、竖向、大图）
   - [ ] 验证路径: `procedures/facelift/case-1-3.jpg`
   - [ ] 验证智能布局：不同尺寸的图片自动调整显示大小

5. **Case 2 - 新案例**
   - [ ] 点击 "Add New Case" 按钮
   - [ ] 添加多张图片到 Case 2
   - [ ] 验证路径: `procedures/facelift/case-2-1.jpg`, `case-2-2.jpg`, etc.

**验证点**:
- [ ] Hero, Benefits, Candidate 各只能有 1 张图片
- [ ] Cases 可以添加无限个
- [ ] 每个 Case 可以添加多张图片
- [ ] 不同尺寸图片的智能布局正常工作
- [ ] 删除图片功能正常

---

## 🔍 R2 验证

### 方式 1: 通过浏览器直接访问

```
https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev/homepage/hero.jpg
https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev/gallery/face-neck.jpg
https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev/reviews/step-1.jpg
https://pub-364a76a828f94fbeb2b09c625907dcf5.r2.dev/procedures/facelift/hero.jpg
```

### 方式 2: 通过 API 列出图片

```bash
# 列出 homepage 图片
curl http://localhost:5001/admin/api/images?prefix=homepage/

# 列出 gallery 图片
curl http://localhost:5001/admin/api/images?prefix=gallery/

# 列出 reviews 图片
curl http://localhost:5001/admin/api/images?prefix=reviews/

# 列出 facelift 手术的图片
curl http://localhost:5001/admin/api/images?prefix=procedures/facelift/
```

---

## 🐛 常见问题排查

### 问题 1: 上传失败

**检查**:
- [ ] .env 文件中的 R2 配置是否正确
- [ ] R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY 是否正确
- [ ] Bucket 名称是否为 `medora-images`
- [ ] 服务器日志是否有错误信息

### 问题 2: 图片不显示

**检查**:
- [ ] R2 公开 URL 是否正确配置
- [ ] 浏览器开发者工具 Console 是否有错误
- [ ] Network 标签页查看图片请求是否成功

### 问题 3: 路径命名错误

**检查**:
- [ ] 查看上传成功后返回的 `key` 值
- [ ] 对比 `R2_IMAGE_PATHS.md` 文档中的规范
- [ ] 检查 `parseImageKey` 函数的逻辑

### 问题 4: 删除功能不工作

**检查**:
- [ ] 删除 API `/admin/api/images/:key` 是否正确
- [ ] URL 编码是否正确（encodeURIComponent）
- [ ] 服务器是否返回成功响应

---

## 📊 测试报告模板

```markdown
## 测试日期: YYYY-MM-DD

### Homepage (6/6) ✅
- [x] Hero
- [x] Face
- [x] Body
- [x] Non-Surgical
- [x] Concierge
- [x] Gallery

### Gallery (6/6) ✅
- [x] Face & Neck
- [x] Facial Contouring & Implants
- [x] Injectables & Regenerative
- [x] Lips
- [x] Skin Tightening & Resurfacing
- [x] Hair

### Reviews (3/3) ✅
- [x] Step 1
- [x] Step 2
- [x] Step 3

### Procedures - Facelift ✅
- [x] Hero
- [x] Benefits
- [x] Candidate
- [x] Case 1 (3 images)
- [x] Case 2 (2 images)

### 功能验证 ✅
- [x] 上传
- [x] 查看
- [x] 替换
- [x] 删除
- [x] 智能布局

### 问题记录
无问题 / [记录遇到的问题]
```

---

## ✅ 完成标准

所有测试项通过 ✅ 时，图片上传模块开发完成！

**下一步**: 前端集成，使用 `R2_IMAGE_PATHS.md` 中的工具函数访问图片。

---

**测试人员**: _______________
**测试日期**: _______________
**测试结果**: ⬜ 通过 / ⬜ 失败
