import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Africa's Talking USSD Payload
    // sessionId, serviceCode, phoneNumber, text
    const formData = await req.formData()
    const sessionId = formData.get('sessionId')
    const serviceCode = formData.get('serviceCode')
    const phoneNumber = formData.get('phoneNumber')
    const text = formData.get('text')

    let response = ''

    if (text === '') {
      // First request
      response = `CON Welcome to Africa Railways
1. Buy Ticket (Lusaka -> Ndola)
2. Check Wallet Balance
3. Track Cargo`
    } else if (text === '1') {
      response = `CON Select Class:
1. Economy (10 AFRC)
2. Business (25 AFRC)`
    } else if (text === '1*1') {
      // Confirm Economy Ticket
      // In a real app, we would trigger the Sui transaction here
      response = `END Ticket Confirmed! 
10 AFRC deducted from your Sui Wallet.
Ticket ID: TKT-${Math.floor(Math.random() * 10000)}`
      
      // Log transaction to Supabase (Mocking the Sui interaction)
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase.from('transactions').insert({
        user_id: phoneNumber, // Using phone as ID for USSD
        amount: 10,
        type: 'ticket_purchase',
        status: 'completed',
        network: 'sui_mainnet'
      })

    } else if (text === '2') {
      // Check Balance
      // Mock balance fetch
      response = `END Your Balance:
1,250.00 AFRC
Status: Active (Sui Mainnet)`
    } else if (text === '3') {
      response = `CON Enter Cargo ID:`
    } else {
      response = `END Invalid option`
    }

    return new Response(response, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
