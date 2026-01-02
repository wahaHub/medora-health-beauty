#!/usr/bin/env node
/**
 * 国际化数据导入脚本 (Node.js 版本 - 高性能)
 * 使用 upsert 替代 delete+insert，速度提升5-10倍
 * Run with: node import-i18n-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==================== 配置 ====================

const SUPABASE_URL = 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4MDIzMywiZXhwIjoyMDgyNjU2MjMzfQ.n2CGlu8qhDEjEM6pKJF79yv9C3DTQ3qF0PnJMHUJu7w';

// 语言代码映射（不包括英文）
const LANGUAGES = {
  'zh': '简体中文',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'ru': 'Русский',
  'ar': 'العربية',
  'vi': 'Tiếng Việt',
  'id': 'Bahasa Indonesia'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ==================== 工具函数 ====================

function removeParentheses(text) {
  if (!text) return text;
  
  const patterns = [
    /\s*\([^)]*\)/g,      // (content)
    /\s*\[[^\]]*\]/g,     // [content]
    /\s*\{[^}]*\}/g,      // {content}
    /\s*【[^】]*】/g,      // 【content】
    /\s*（[^）]*）/g       // （content）
  ];
  
  let result = text;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  
  return result.trim();
}

async function getProcedureByName(procedureName) {
  const cleanName = removeParentheses(procedureName);
  
  // 精确匹配
  let { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('procedure_name', cleanName)
    .maybeSingle();
  
  if (data) return data;
  
  // 模糊匹配
  ({ data, error } = await supabase
    .from('procedures')
    .select('*')
    .ilike('procedure_name', `${cleanName}%`)
    .limit(1)
    .maybeSingle());
  
  return data;
}

// ==================== 清理函数 ====================

async function cleanupNonEnglishData() {
  console.log('🧹 开始清理非英语翻译数据...');
  console.log('='.repeat(70));
  
  const tables = [
    'procedure_translations',
    'procedure_recovery',
    'procedure_benefits',
    'procedure_candidacy',
    'procedure_techniques',
    'procedure_recovery_timeline',
    'procedure_recovery_tips',
    'complementary_procedures',
    'procedure_risks'
  ];
  
  let totalDeleted = 0;
  
  for (const tableName of tables) {
    try {
      console.log(`\n📋 清理表: ${tableName}`);
      
      // 查询非英语记录数
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('id', { count: 'exact', head: true })
        .neq('language_code', 'en');
      
      if (countError) {
        console.log(`   ❌ 查询错误: ${countError.message}`);
        continue;
      }
      
      if (!count || count === 0) {
        console.log(`   ✓ 没有非英语数据`);
        continue;
      }
      
      console.log(`   发现 ${count} 条非英语记录`);
      
      // 删除非英语记录
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('language_code', 'en');
      
      if (deleteError) {
        console.log(`   ❌ 删除错误: ${deleteError.message}`);
        continue;
      }
      
      console.log(`   ✅ 已删除 ${count} 条记录`);
      totalDeleted += count;
      
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
      continue;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`🎉 清理完成！共删除 ${totalDeleted} 条非英语记录`);
  console.log(`✅ 英语(en)数据已保留\n`);
  
  return totalDeleted;
}

// ==================== Upsert 函数（关键优化！）====================

async function upsertTranslation(procedureId, languageCode, overview, anesthesia, procedureDesc) {
  try {
    const { error } = await supabase
      .from('procedure_translations')
      .upsert({
        procedure_id: procedureId,
        language_code: languageCode,
        overview: overview || null,
        anesthesia: anesthesia || null,
        procedure_description: procedureDesc || null
      }, {
        onConflict: 'procedure_id,language_code'
      });
    
    return !error;
  } catch (error) {
    console.log(`      ❌ Translation error: ${error.message}`);
    return false;
  }
}

async function upsertRecovery(procedureId, languageCode, recoveryData) {
  try {
    const { error } = await supabase
      .from('procedure_recovery')
      .upsert({
        procedure_id: procedureId,
        language_code: languageCode,
        recovery_time: recoveryData?.recovery_time || null,
        ready_to_go_out: recoveryData?.ready_to_go_out || null,
        resume_exercise: recoveryData?.resume_exercise || null,
        final_results: recoveryData?.final_results || null
      }, {
        onConflict: 'procedure_id,language_code'
      });
    
    return !error;
  } catch (error) {
    console.log(`      ❌ Recovery error: ${error.message}`);
    return false;
  }
}

async function upsertList(tableName, procedureId, languageCode, items, dataKey) {
  try {
    // 先删除旧数据
    await supabase
      .from(tableName)
      .delete()
      .eq('procedure_id', procedureId)
      .eq('language_code', languageCode);
    
    if (!items || items.length === 0) return true;
    
    // 准备批量数据
    const batchData = items.map((item, index) => {
      if (typeof item === 'object' && !Array.isArray(item)) {
        return {
          procedure_id: procedureId,
          language_code: languageCode,
          sort_order: index,
          ...item
        };
      } else {
        return {
          procedure_id: procedureId,
          language_code: languageCode,
          [dataKey]: item,
          sort_order: index
        };
      }
    });
    
    // 批量插入
    const { error } = await supabase
      .from(tableName)
      .insert(batchData);
    
    return !error;
  } catch (error) {
    console.log(`      ❌ ${tableName} error: ${error.message}`);
    return false;
  }
}

// ==================== 主处理函数 ====================

async function processProcedureTranslation(enProcedure, translatedProcedure, languageCode) {
  const enName = enProcedure.procedureName || '';
  const translatedName = translatedProcedure.procedureName || '';
  const cleanTranslatedName = removeParentheses(translatedName);
  
  console.log(`  [${languageCode}] ${cleanTranslatedName}`);
  console.log(`    EN: ${enName}`);
  
  // 根据英文名称查找
  const procedure = await getProcedureByName(enName);
  
  if (!procedure) {
    console.log(`    ❌ Not found in database`);
    return false;
  }
  
  const procedureId = procedure.id;
  console.log(`    ✅ Found (ID: ${procedureId.substring(0, 8)}...)`);
  
  const sectionsInserted = [];
  
  // 1. 基础翻译 (使用 upsert，不需要先查询)
  if (await upsertTranslation(
    procedureId, 
    languageCode,
    translatedProcedure.overview,
    translatedProcedure.anesthesia,
    translatedProcedure.procedure
  )) {
    sectionsInserted.push('translation');
  }
  
  // 2. 恢复时间
  if (translatedProcedure.recovery) {
    if (await upsertRecovery(procedureId, languageCode, translatedProcedure.recovery)) {
      sectionsInserted.push('recovery');
    }
  }
  
  // 3. 优势
  if (translatedProcedure.benefits) {
    if (await upsertList('procedure_benefits', procedureId, languageCode, translatedProcedure.benefits, 'benefit_text')) {
      sectionsInserted.push(`benefits(${translatedProcedure.benefits.length})`);
    }
  }
  
  // 4. 适应症
  if (translatedProcedure.candidacy) {
    if (await upsertList('procedure_candidacy', procedureId, languageCode, translatedProcedure.candidacy, 'candidacy_text')) {
      sectionsInserted.push(`candidacy(${translatedProcedure.candidacy.length})`);
    }
  }
  
  // 5. 技术
  if (translatedProcedure.techniques) {
    const techniques = translatedProcedure.techniques.map(tech => ({
      technique_name: tech.name || '',
      description: tech.description || ''
    }));
    if (await upsertList('procedure_techniques', procedureId, languageCode, techniques, null)) {
      sectionsInserted.push(`techniques(${techniques.length})`);
    }
  }
  
  // 6. 恢复时间线
  if (translatedProcedure.recoveryTimeline) {
    const timeline = translatedProcedure.recoveryTimeline.map(item => ({
      timepoint: item.timepoint || '',
      guidance: item.guidance || ''
    }));
    if (await upsertList('procedure_recovery_timeline', procedureId, languageCode, timeline, null)) {
      sectionsInserted.push(`timeline(${timeline.length})`);
    }
  }
  
  // 7. 恢复小贴士
  if (translatedProcedure.recoveryTips) {
    if (await upsertList('procedure_recovery_tips', procedureId, languageCode, translatedProcedure.recoveryTips, 'tip_text')) {
      sectionsInserted.push(`tips(${translatedProcedure.recoveryTips.length})`);
    }
  }
  
  // 8. 风险
  if (translatedProcedure.risks || translatedProcedure.risksAndConsiderations) {
    const risks = translatedProcedure.risks || translatedProcedure.risksAndConsiderations;
    if (await upsertList('procedure_risks', procedureId, languageCode, risks, 'risk_text')) {
      sectionsInserted.push(`risks(${risks.length})`);
    }
  }
  
  // 9. 互补手术
  if (translatedProcedure.complementaryProcedures) {
    // 先删除旧数据
    await supabase
      .from('complementary_procedures')
      .delete()
      .eq('procedure_id', procedureId)
      .eq('language_code', languageCode);
    
    const complementary = translatedProcedure.complementaryProcedures.map((item, index) => {
      // 如果是字符串，直接使用
      if (typeof item === 'string') {
        return {
          procedure_id: procedureId,
          language_code: languageCode,
          complementary_name: item,
          reason: '',
          sort_order: index
        };
      }
      // 如果是对象，使用其属性
      return {
        procedure_id: procedureId,
        language_code: languageCode,
        complementary_name: item.name || item.complementary_name || '',
        reason: item.reason || '',
        sort_order: index
      };
    });
    
    if (complementary.length > 0) {
      const { error } = await supabase
        .from('complementary_procedures')
        .insert(complementary);
      
      if (!error) {
        sectionsInserted.push(`complementary(${complementary.length})`);
      }
    }
  }
  
  console.log(`    ✅ Inserted: ${sectionsInserted.join(', ')}`);
  return true;
}

async function processLanguage(translationsDir, languageCode, enProcedures) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Language: ${languageCode} (${LANGUAGES[languageCode] || 'Unknown'})`);
  console.log('='.repeat(70));
  
  const filePath = join(translationsDir, `procedures_content_${languageCode}.json`);
  
  let translatedData;
  try {
    translatedData = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  const translatedProcedures = translatedData.procedures || [];
  console.log(`Total procedures: ${translatedProcedures.length}`);
  
  if (enProcedures.length !== translatedProcedures.length) {
    console.log(`⚠️  Warning: English has ${enProcedures.length} procedures, but ${languageCode} has ${translatedProcedures.length}`);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < Math.min(enProcedures.length, translatedProcedures.length); i++) {
    try {
      if (await processProcedureTranslation(enProcedures[i], translatedProcedures[i], languageCode)) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Summary for ${languageCode}:`);
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log('='.repeat(70));
}

// ==================== 主函数 ====================

async function main() {
  console.log('🚀 Starting i18n data import to Supabase (Node.js 高性能版本)');
  console.log('Strategy: Using UPSERT for optimal performance\n');
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);
  console.log('✅ Supabase client initialized\n');
  
  // 询问是否需要先清理旧数据
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const shouldCleanup = await new Promise((resolve) => {
    rl.question('🧹 是否需要先清理所有非英语数据？(输入 yes 清理, 直接回车跳过): ', (answer) => {
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
  
  if (shouldCleanup) {
    console.log('\n开始清理非英语数据...');
    const totalDeleted = await cleanupNonEnglishData();
    console.log(`\n✅ 清理完成！删除了 ${totalDeleted} 条记录\n`);
    
    const shouldContinue = await new Promise((resolve) => {
      rl.question('继续导入新数据？(输入 yes 继续, 其他键退出): ', (answer) => {
        resolve(answer.trim().toLowerCase() === 'yes');
      });
    });
    
    if (!shouldContinue) {
      console.log('❌ 已取消导入');
      rl.close();
      return;
    }
    console.log('\n');
  } else {
    console.log('⏭️  跳过清理步骤\n');
  }
  
  rl.close();
  
  console.log('='.repeat(70));
  console.log('开始导入翻译数据...');
  console.log('='.repeat(70) + '\n');
  
  // 读取英文参考数据
  const translationsDir = join(__dirname, 'translations');
  const enFilePath = join(translationsDir, 'procedures_content_en.json');
  
  let enData;
  try {
    enData = JSON.parse(readFileSync(enFilePath, 'utf8'));
  } catch (error) {
    console.log(`❌ English reference file not found: ${enFilePath}`);
    return;
  }
  
  const enProcedures = enData.procedures || [];
  console.log(`📖 Loaded English reference: ${enProcedures.length} procedures\n`);
  
  // 处理每种语言
  const startTime = Date.now();
  
  for (const langCode of Object.keys(LANGUAGES)) {
    try {
      await processLanguage(translationsDir, langCode, enProcedures);
    } catch (error) {
      console.log(`\n❌ Fatal error processing ${langCode}: ${error.message}`);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(70));
  console.log('🎉 Import completed!');
  console.log(`⏱️  Total time: ${duration} seconds`);
  console.log('='.repeat(70));
}

// 运行主函数
main().catch(console.error);

