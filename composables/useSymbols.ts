import { ref, computed } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
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

  const createSymbol = async (newSymbol: Omit<Symbol, 'symbol_id' | 'user_id'>): Promise<Symbol | null> => {
    const user = useSupabaseUser();

    if (!user.value) {
      console.error('User not authenticated. Cannot create symbol.');
      return null;
    }

    const symbolToInsert = {
      ...newSymbol,
      user_id: user.value.id,
    };

    const { data, error } = await supabase
      .from('symbols')
      .insert(symbolToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating symbol:', error);
      return null;
    }

    if (data) {
      _symbols.value.push(data as Symbol);
      _lastFetched.value = Date.now(); // Invalidate cache to ensure freshness
    }
    return data as Symbol;
  };

  const deleteSymbol = async (symbolId: number, userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('symbols')
      .delete()
      .eq('symbol_id', symbolId)
      .eq('user_id', userId); // Ensure only owner can delete

    if (error) {
      console.error('Error deleting symbol:', error);
      return false;
    }

    // Remove from local cache
    const index = _symbols.value.findIndex(s => s.symbol_id === symbolId);
    if (index !== -1) {
      _symbols.value.splice(index, 1);
    }
    _lastFetched.value = Date.now(); // Invalidate cache to ensure freshness
    return true;
  };

  

  return {
    symbols,
    getSymbols,
    createSymbol,
    deleteSymbol,
  };
}
