import { useSupabaseClient, useState } from '#imports';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const user = useState<User | null>('supabaseUser', () => null);

  const refreshUser = async () => {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error refreshing user:', error);
      user.value = null;
    } else {
      user.value = supabaseUser;
    }
  };

  return {
    user,
    refreshUser,
  };
};
