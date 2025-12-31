# 📸 Cases (Before/After Photos) Setup Guide

## 概述

现在你可以为每个手术添加真实的 Before/After 案例照片。一个手术可以有**几十个甚至上百个**真实案例。

## 🗄️ 数据库结构

### 4 个新表：

1. **`cases`** - 案例基本信息
   - case_number（案例编号，如 "1001510"）
   - procedure_id（关联的手术）
   - surgeon_name（医生姓名）
   - surgery_date（手术日期）
   - patient_age（患者年龄）
   - patient_gender（患者性别）
   - patient_location（患者所在地）
   - is_featured（是否为精选案例）
   - display_order（显示顺序）

2. **`case_translations`** - 案例描述（多语言）
   - description（案例描述）
   - patient_goals（患者目标）
   - outcome_summary（结果总结）

3. **`case_photos`** - Before/After 照片
   - photo_type（'before' 或 'after'）
   - view_angle（角度：'front', 'side', 'profile' 等）
   - image_url（图片 URL）
   - thumbnail_url（缩略图 URL）
   - display_order（显示顺序）

4. **`case_procedures`** - 案例与手术的关联
   - 支持一个案例关联多个手术（组合手术）
   - is_primary（是否为主要手术）

## 🚀 第一步：创建表

在 Supabase Dashboard 的 SQL Editor 中运行：

```bash
# 执行 SQL 文件
cat supabase_cases_schema.sql
```

或者直接在 SQL Editor 中复制粘贴 `supabase_cases_schema.sql` 的内容并执行。

## 📝 第二步：导入示例数据

运行示例数据导入脚本：

```bash
node import-sample-cases.js
```

这会导入 3 个示例案例：
- 2 个 Brow Lift 案例
- 1 个 Breast Augmentation 案例

## 🖼️ 图片存储建议

### 选项 1：使用 Cloudflare R2（推荐）
- 完全免费（无流量费用）
- 上传你的 Before/After 照片到 R2
- 获取公共 URL
- 在导入脚本中使用这些 URL

### 选项 2：使用 Supabase Storage
```javascript
// 上传照片到 Supabase Storage
const { data, error } = await supabase.storage
  .from('case-photos')
  .upload(`${caseNumber}/before-front.jpg`, file);

// 获取公共 URL
const { data: { publicUrl } } = supabase.storage
  .from('case-photos')
  .getPublicUrl(`${caseNumber}/before-front.jpg`);
```

### 选项 3：使用 CDN（如 Cloudinary）
- 自动图片优化和压缩
- 响应式图片
- 懒加载支持

## 📊 添加更多案例

### 方法 1：使用脚本批量导入

创建你自己的数据文件（JSON 格式）：

```json
{
  "cases": [
    {
      "case_number": "1004567",
      "procedure_slug": "rhinoplasty",
      "surgeon_name": "Dr. Heather Lee",
      "surgery_date": "2023-10-15",
      "patient_age": 28,
      "patient_gender": "female",
      "patient_location": "Albany, NY",
      "is_featured": true,
      "display_order": 1,
      "description": "Patient desired refinement of nasal tip and bridge...",
      "patient_goals": "Softer, more feminine nose profile",
      "outcome_summary": "Beautiful natural results...",
      "photos": [
        {
          "type": "before",
          "angle": "front",
          "url": "https://your-cdn.com/case1004567/before-front.jpg",
          "order": 1
        },
        {
          "type": "after",
          "angle": "front",
          "url": "https://your-cdn.com/case1004567/after-front.jpg",
          "order": 2
        }
      ]
    }
  ]
}
```

然后修改 `import-sample-cases.js` 读取你的 JSON 文件。

### 方法 2：直接在 Supabase Dashboard 中添加

1. 进入 **Table Editor**
2. 选择 `cases` 表
3. 点击 **Insert row**
4. 填写案例信息
5. 然后在 `case_translations` 和 `case_photos` 表中添加相关数据

### 方法 3：创建管理后台（推荐用于长期维护）

```typescript
// 示例：创建案例的 API 端点
async function createCase(caseData) {
  // 1. 插入案例
  const { data: newCase } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single();
  
  // 2. 上传照片
  for (const photo of photos) {
    await supabase.storage
      .from('case-photos')
      .upload(`${newCase.case_number}/${photo.name}`, photo.file);
  }
  
  // 3. 保存照片记录
  await supabase.from('case_photos').insert(photoRecords);
  
  return newCase;
}
```

