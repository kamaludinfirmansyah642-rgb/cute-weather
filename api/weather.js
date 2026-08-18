import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Handler for storing locations
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { city, latitude, longitude, icon_type, source } = req.body;
      
      const { data, error } = await supabase
        .from('locations')
        .insert([{ name: city, latitude, longitude, icon_type, source: source || 'manual' }]);
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}