/**
 * Import sample cases (Before/After photos) to Supabase
 * This is an example showing how to add cases for procedures
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA4MDIzMywiZXhwIjoyMDgyNjU2MjMzfQ.n2CGlu8qhDEjEM6pKJF79yv9C3DTQ3qF0PnJMHUJu7w';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Sample cases data
const sampleCases = [
  {
    case_number: '1001510',
    procedure_slug: 'brow-lift-forehead-lift',
    surgeon_name: 'Dr. Heather Lee',
    surgery_date: '2023-06-15',
    patient_age: 42,
    patient_gender: 'female',
    patient_location: 'Rochester, NY',
    is_featured: true,
    display_order: 1,
    description: 'This patient came to us seeking a more refreshed and youthful appearance. She was bothered by deep forehead lines and sagging eyebrows that made her look tired.',
    patient_goals: 'Reduce forehead lines, lift sagging eyebrows, and achieve a more alert appearance without looking "done"',
    outcome_summary: 'Excellent results with natural-looking brow elevation and significantly smoother forehead. Patient is very satisfied with her refreshed appearance.',
    photos: [
      { type: 'before', angle: 'front', url: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1000', order: 1 },
      { type: 'after', angle: 'front', url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=1000', order: 2 },
      { type: 'before', angle: 'side', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000', order: 3 },
      { type: 'after', angle: 'side', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000', order: 4 }
    ]
  },
  {
    case_number: '1002341',
    procedure_slug: 'brow-lift-forehead-lift',
    surgeon_name: 'Dr. Vito Medora',
    surgery_date: '2023-08-22',
    patient_age: 38,
    patient_gender: 'female',
    patient_location: 'Buffalo, NY',
    is_featured: false,
    display_order: 2,
    description: 'Patient desired correction of asymmetric brows and reduction of horizontal forehead lines.',
    patient_goals: 'Achieve more symmetric brow position and smoother forehead',
    outcome_summary: 'Successfully corrected brow asymmetry with excellent symmetry and natural contour.',
    photos: [
      { type: 'before', angle: 'front', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000', order: 1 },
      { type: 'after', angle: 'front', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000', order: 2 }
    ]
  },
  {
    case_number: '1003567',
    procedure_slug: 'breast-augmentation-augmentation-mammoplasty',
    surgeon_name: 'Dr. Heather Lee',
    surgery_date: '2023-09-10',
    patient_age: 29,
    patient_gender: 'female',
    patient_location: 'Syracuse, NY',
    is_featured: true,
    display_order: 1,
    description: 'Patient desired fuller, more proportionate breasts while maintaining a natural appearance.',
    patient_goals: 'Achieve fuller breast volume with natural shape and feel',
    outcome_summary: 'Excellent outcome with natural-looking augmentation, patient very happy with proportions.',
    photos: [
      { type: 'before', angle: 'front', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000', order: 1 },
      { type: 'after', angle: 'front', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1000', order: 2 }
    ]
  }
];

async function importSampleCases() {
  console.log('🚀 Starting sample cases import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const caseData of sampleCases) {
    try {
      console.log(`\n📝 Importing case: ${caseData.case_number}`);
      
      // 1. Get procedure ID by slug
      const { data: procedure, error: procError } = await supabase
        .from('procedures')
        .select('id, procedure_name')
        .eq('slug', caseData.procedure_slug)
        .single();
      
      if (procError || !procedure) {
        console.error(`   ❌ Procedure not found: ${caseData.procedure_slug}`);
        errorCount++;
        continue;
      }
      
      console.log(`   ✅ Found procedure: ${procedure.procedure_name}`);
      
      // 2. Check if case already exists
      const { data: existingCase } = await supabase
        .from('cases')
        .select('id')
        .eq('case_number', caseData.case_number)
        .single();
      
      if (existingCase) {
        console.log(`   ⚠️  Case already exists, skipping...`);
        continue;
      }
      
      // 3. Insert case
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          case_number: caseData.case_number,
          procedure_id: procedure.id,
          surgeon_name: caseData.surgeon_name,
          surgery_date: caseData.surgery_date,
          patient_age: caseData.patient_age,
          patient_gender: caseData.patient_gender,
          patient_location: caseData.patient_location,
          is_featured: caseData.is_featured,
          display_order: caseData.display_order
        })
        .select()
        .single();
      
      if (caseError) {
        console.error(`   ❌ Error inserting case: ${caseError.message}`);
        errorCount++;
        continue;
      }
      
      const caseId = newCase.id;
      console.log(`   ✅ Case created (ID: ${caseId})`);
      
      // 4. Insert case translation
      await supabase.from('case_translations').insert({
        case_id: caseId,
        language_code: 'en',
        description: caseData.description,
        patient_goals: caseData.patient_goals,
        outcome_summary: caseData.outcome_summary
      });
      console.log(`   ✅ Translation added`);
      
      // 5. Insert photos
      const photos = caseData.photos.map(photo => ({
        case_id: caseId,
        photo_type: photo.type,
        view_angle: photo.angle,
        image_url: photo.url,
        display_order: photo.order
      }));
      
      await supabase.from('case_photos').insert(photos);
      console.log(`   ✅ ${photos.length} photos added`);
      
      // 6. Link to procedure (case_procedures table)
      await supabase.from('case_procedures').insert({
        case_id: caseId,
        procedure_id: procedure.id,
        is_primary: true
      });
      console.log(`   ✅ Procedure link created`);
      
      successCount++;
      console.log(`   ✅ Successfully imported case: ${caseData.case_number}`);
      
    } catch (error) {
      console.error(`   ❌ Error importing case ${caseData.case_number}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Import completed!`);
  console.log(`   Success: ${successCount} cases`);
  console.log(`   Errors: ${errorCount} cases\n`);
}

importSampleCases();

