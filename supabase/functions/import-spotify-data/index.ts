import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Derive risk category from user data patterns
const deriveRiskCategory = (user: {
  churn: number;
  days_since_last_login: number;
  avg_listening_hours_per_week: number;
  songs_skipped_per_week: number;
  login_frequency_per_week: number;
  subscription_type: string;
  playlists_created: number;
}): 'Low' | 'Medium' | 'High' => {
  if (user.churn === 1) return 'High';
  
  let riskScore = 0;
  
  if (user.days_since_last_login > 60) riskScore += 30;
  else if (user.days_since_last_login > 30) riskScore += 20;
  else if (user.days_since_last_login > 14) riskScore += 10;
  
  if (user.avg_listening_hours_per_week < 5) riskScore += 25;
  else if (user.avg_listening_hours_per_week < 15) riskScore += 15;
  else if (user.avg_listening_hours_per_week < 25) riskScore += 5;
  
  if (user.songs_skipped_per_week > 60) riskScore += 20;
  else if (user.songs_skipped_per_week > 40) riskScore += 10;
  
  if (user.login_frequency_per_week < 2) riskScore += 15;
  else if (user.login_frequency_per_week < 5) riskScore += 5;
  
  if (user.subscription_type === 'Free') riskScore += 10;
  if (user.playlists_created === 0) riskScore += 5;
  
  if (riskScore >= 50) return 'High';
  if (riskScore >= 25) return 'Medium';
  return 'Low';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { csvData, batchSize = 1000 } = await req.json();

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'No CSV data provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');
    
    let imported = 0;
    let errors = 0;
    const batch: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      
      if (values.length !== headers.length) {
        errors++;
        continue;
      }

      const user = {
        user_id: parseInt(values[0]),
        subscription_type: values[1] as 'Free' | 'Premium',
        age: parseInt(values[2]),
        country: values[3],
        avg_listening_hours_per_week: parseFloat(values[4]),
        login_frequency_per_week: parseInt(values[5]),
        songs_skipped_per_week: parseInt(values[6]),
        playlists_created: parseInt(values[7]),
        days_since_last_login: parseInt(values[8]),
        monthly_spend_usd: parseFloat(values[9]),
        churn: parseInt(values[10]) as 0 | 1,
        risk_category: '' as 'Low' | 'Medium' | 'High',
      };

      user.risk_category = deriveRiskCategory(user);
      batch.push(user);

      if (batch.length >= batchSize) {
        const { error } = await supabase.from('spotify_users').insert(batch);
        if (error) {
          console.error('Batch insert error:', error);
          errors += batch.length;
        } else {
          imported += batch.length;
        }
        batch.length = 0;
      }
    }

    // Insert remaining records
    if (batch.length > 0) {
      const { error } = await supabase.from('spotify_users').insert(batch);
      if (error) {
        console.error('Final batch insert error:', error);
        errors += batch.length;
      } else {
        imported += batch.length;
      }
    }

    console.log(`Import complete: ${imported} imported, ${errors} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported, 
        errors,
        total: lines.length - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
