import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';
import { getEnvironmentVariables, getOrCreatePatreonTokens, fetchPatreonIdentity, updateSupabaseUserMetadata } from '../_shared/patreon.ts';
import { EnvironmentVariables } from '../_shared/types.ts';

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    const env: EnvironmentVariables = getEnvironmentVariables();

    // Get the user from Supabase based on the access token in the state parameter
    const state = url.searchParams.get('state');
    if (!state) {
      return new Response(JSON.stringify({ error: 'State parameter missing' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const decodedState = JSON.parse(decodeURIComponent(state));
    const supabaseAccessToken = decodedState.supabaseAccessToken;

    // Client for getting user info with user's JWT
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Admin client for updating user metadata
    const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseAccessToken, {
      jwt: supabaseAccessToken,
    });

    if (userError || !user) {
      throw new Error(`Supabase user not found: ${userError?.message}`);
    }

    // Get or create Patreon tokens
    const patreonTokens = await getOrCreatePatreonTokens(supabase, supabaseAccessToken, code, env);

    // Get user info from Patreon
    const patreonData = await fetchPatreonIdentity(patreonTokens.access_token);

    // Update user metadata in Supabase using the admin client
    await updateSupabaseUserMetadata(user.id, supabaseAdmin, patreonTokens, patreonData);

    // Redirect back to the settings page or a success page
    const returnToUrl = decodedState.returnTo || '/settings'; // Fallback to /settings if not provided
    const redirectUrl = new URL(returnToUrl);
    redirectUrl.searchParams.set('patreonLinked', 'true'); // Add indicator
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    });

  } catch (error) {
    console.error('Patreon OAuth Callback Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});