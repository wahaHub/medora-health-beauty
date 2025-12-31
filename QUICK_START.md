# 🚀 快速开始 - Supabase 设置

## 第一步：创建数据库表

### 方法 1：使用 Supabase Dashboard（推荐）

1. 打开浏览器，访问：https://yamlikuqgmqiigeaqzaz.supabase.co
2. 登录你的 Supabase 账号
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query** 创建新查询
5. 打开项目中的 `supabase_schema.sql` 文件
6. 复制全部内容
7. 粘贴到 SQL Editor 中
8. 点击右下角的 **Run** 按钮执行

✅ 完成后，你应该会看到成功消息，并且在 **Table Editor** 中能看到 10 个新表。

### 方法 2：使用命令行（需要安装 Supabase CLI）

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref yamlikuqgmqiigeaqzaz

# 执行 SQL
supabase db push
```

---

## 第二步：导入数据

在终端中运行：

```bash
npm run import-data
```

或者：

```bash
node import-to-supabase.js
```

你会看到类似这样的输出：

```
🚀 Starting import process...

📊 Found 79 procedures to import

📝 Importing: Brow Lift (Forehead Lift)
   Slug: brow-lift-forehead-lift
   Category: face
   ✅ Procedure created (ID: xxx...)
   ✅ Translation added
   ✅ Recovery info added
   ✅ 6 benefits added
   ✅ 6 candidacy items added
   ...
```

---

## 第三步：验证数据

### 在 Supabase Dashboard 中：

1. 进入 **Table Editor**
2. 点击 `procedures` 表
3. 你应该看到 79 条记录
4. 点击其他表（如 `procedure_translations`）验证数据

### 或者运行测试查询：

在 SQL Editor 中运行：

```sql
-- 查看所有手术
SELECT * FROM procedures LIMIT 10;

-- 按类别统计
SELECT category, COUNT(*) as count 
FROM procedures 
GROUP BY category;

-- 查看一个完整的手术详情
SELECT 
  p.procedure_name,
  p.category,
  pt.overview,
  pt.anesthesia
FROM procedures p
LEFT JOIN procedure_translations pt ON p.id = pt.procedure_id
WHERE p.slug = 'brow-lift-forehead-lift'
AND pt.language_code = 'en';
```

---

## ✅ 完成！

现在你的 Supabase 数据库已经准备好了！

### 下一步：

1. **在前端使用数据** - 查看 `SUPABASE_SETUP.md` 了解如何在 React 中使用
2. **添加其他语言** - 准备好中文翻译后，修改导入脚本添加 `language_code: 'zh'`
3. **配置环境变量** - 确保 `.env.local` 文件包含正确的 Supabase 凭证

---

## 🔧 故障排除

### 问题：导入脚本报错 "Cannot find module"
**解决：** 确保已经安装依赖
```bash
npm install
```

### 问题：SQL 执行失败
**解决：** 
1. 检查是否有表已经存在（如果有，先删除或使用 `DROP TABLE IF EXISTS`）
2. 确保你有足够的权限
3. 查看错误消息了解具体问题

### 问题：数据导入失败
**解决：**
1. 确保 `supabase_schema.sql` 已经成功执行
2. 检查 `procedures_content_en.json` 文件是否存在
3. 查看控制台错误消息

---

## 📞 需要帮助？

如果遇到问题，检查：
1. Supabase Dashboard 的 Logs 页面
2. 浏览器控制台的错误消息
3. 终端的输出信息

