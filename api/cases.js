import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://yamlikuqgmqiigeaqzaz.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbWxpa3VxZ21xaWlnZWFxemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwODAyMzMsImV4cCI6MjA4MjY1NjIzM30.7VJLrsFbMsFt9A0Y74KBgDbK_sUFN5kQqbpVm9JiOnc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }

  try {
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
