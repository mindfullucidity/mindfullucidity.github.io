import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*' as const,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' as const,
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const userId = user.id

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete data from related tables first
    // Note: If you have RLS policies, ensure the service role key bypasses them
    // or that your RLS policies allow deletion by the service role.
    // For simplicity, we assume the service role key has full access.

    const { error: journalAnalysesError } = await supabaseAdmin
      .from('journal_analyses')
      .delete()
      .eq('user_id', userId)

    if (journalAnalysesError) {
      console.error('Error deleting journal_analyses:', journalAnalysesError)
      throw new Error('Failed to delete journal analyses data.')
    }

    const { error: userAiUsageError } = await supabaseAdmin
      .from('user_ai_usage')
      .delete()
      .eq('user_id', userId)

    if (userAiUsageError) {
      console.error('Error deleting user_ai_usage:', userAiUsageError)
      throw new Error('Failed to delete user AI usage data.')
    }

    const { error: journalsError } = await supabaseAdmin
      .from('journals')
      .delete()
      .eq('user_id', userId)

    if (journalsError) {
      console.error('Error deleting journals:', journalsError)
      throw new Error('Failed to delete journal entries.')
    }

    // Finally, delete the user from auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError)
      throw new Error('Failed to delete user account.')
    }

    return new Response(JSON.stringify({ message: 'Account and all associated data deleted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})