import { withAuth } from '../_utils/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug } = req.query;

  // GET - 获取某个 procedure 的所有 cases
  if (req.method === 'GET') {
    try {
      if (!slug) {
        return res.status(400).json({ success: false, message: 'Slug is required' });
      }

      // 先通过 slug 获取 procedure_id
      const { data: procedure, error: procError } = await supabase
        .from('procedures')
        .select('id')
        .eq('slug', slug)
        .single();

      if (procError || !procedure) {
        // 如果找不到 procedure，返回空数组
        return res.status(200).json({ success: true, cases: [] });
      }

      // 获取该 procedure 的所有 cases
      const { data: cases, error: casesError } = await supabase
        .from('procedure_cases')
        .select('*')
        .eq('procedure_id', procedure.id)
        .order('sort_order', { ascending: true });

      if (casesError) {
        throw casesError;
      }

      return res.status(200).json({ success: true, cases: cases || [] });
    } catch (error) {
      console.error('Get cases error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST - 创建或更新 case
  if (req.method === 'POST') {
    try {
      const { slug: bodySlug, case_number, description, provider_name, patient_age, patient_gender, image_count, sort_order } = req.body;
      const procedureSlug = slug || bodySlug;

      if (!procedureSlug || !case_number) {
        return res.status(400).json({ success: false, message: 'Slug and case_number are required' });
      }

      // 获取 procedure_id
      const { data: procedure, error: procError } = await supabase
        .from('procedures')
        .select('id')
        .eq('slug', procedureSlug)
        .single();

      if (procError || !procedure) {
        return res.status(404).json({ success: false, message: 'Procedure not found' });
      }

      // Upsert case
      const { data: caseData, error: caseError } = await supabase
        .from('procedure_cases')
        .upsert({
          procedure_id: procedure.id,
          case_number,
          description: description || '',
          provider_name: provider_name || 'Dr. Heather Lee',
          patient_age: patient_age || null,
          patient_gender: patient_gender || null,
          image_count: image_count || 2,
          sort_order: sort_order || 0,
        }, {
          onConflict: 'procedure_id,case_number'
        })
        .select()
        .single();

      if (caseError) {
        throw caseError;
      }

      return res.status(200).json({ success: true, case: caseData });
    } catch (error) {
      console.error('Save case error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE - 删除 case
  if (req.method === 'DELETE') {
    try {
      const { case_number } = req.query;

      if (!slug || !case_number) {
        return res.status(400).json({ success: false, message: 'Slug and case_number are required' });
      }

      // 获取 procedure_id
      const { data: procedure, error: procError } = await supabase
        .from('procedures')
        .select('id')
        .eq('slug', slug)
        .single();

      if (procError || !procedure) {
        return res.status(404).json({ success: false, message: 'Procedure not found' });
      }

      // 删除 case
      const { error: deleteError } = await supabase
        .from('procedure_cases')
        .delete()
        .eq('procedure_id', procedure.id)
        .eq('case_number', case_number);

      if (deleteError) {
        throw deleteError;
      }

      return res.status(200).json({ success: true, message: 'Case deleted' });
    } catch (error) {
      console.error('Delete case error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

export default withAuth(handler);
