import { useSupabaseClient } from '#imports'

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  date: string;
  lucidityLevel: number;
  characteristics: string[];
}

export const useHome = () => {
  const supabase = useSupabaseClient()

  const getDreamStreakInfo = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dream_streak_info')
      if (error) {
        console.error('Error fetching dream streak info:', error)
        return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
      }
      return data as { streak_length: number, last_entry_date: string | null, days_since_last_entry: number | null, has_logged_today: boolean }
    } catch (err) {
      console.error('Exception fetching dream streak info:', err)
      return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
    }
  }

  const getRecentJournalEntries = async (): Promise<JournalEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('journal_id, title, content, date, lucidity_level, characteristics')
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent journal entries:', error);
        return [];
      }
      // Map journal_id to id to match the JournalEntry interface
      return data.map(entry => ({
        id: entry.journal_id.toString(),
        title: entry.title,
        content: entry.content,
        date: entry.date,
        lucidityLevel: entry.lucidity_level || 0,
        characteristics: entry.characteristics || [],
      })) as JournalEntry[];
    } catch (err) {
      console.error('Exception fetching recent journal entries:', err);
      return [];
    }
  };

  return {
    getDreamStreakInfo,
    getRecentJournalEntries,
  }
}
