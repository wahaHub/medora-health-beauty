# Supabase Setup Guide

## 📋 步骤

### 1️⃣ 创建数据库表

在 Supabase 控制台中执行以下步骤：

1. 打开 Supabase Dashboard: https://yamlikuqgmqiigeaqzaz.supabase.co
2. 进入 **SQL Editor**
3. 复制 `supabase_schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 执行

这将创建以下表：
- `procedures` - 手术基本信息
- `procedure_translations` - 多语言翻译内容
- `procedure_recovery` - 恢复信息
- `procedure_benefits` - 好处列表
- `procedure_candidacy` - 候选人标准
- `procedure_techniques` - 手术技术
- `procedure_recovery_timeline` - 恢复时间线
- `procedure_recovery_tips` - 恢复建议
- `complementary_procedures` - 互补手术
- `procedure_risks` - 风险和注意事项

### 2️⃣ 导入数据

运行导入脚本将 JSON 数据导入 Supabase：

```bash
node import-to-supabase.js
```

这将会：
- 读取 `procedures_content_en.json` 文件
- 自动分类每个手术（face/body/non-surgical）
- 将所有 79 个手术及其详细信息导入数据库
- 显示导入进度和结果

### 3️⃣ 验证数据

1. 在 Supabase Dashboard 中进入 **Table Editor**
2. 检查各个表是否有数据
3. 运行测试查询：

```sql
-- 查看所有手术
SELECT * FROM procedures;

-- 查看英文翻译
SELECT p.procedure_name, pt.overview 
FROM procedures p
JOIN procedure_translations pt ON p.id = pt.procedure_id
WHERE pt.language_code = 'en'
LIMIT 10;

-- 按类别统计
SELECT category, COUNT(*) 
FROM procedures 
GROUP BY category;
```

## 🌐 多语言支持

### 添加新语言（例如中文）

当你准备好中文翻译后：

```javascript
// 在 import-to-supabase.js 中修改或创建新的导入脚本
await supabase.from('procedure_translations').insert({
  procedure_id: procedureId,
  language_code: 'zh', // 中文
  overview: '中文概述...',
  anesthesia: '麻醉信息...',
  procedure_description: '手术过程...'
});
```

### 支持的语言代码
- `en` - English
- `zh` - 中文
- `es` - Español
- `fr` - Français
- `de` - Deutsch
- 等等...

## 🔐 安全设置

当前配置：
- ✅ 所有表都启用了 Row Level Security (RLS)
- ✅ 公开读取权限（适合公开网站）
- ❌ 写入权限需要认证（保护数据）

如果需要修改权限，在 Supabase Dashboard 的 **Authentication > Policies** 中配置。

## 📊 数据库结构

```
procedures (主表)
├── id (UUID)
├── procedure_name (VARCHAR)
├── slug (VARCHAR) - 用于URL
├── category (VARCHAR) - face/body/non-surgical
└── timestamps

procedure_translations (多语言内容)
├── procedure_id (FK)
├── language_code (VARCHAR)
├── overview (TEXT)
├── anesthesia (TEXT)
└── procedure_description (TEXT)

... 其他关联表
```

## 🚀 在前端使用

创建 Supabase 客户端：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 获取所有手术
const { data: procedures } = await supabase
  .from('procedures')
  .select('*')

// 获取特定手术的详细信息（包含翻译）
const { data: procedure } = await supabase
  .from('procedures')
  .select(`
    *,
    procedure_translations!inner(
      overview,
      anesthesia,
      procedure_description
    ),
    procedure_benefits(benefit_text),
    procedure_techniques(technique_name, description)
  `)
  .eq('slug', 'brow-lift')
  .eq('procedure_translations.language_code', 'en')
  .single()
```

## 📝 注意事项

1. **Service Role Key** 只在服务器端使用（如导入脚本）
2. **Anon Key** 用于前端应用
3. 不要将 Service Role Key 暴露给客户端
4. `.env.local` 文件已添加到 `.gitignore`