## 🎨 在前端使用

### 1. 获取某个手术的所有案例

```typescript
import { getCasesByProcedure } from './services/supabaseClient';

// 获取 Brow Lift 的所有案例
const cases = await getCasesByProcedure(procedureId, 'en', 10);

// cases 包含：
// - 案例信息（医生、日期、患者信息）
// - 描述和目标
// - Before/After 照片（已排序）
```

### 2. 在 ProcedureDetail 页面显示

现在可以修改 `ProcedureDetail.tsx`：

```typescript
const [cases, setCases] = useState<CompleteCaseData[]>([]);

useEffect(() => {
  async function fetchCases() {
    if (procedure?.id) {
      const casesData = await getCasesByProcedure(procedure.id, 'en', 5);
      setCases(casesData);
    }
  }
  fetchCases();
}, [procedure]);

// 然后在 JSX 中显示真实的案例数据
```

### 3. 显示 Before/After 照片

```tsx
{cases.length > 0 && (
  <section className="py-24 bg-sage-50/50">
    <div className="container mx-auto px-6">
      {cases.map((caseItem, index) => (
        <div key={caseItem.id}>
          <h3>Case #{caseItem.case_number}</h3>
          <p>Surgeon: {caseItem.surgeon_name}</p>
          
          <div className="grid grid-cols-2 gap-4">
            {caseItem.case_photos
              .filter(p => p.view_angle === 'front')
              .sort((a, b) => a.display_order - b.display_order)
              .map(photo => (
                <div key={photo.id}>
                  <img src={photo.image_url} alt={photo.photo_type} />
                  <p>{photo.photo_type}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  </section>
)}
```

## 📈 推荐的工作流程

### 对于每个手术：

1. **准备照片**
   - 收集 Before/After 照片
   - 统一命名规范（如 `case1001510-before-front.jpg`）
   - 优化图片大小（建议 1000-1500px 宽）

2. **上传到 CDN**
   - 上传到 Cloudflare R2、Supabase Storage 或 Cloudinary
   - 获取公共 URL

3. **创建案例记录**
   - 填写患者信息（可匿名）
   - 添加描述和目标
   - 关联照片 URL

4. **设置精选案例**
   - 选择 1-3 个最好的案例设为 `is_featured = true`
   - 这些会优先显示在手术页面

## 🎯 数据示例

### 一个完整的案例包含：

```javascript
{
  case_number: "1001510",
  procedure_name: "Brow Lift (Forehead Lift)",
  surgeon_name: "Dr. Heather Lee",
  surgery_date: "2023-06-15",
  patient_age: 42,
  patient_gender: "female",
  patient_location: "Rochester, NY",
  is_featured: true,
  
  description: "This patient desired a more refreshed...",
  patient_goals: "Reduce forehead lines...",
  outcome_summary: "Excellent results...",
  
  photos: [
    { type: "before", angle: "front", url: "..." },
    { type: "after", angle: "front", url: "..." },
    { type: "before", angle: "side", url: "..." },
    { type: "after", angle: "side", url: "..." }
  ]
}
```

## 💡 高级功能

### 1. 筛选和搜索
```typescript
// 按医生筛选
WHERE surgeon_name = 'Dr. Heather Lee'

// 按年龄范围筛选
WHERE patient_age BETWEEN 30 AND 40

// 按日期筛选
WHERE surgery_date >= '2023-01-01'
```

### 2. 案例统计
```sql
-- 每个手术的案例数量
SELECT 
  p.procedure_name,
  COUNT(c.id) as case_count
FROM procedures p
LEFT JOIN cases c ON p.id = c.procedure_id
GROUP BY p.procedure_name
ORDER BY case_count DESC;
```

### 3. 多角度照片支持
- front（正面）
- side（侧面）
- profile（侧脸）
- 45-degree（45度角）
- oblique（斜角）

每个案例可以有多个角度的 Before/After 照片。

## 🔐 隐私注意事项

- 确保获得患者同意使用照片
- 可以选择性隐藏患者信息（年龄、位置）
- 考虑使用水印保护照片
- 遵守 HIPAA 或当地隐私法规

## 📞 需要帮助？

如果需要：
1. 批量导入现有案例
2. 创建案例管理后台
3. 图片优化和 CDN 设置
4. 自定义案例展示方式

随时询问！

---

**现在你可以为每个手术添加几十个真实案例了！** 🎉

