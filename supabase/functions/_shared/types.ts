export interface EnvironmentVariables {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PATREON_CLIENT_ID: string;
  PATREON_CLIENT_SECRET: string;
  PATREON_REDIRECT_URI: string;
}

export interface PatreonTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface PatreonUserInfo {
  id: string;
  email: string;
  name: string;
}

export interface PatreonMembershipInfo {
  patreon_status: string | null;
  patreon_is_free_trial: boolean | null;
  patreon_is_gifted: boolean | null;
  patreon_last_charge_date: string | null;
  patreon_currently_entitled_amount_cents: number | null;
  patreon_will_pay_amount_cents: number | null;
  patreon_next_charge_date: string | null;
}

export interface PatreonData {
  patreonUserInfo: PatreonUserInfo;
  patreonMembershipInfo: PatreonMembershipInfo;
  user_role: string;
}