import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2';
import { EnvironmentVariables, PatreonTokens, PatreonUserInfo, PatreonMembershipInfo, PatreonData } from './types.ts';

/**
 * Retrieves all necessary environment variables.
 * @returns An object containing all required environment variables.
 * @throws Error if any required environment variable is missing.
 */
export function getEnvironmentVariables(): EnvironmentVariables {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const PATREON_CLIENT_ID = Deno.env.get('PATREON_CLIENT_ID');
  const PATREON_CLIENT_SECRET = Deno.env.get('PATREON_CLIENT_SECRET');
  const PATREON_REDIRECT_URI = Deno.env.get('PATREON_REDIRECT_URI');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !PATREON_CLIENT_ID || !PATREON_CLIENT_SECRET || !PATREON_REDIRECT_URI) {
    throw new Error('Missing environment variables.');
  }

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    PATREON_CLIENT_ID,
    PATREON_CLIENT_SECRET,
    PATREON_REDIRECT_URI,
  };
}

/**
 * Exchanges a Patreon authorization code for access and refresh tokens.
 * @param code The authorization code received from Patreon.
 * @param env The environment variables.
 * @returns An object containing access_token, refresh_token, and expires_in.
 * @throws Error if the token exchange fails.
 */
export async function exchangeCodeForTokens(code: string, env: EnvironmentVariables): Promise<PatreonTokens> {
  const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: code,
      grant_type: 'authorization_code',
      client_id: env.PATREON_CLIENT_ID,
      client_secret: env.PATREON_CLIENT_SECRET,
      redirect_uri: env.PATREON_REDIRECT_URI,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(`Failed to get tokens from Patreon: ${JSON.stringify(errorData)}`);
  }

  return await tokenResponse.json();
}

/**
 * Refreshes an expired Patreon access token using a refresh token.
 * @param refreshToken The Patreon refresh token.
 * @param env The environment variables.
 * @returns An object containing new access_token, refresh_token, and expires_in.
 * @throws Error if the token refresh fails.
 */
export async function refreshAccessToken(refreshToken: string, env: EnvironmentVariables): Promise<PatreonTokens> {
  const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: env.PATREON_CLIENT_ID,
      client_secret: env.PATREON_CLIENT_SECRET,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(`Failed to refresh token from Patreon: ${JSON.stringify(errorData)}`);
  }

  return await tokenResponse.json();
}

/**
 * Gets or creates Patreon tokens based on the provided code or existing user metadata.
 * Prioritizes initial code exchange, then valid existing tokens, then refresh token.
 * @param supabaseClient The Supabase client (non-admin) to fetch user metadata.
 * @param supabaseAccessToken The Supabase access token of the current user.
 * @param code The Patreon authorization code (optional, for initial flow).
 * @param env The environment variables.
 * @returns A Promise resolving to PatreonTokens.
 * @throws Error if Supabase user is not found or no valid tokens can be obtained.
 */
export async function getOrCreatePatreonTokens(supabaseClient: SupabaseClient, supabaseAccessToken: string, code: string | null, env: EnvironmentVariables): Promise<PatreonTokens> {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(supabaseAccessToken, {
    jwt: supabaseAccessToken,
  });

  if (userError || !user) {
    throw new Error(`Supabase user not found: ${userError?.message}`);
  }

  const userMetadata = user.user_metadata;
  const existingAccessToken = userMetadata?.patreon_access_token;
  const existingRefreshToken = userMetadata?.patreon_refresh_token;
  const patreonExpiresAt = userMetadata?.patreon_expires_at;

  // If code is provided, it's an initial authorization flow
  if (code) {
    return await exchangeCodeForTokens(code, env);
  }

  // If existing access token is valid, use it
  if (existingAccessToken && patreonExpiresAt && Date.now() < patreonExpiresAt) {
    return {
      access_token: existingAccessToken,
      refresh_token: existingRefreshToken,
      expires_in: (patreonExpiresAt - Date.now()) / 1000,
    };
  }

  // If access token expired but refresh token exists, refresh it
  if (existingRefreshToken) {
    return await refreshAccessToken(existingRefreshToken, env);
  }

  // No code, no valid existing token, no refresh token
  throw new Error('No Patreon authorization code provided and no valid existing tokens to refresh.');
}

export async function fetchPatreonIdentity(accessToken: string): Promise<PatreonData> {
  const patreonUserResponse = await fetch('https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=currently_entitled_amount_cents,next_charge_date,patron_status,will_pay_amount_cents,is_gifted,is_free_trial,last_charge_date&fields[user]=email,full_name', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!patreonUserResponse.ok) {
    const errorData = await patreonUserResponse.json();
    throw new Error(`Failed to get user info from Patreon: ${JSON.stringify(errorData)}`);
  }

  const patreonUserData = await patreonUserResponse.json();
  const patreonUserInfo: PatreonUserInfo = {
    id: patreonUserData.data.id,
    email: patreonUserData.data.attributes.email,
    name: patreonUserData.data.attributes.full_name,
  };

  let patreonMembershipInfo: PatreonMembershipInfo = {
    patreon_status: null,
    patreon_is_free_trial: null,
    patreon_is_gifted: null,
    patreon_last_charge_date: null,
    patreon_currently_entitled_amount_cents: null,
    patreon_will_pay_amount_cents: null,
    patreon_next_charge_date: null,
  };
  let user_role = 'normal';

  const membership = patreonUserData.included?.find((item: any) => item.type === 'member');
  if (membership) {
    const {
      patron_status,
      is_free_trial,
      is_gifted,
      last_charge_date,
      currently_entitled_amount_cents,
      will_pay_amount_cents,
      next_charge_date,
    } = membership.attributes;

    patreonMembershipInfo = {
      patreon_status: patron_status,
      patreon_is_free_trial: is_free_trial,
      patreon_is_gifted: is_gifted,
      patreon_last_charge_date: last_charge_date,
      patreon_currently_entitled_amount_cents: currently_entitled_amount_cents,
      patreon_will_pay_amount_cents: will_pay_amount_cents,
      patreon_next_charge_date: next_charge_date,
    };
    user_role = patron_status === 'active_patron' ? 'plus' : null;
  }

  return { patreonUserInfo, patreonMembershipInfo, user_role };
}

export async function updateSupabaseUserMetadata(userId: string, supabaseAdminClient: SupabaseClient, patreonTokens: PatreonTokens, patreonData: PatreonData): Promise<void> {
  const { access_token, refresh_token, expires_in } = patreonTokens;
  const { patreonUserInfo, patreonMembershipInfo, user_role } = patreonData;

  const { error: updateError } = await supabaseAdminClient.auth.admin.updateUserById(userId, {
    user_metadata: {
      patreon_access_token: access_token,
      patreon_refresh_token: refresh_token,
      patreon_expires_at: Date.now() + expires_in * 1000, // Store expiry as timestamp
      patreon_id: patreonUserInfo.id,
      patreon_email: patreonUserInfo.email,
      patreon_name: patreonUserInfo.name,
      ...patreonMembershipInfo,
      user_role: user_role,
    },
  });

  if (updateError) {
    throw new Error(`Failed to update user metadata: ${updateError.message}`);
  }
}