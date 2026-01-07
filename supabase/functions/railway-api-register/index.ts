// Railway Company Registration API
// Allows railway companies to register for API access

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

    const { 
      company_name,
      country,
      contact_email,
      contact_phone,
      website,
      logo_url 
    } = await req.json()

    // Validate required fields
    if (!company_name || !country || !contact_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: company_name, country, contact_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if company already exists
    const { data: existing, error: checkError } = await supabaseClient
      .from('railway_companies')
      .select('id, status')
      .eq('contact_email', contact_email)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ 
          error: 'Company already registered',
          status: existing.status,
          company_id: existing.id
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Register new company
    const { data: company, error: insertError } = await supabaseClient
      .from('railway_companies')
      .insert({
        company_name,
        country,
        contact_email,
        contact_phone,
        website,
        logo_url,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    // Send notification email to admins
    try {
      await supabaseClient.functions.invoke('send-admin-notification', {
        body: {
          type: 'railway_company_registration',
          company_name,
          contact_email,
          country
        }
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration submitted successfully. You will receive an email once approved.',
        company_id: company.id,
        status: 'pending'
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
