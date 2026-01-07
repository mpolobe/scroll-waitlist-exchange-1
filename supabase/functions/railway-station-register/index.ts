// Railway Station Registration API
// Allows approved railway companies to register their stations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get API key from header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify API key and get company
    const { data: company, error: companyError } = await supabaseClient
      .from('railway_companies')
      .select('id, company_name, status')
      .eq('api_key', apiKey)
      .eq('status', 'approved')
      .single()

    if (companyError || !company) {
      return new Response(
        JSON.stringify({ error: 'Invalid or unauthorized API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const {
      station_name,
      station_code,
      city,
      country,
      latitude,
      longitude,
      address,
      facilities
    } = await req.json()

    // Validate required fields
    if (!station_name || !station_code || !city || !country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: station_name, station_code, city, country' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if station code already exists
    const { data: existing } = await supabaseClient
      .from('railway_stations')
      .select('id')
      .eq('station_code', station_code)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Station code already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Register station
    const { data: station, error: insertError } = await supabaseClient
      .from('railway_stations')
      .insert({
        company_id: company.id,
        station_name,
        station_code,
        city,
        country,
        latitude,
        longitude,
        address,
        facilities: facilities || [],
        status: 'active'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Log API usage
    await supabaseClient
      .from('railway_api_logs')
      .insert({
        company_id: company.id,
        endpoint: '/railway-station-register',
        method: 'POST',
        status_code: 201,
        request_body: { station_name, station_code, city, country }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Station registered successfully',
        station: {
          id: station.id,
          station_name: station.station_name,
          station_code: station.station_code,
          city: station.city,
          country: station.country
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
