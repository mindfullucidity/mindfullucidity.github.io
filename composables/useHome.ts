import { useSupabaseClient, useState } from '#imports'

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

  const streakInfo = useState('dreamStreakInfo', () => ({
    streak_length: 0,
    last_entry_date: null,
    days_since_last_entry: null,
    has_logged_today: false,
  }));

  const getDreamStreakInfo = async () => {
    if (streakInfo.value.streak_length !== 0) {
      return streakInfo.value;
    }
    try {
      const { data, error } = await supabase.rpc('get_dream_streak_info')
      if (error) {
        console.error('Error fetching dream streak info:', error)
        return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
      }
      streakInfo.value = data as { streak_length: number, last_entry_date: string | null, days_since_last_entry: number | null, has_logged_today: boolean };
      return streakInfo.value;
    } catch (err) {
      console.error('Exception fetching dream streak info:', err)
      return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
    }
  }

  const journalEntries = useState<JournalEntry[]>('recentJournalEntries', () => []);

  const getRecentJournalEntries = async (): Promise<JournalEntry[]> => {
    if (journalEntries.value.length > 0) {
      return journalEntries.value;
    }
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('journal_id, title, content, date, lucidity_level, characteristics')
        .order('date', { ascending: false })
        .order('journal_id', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching recent journal entries:', error);
        return [];
      }
      // Map journal_id to id to match the JournalEntry interface
      journalEntries.value = data.map(entry => ({
        id: entry.journal_id.toString(),
        title: entry.title,
        content: entry.content,
        date: entry.date,
        lucidityLevel: entry.lucidity_level || 0,
        characteristics: entry.characteristics || [],
      })) as JournalEntry[];
      return journalEntries.value;
    } catch (err) {
      console.error('Exception fetching recent journal entries:', err);
      return [];
    }
  };

  const clearCache = () => {
    streakInfo.value = {
      streak_length: 0,
      last_entry_date: null,
      days_since_last_entry: null,
      has_logged_today: false,
    };
    journalEntries.value = [];
  };

  return {
    streakInfo,
    journalEntries,
    getDreamStreakInfo,
    getRecentJournalEntries,
    clearCache,
  }
}
