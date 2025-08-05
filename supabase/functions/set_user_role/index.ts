
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { role } = await req.json();
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error: userError } = await supabaseAdminClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: userError?.message || 'User not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const { data, error } = await supabaseAdminClient.auth.admin.updateUserById(
      user.user.id,
      {
        app_metadata: {
          ...user.user.app_metadata,
          user_role: role,
        },
      }
    );

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'User role updated successfully', data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
