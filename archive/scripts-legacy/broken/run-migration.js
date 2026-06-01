#!/usr/bin/env node
/**
 * 运行数据库 migration 脚本
 * 使用方法: node scripts/run-migration.js migrations/003_add_procedure_currency.sql
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从 .env 文件读取环境变量
require('dotenv').config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 错误: 未找到 SUPABASE_URL 或 SUPABASE_SERVICE_KEY')
  console.error('请确保 .env 文件中包含这些变量')
  process.exit(1)
}

const migrationFile = process.argv[2]

if (!migrationFile) {
  console.error('❌ 错误: 请提供 migration 文件路径')
  console.error('使用方法: node scripts/run-migration.js migrations/003_add_procedure_currency.sql')
  process.exit(1)
}

const migrationPath = path.join(__dirname, '..', migrationFile)

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ 错误: 文件不存在: ${migrationPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(migrationPath, 'utf8')

console.log(`📄 读取 migration 文件: ${migrationFile}`)
console.log(`🔗 连接到 Supabase: ${SUPABASE_URL}`)
console.log(`\n执行 SQL:\n${sql}\n`)

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false
  }
})

async function runMigration() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // 如果 exec_sql 函数不存在，尝试直接使用 from().select()
      console.log('⚠️  exec_sql 函数不存在，尝试使用原始查询...')

      // 将 SQL 拆分为单独的语句
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'))

      for (const statement of statements) {
        if (statement) {
          console.log(`\n执行: ${statement.substring(0, 100)}...`)
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ query: statement })
          })

          if (!response.ok) {
            console.error(`❌ 执行失败: ${await response.text()}`)
          }
        }
      }

      console.log('\n✅ Migration 已提交')
      console.log('\n📝 如果上述方法失败，请手动在 Supabase Dashboard 执行:')
      console.log(`   1. 访问: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql`)
      console.log(`   2. 在 SQL Editor 中粘贴并运行以下 SQL:\n`)
      console.log(sql)
      return
    }

    console.log('✅ Migration 执行成功!')
    console.log('结果:', data)
  } catch (err) {
    console.error('❌ 执行失败:', err.message)
    console.log('\n📝 请手动在 Supabase Dashboard 执行:')
    console.log(`   1. 访问: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`)
    console.log(`   2. 在 SQL Editor 中粘贴并运行以下 SQL:\n`)
    console.log(sql)
  }
}

runMigration()
