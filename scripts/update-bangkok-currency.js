#!/usr/bin/env node
/**
 * 更新 Bangkok 医院的 currency 为 THB
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function updateBangkokCurrency() {
  console.log('🔄 更新 Bangkok 医院的 currency 为 THB...\n')

  // 1. 获取 Bangkok 医院的 ID
  const { data: hospital, error: hospitalError } = await supabase
    .from('hospitals')
    .select('id, name, slug')
    .eq('slug', 'bangkok-aesthetic-center')
    .single()

  if (hospitalError || !hospital) {
    console.error('❌ 未找到 Bangkok 医院:', hospitalError)
    return
  }

  console.log(`找到医院: ${hospital.name} (${hospital.slug})`)
  console.log(`医院 ID: ${hospital.id}\n`)

  // 2. 更新该医院的所有 procedures 的 currency 为 THB
  const { data: updated, error: updateError } = await supabase
    .from('hospital_procedures')
    .update({ currency: 'THB' })
    .eq('hospital_id', hospital.id)
    .select()

  if (updateError) {
    console.error('❌ 更新失败:', updateError)
    return
  }

  console.log(`✅ 成功更新 ${updated.length} 条记录的 currency 为 THB`)

  // 3. 验证更新结果
  const { data: verification } = await supabase
    .from('hospital_procedures')
    .select('currency')
    .eq('hospital_id', hospital.id)

  const currencyCount = {}
  verification.forEach(proc => {
    currencyCount[proc.currency] = (currencyCount[proc.currency] || 0) + 1
  })

  console.log('\n验证结果:')
  Object.entries(currencyCount).forEach(([curr, count]) => {
    console.log(`   ${curr}: ${count} 条`)
  })
}

updateBangkokCurrency()
