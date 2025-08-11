import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return new Response(JSON.stringify({ error: 'No code provided' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const PATREON_CLIENT_ID = Deno.env.get('PATREON_CLIENT_ID')!
    const PATREON_CLIENT_SECRET = Deno.env.get('PATREON_CLIENT_SECRET')!
    const PATREON_REDIRECT_URI = Deno.env.get('PATREON_REDIRECT_URI')! // This should be the URL of this edge function

    // Get the user from Supabase based on the access token in the state parameter
    const state = url.searchParams.get('state')
    if (!state) {
      return new Response(JSON.stringify({ error: 'State parameter missing' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    const decodedState = JSON.parse(decodeURIComponent(state))
    const supabaseAccessToken = decodedState.supabaseAccessToken

    // Client for getting user info with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })

    // Admin client for updating user metadata
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    })

    // Exchange code for tokens
    const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: PATREON_CLIENT_ID,
        client_secret: PATREON_CLIENT_SECRET,
        redirect_uri: PATREON_REDIRECT_URI,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(`Failed to get tokens from Patreon: ${JSON.stringify(errorData)}`)
    }

    const { access_token, refresh_token, expires_in } = await tokenResponse.json()

    // Get user info from Patreon
    const patreonUserResponse = await fetch('https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=currently_entitled_amount_cents,next_charge_date,patron_status,will_pay_amount_cents,is_gifted,is_free_trial,last_charge_date&fields[user]=email,full_name', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!patreonUserResponse.ok) {
      const errorData = await patreonUserResponse.json()
      throw new Error(`Failed to get user info from Patreon: ${JSON.stringify(errorData)}`)
    }

    const patreonUserData = await patreonUserResponse.json()
    const patreonUserId = patreonUserData.data.id
    const patreonUserEmail = patreonUserData.data.attributes.email
    const patreonUserName = patreonUserData.data.attributes.full_name

    // Extract membership info
    let patreonStatus = null;
    let patreonCurrentlyEntitledAmountCents = null;
    let patreonWillPayAmountCents = null;
    let patreonNextChargeDate = null;
    let patreonIsFreeTrial = null;
    let patreonIsGifted = null;
    let patreonLastChargeDate = null;

    const membership = patreonUserData.included?.find((item: any) => item.type === 'member');
    if (membership) {
      patreonStatus = membership.attributes.patron_status;
      patreonIsFreeTrial = membership.attributes.is_free_trial;
      patreonIsGifted = membership.attributes.is_gifted;
      patreonLastChargeDate = membership.attributes.last_charge_date;
      patreonCurrentlyEntitledAmountCents = membership.attributes.currently_entitled_amount_cents;
      patreonWillPayAmountCents = membership.attributes.will_pay_amount_cents;
      patreonNextChargeDate = membership.attributes.next_charge_date;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseAccessToken, {
      jwt: supabaseAccessToken,
    })

    if (userError || !user) {
      throw new Error(`Supabase user not found: ${userError?.message}`)
    }

    // Update user metadata in Supabase using the admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        patreon_access_token: access_token,
        patreon_refresh_token: refresh_token,
        patreon_expires_at: Date.now() + expires_in * 1000, // Store expiry as timestamp
        patreon_id: patreonUserId,
        patreon_email: patreonUserEmail,
        patreon_name: patreonUserName,
        patreon_status: patreonStatus,
        patreon_currently_entitled_amount_cents: patreonCurrentlyEntitledAmountCents,
        patreon_will_pay_amount_cents: patreonWillPayAmountCents,
        patreon_next_charge_date: patreonNextChargeDate,
        patreon_is_free_trial: patreonIsFreeTrial,
        patreon_is_gifted: patreonIsGifted,
        patreon_last_charge_date: patreonLastChargeDate
      },
    })

    if (updateError) {
      throw new Error(`Failed to update user metadata: ${updateError.message}`)
    }

    // Redirect back to the settings page or a success page
    const returnToUrl = decodedState.returnTo || '/settings' // Fallback to /settings if not provided
    const redirectUrl = new URL(returnToUrl);
    redirectUrl.searchParams.set('patreonLinked', 'true'); // Add indicator
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    })

  } catch (error) {
    console.error('Patreon OAuth Callback Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
