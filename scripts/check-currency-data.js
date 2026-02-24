#!/usr/bin/env node
/**
 * 检查 hospital_procedures 表中的 currency 数据
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function checkCurrencyData() {
  console.log('📊 检查 hospital_procedures 中的 currency 数据...\n')

  // 1. 检查所有 hospital_procedures 的 currency 值
  const { data: procedures, error } = await supabase
    .from('hospital_procedures')
    .select(`
      id,
      currency,
      price_range,
      hospitals (
        id,
        name,
        slug
      )
    `)

  if (error) {
    console.error('❌ 查询失败:', error)
    return
  }

  console.log(`总共 ${procedures.length} 条 hospital_procedures 记录\n`)

  // 2. 统计 currency 分布
  const currencyStats = {}
  procedures.forEach(proc => {
    const curr = proc.currency || 'NULL'
    currencyStats[curr] = (currencyStats[curr] || 0) + 1
  })

  console.log('💱 Currency 分布:')
  Object.entries(currencyStats).forEach(([curr, count]) => {
    console.log(`   ${curr}: ${count} 条`)
  })

  console.log('\n🏥 各医院的 currency 情况:')
  const byHospital = {}
  procedures.forEach(proc => {
    const hospitalName = proc.hospitals?.name || 'Unknown'
    if (!byHospital[hospitalName]) {
      byHospital[hospitalName] = {
        slug: proc.hospitals?.slug,
        currencies: new Set(),
        count: 0
      }
    }
    byHospital[hospitalName].currencies.add(proc.currency || 'NULL')
    byHospital[hospitalName].count++
  })

  Object.entries(byHospital).forEach(([name, info]) => {
    console.log(`   ${name} (${info.slug}): ${Array.from(info.currencies).join(', ')} - ${info.count} 条记录`)
  })
}

checkCurrencyData()
