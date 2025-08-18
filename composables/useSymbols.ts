import { ref, computed } from 'vue';
import { useSupabaseClient } from '#imports';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';


export interface Symbol {
  symbol_id: number;
  category: string;
  name: string;
  description: string | null;
  user_id: string | null;
}

const _symbols = ref<Symbol[]>([]);
const _lastFetched = ref<number>(0);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useSymbols() {
  const supabase = useSupabaseClient();

  const symbols = computed(() => _symbols.value);

  const getSymbols = async (): Promise<Symbol[]> => {
    const now = Date.now();
    if (_symbols.value.length > 0 && (now - _lastFetched.value < CACHE_DURATION)) {
      console.log('Returning symbols from cache.');
      return _symbols.value;
    }

    console.log('Fetching symbols from Supabase...');
    const { data, error } = await supabase
      .from('symbols')
      .select('symbol_id, category, name, description, user_id');

    if (error) {
      console.error('Error fetching symbols:', error);
      return [];
    }

    _symbols.value = data as Symbol[];
    _lastFetched.value = now;
    console.log('Symbols fetched and cached.', _symbols.value);
    return _symbols.value;
  };

  

  return {
    symbols,
    getSymbols,
  };
}
