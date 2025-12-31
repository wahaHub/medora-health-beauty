/**
 * Import procedures data from JSON to Supabase
 * Run with: node import-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Supabase configuration
const SUPABASE_URL = 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4MDIzMywiZXhwIjoyMDgyNjU2MjMzfQ.n2CGlu8qhDEjEM6pKJF79yv9C3DTQ3qF0PnJMHUJu7w';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to create slug from procedure name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[®™©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to categorize procedures
function categorizeProcedure(procedureName) {
  const name = procedureName.toLowerCase();
  
  // Face category keywords
  const faceKeywords = ['brow', 'face', 'eyelid', 'rhinoplasty', 'nose', 'chin', 'cheek', 
                        'forehead', 'temple', 'otoplasty', 'ear', 'neck', 'jaw', 'lip', 
                        'mohs', 'facial', 'zygomatic', 'submalar', 'buccal'];
  
  // Body category keywords
  const bodyKeywords = ['breast', 'body', 'tummy', 'abdomen', 'liposuction', 'arm', 
                       'thigh', 'buttock', 'bbl', 'mommy', 'labiaplasty', 'gynecomastia',
                       'panniculectomy', 'lift', 'mons pubis', 'weight loss'];
  
  // Non-surgical keywords
  const nonSurgicalKeywords = ['botox', 'filler', 'injectable', 'peel', 'laser', 
                               'microdermabrasion', 'microneedling', 'prp', 'prf', 
                               'photofacial', 'ipl', 'avéli', 'collagen', 'non-surgical'];
  
  // Check for non-surgical first (more specific)
  if (nonSurgicalKeywords.some(keyword => name.includes(keyword))) {
    return 'non-surgical';
  }
  
  // Then check face
  if (faceKeywords.some(keyword => name.includes(keyword))) {
    return 'face';
  }
  
  // Then check body
  if (bodyKeywords.some(keyword => name.includes(keyword))) {
    return 'body';
  }
  
  // Default to face if uncertain
  return 'face';
}

async function importProcedures() {
  try {
    console.log('🚀 Starting import process...\n');
    
    // Read JSON file
    const jsonData = JSON.parse(readFileSync('./procedures_content_en.json', 'utf8'));
    const procedures = jsonData.procedures;
    
    console.log(`📊 Found ${procedures.length} procedures to import\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const proc of procedures) {
      try {
        const slug = createSlug(proc.procedureName);
        const category = categorizeProcedure(proc.procedureName);
        
        console.log(`\n📝 Importing: ${proc.procedureName}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Category: ${category}`);
        
        // 1. Check if procedure already exists
        const { data: existingProc } = await supabase
          .from('procedures')
          .select('id, procedure_name')
          .eq('procedure_name', proc.procedureName)
          .single();
        
        let procedureId;
        
        if (existingProc) {
          console.log(`   ⚠️  Procedure already exists, skipping: ${proc.procedureName}`);
          procedureId = existingProc.id;
          successCount++;
          continue; // Skip to next procedure
        }
        
        // Insert main procedure
        const { data: procedureData, error: procedureError } = await supabase
          .from('procedures')
          .insert({
            procedure_name: proc.procedureName,
            slug: slug,
            category: category
          })
          .select()
          .single();
        
        if (procedureError) {
          console.error(`   ❌ Error inserting procedure: ${procedureError.message}`);
          errorCount++;
          continue;
        }
        
        procedureId = procedureData.id;
        console.log(`   ✅ Procedure created (ID: ${procedureId})`);
        
        // 2. Insert translation
        await supabase.from('procedure_translations').insert({
          procedure_id: procedureId,
          language_code: 'en',
          overview: proc.overview || null,
          anesthesia: proc.anesthesia || null,
          procedure_description: proc.procedure || null
        });
        console.log(`   ✅ Translation added`);
        
        // 3. Insert recovery info
        if (proc.recovery) {
          await supabase.from('procedure_recovery').insert({
            procedure_id: procedureId,
            language_code: 'en',
            recovery_time: proc.recovery.recovery_time || null,
            ready_to_go_out: proc.recovery.ready_to_go_out || null,
            resume_exercise: proc.recovery.resume_exercise || null,
            final_results: proc.recovery.final_results || null
          });
          console.log(`   ✅ Recovery info added`);
        }
        
        // 4. Insert benefits
        if (proc.benefits && Array.isArray(proc.benefits)) {
          const benefits = proc.benefits.map((benefit, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            benefit_text: benefit,
            sort_order: index
          }));
          await supabase.from('procedure_benefits').insert(benefits);
          console.log(`   ✅ ${proc.benefits.length} benefits added`);
        }
        
        // 5. Insert candidacy
        if (proc.candidacy && Array.isArray(proc.candidacy)) {
          const candidacy = proc.candidacy.map((item, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            candidacy_text: item,
            sort_order: index
          }));
          await supabase.from('procedure_candidacy').insert(candidacy);
          console.log(`   ✅ ${proc.candidacy.length} candidacy items added`);
        }
        
        // 6. Insert techniques
        if (proc.techniques && Array.isArray(proc.techniques)) {
          const techniques = proc.techniques.map((tech, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            technique_name: tech.name,
            description: tech.description,
            sort_order: index
          }));
          await supabase.from('procedure_techniques').insert(techniques);
          console.log(`   ✅ ${proc.techniques.length} techniques added`);
        }
        
        // 7. Insert recovery timeline
        if (proc.recoveryTimeline && Array.isArray(proc.recoveryTimeline)) {
          const timeline = proc.recoveryTimeline.map((item, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            timepoint: item.timepoint,
            guidance: item.guidance,
            sort_order: index
          }));
          await supabase.from('procedure_recovery_timeline').insert(timeline);
          console.log(`   ✅ ${proc.recoveryTimeline.length} recovery timeline items added`);
        }
        
        // 8. Insert recovery tips
        if (proc.recoveryTips && Array.isArray(proc.recoveryTips)) {
          const tips = proc.recoveryTips.map((tip, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            tip_text: tip,
            sort_order: index
          }));
          await supabase.from('procedure_recovery_tips').insert(tips);
          console.log(`   ✅ ${proc.recoveryTips.length} recovery tips added`);
        }
        
        // 9. Insert complementary procedures
        if (proc.complementaryProcedures && Array.isArray(proc.complementaryProcedures)) {
          const complementary = proc.complementaryProcedures.map((item, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            complementary_name: item.name,
            reason: item.reason,
            sort_order: index
          }));
          await supabase.from('complementary_procedures').insert(complementary);
          console.log(`   ✅ ${proc.complementaryProcedures.length} complementary procedures added`);
        }
        
        // 10. Insert risks
        if (proc.risksAndConsiderations && Array.isArray(proc.risksAndConsiderations)) {
          const risks = proc.risksAndConsiderations.map((risk, index) => ({
            procedure_id: procedureId,
            language_code: 'en',
            risk_text: risk,
            sort_order: index
          }));
          await supabase.from('procedure_risks').insert(risks);
          console.log(`   ✅ ${proc.risksAndConsiderations.length} risks added`);
        }
        
        successCount++;
        console.log(`   ✅ Successfully imported: ${proc.procedureName}`);
        
      } catch (error) {
        console.error(`   ❌ Error importing ${proc.procedureName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Import completed!`);
    console.log(`   Success: ${successCount} procedures`);
    console.log(`   Errors: ${errorCount} procedures\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run import
importProcedures();

