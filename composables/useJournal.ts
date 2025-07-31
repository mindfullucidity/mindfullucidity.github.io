import { ref } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';

interface JournalEntryOverview {
  id: number;
  title: string;
  date: string;
  description: string;
}

interface JournalEntry {
  id: number;
  title: string;
  date: string;
  description: string;
  content: string;
}

const entriesOverview = ref<JournalEntryOverview[]>([]);
const entriesFullCache = new Map<number, JournalEntry>();
const MAX_CACHE_SIZE = 5;

const selectedEntry = ref<JournalEntry | null>(null);

const generateDescription = (content: string): string => {
  const maxLength = 100;
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength) + '...';
};

export const useJournal = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const loadEntriesOverview = async () => {
    const { data, error } = await supabase
      .from('journals')
      .select('id, title, date, description')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading journal entries overview:', error.message);
      return;
    }
    entriesOverview.value = data || [];
  };

  const loadFullEntry = async (id: number): Promise<JournalEntry | null> => {
    if (entriesFullCache.has(id)) {
      return entriesFullCache.get(id)!;
    }

    const { data, error } = await supabase
      .from('journals')
      .select('id, title, date, description, content')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error loading full journal entry ${id}:`, error.message);
      return null;
    }

    if (data) {
      if (entriesFullCache.size >= MAX_CACHE_SIZE) {
        // Remove the oldest entry from cache
        const oldestKey = entriesFullCache.keys().next().value;
        entriesFullCache.delete(oldestKey);
      }
      entriesFullCache.set(id, data);
      return data;
    }
    return null;
  };

  const selectEntry = async (entryOverview: JournalEntryOverview | null) => {
    if (entryOverview) {
      selectedEntry.value = await loadFullEntry(entryOverview.id);
    } else {
      selectedEntry.value = null;
    }
  };

  const findEntryById = async (id: number): Promise<JournalEntry | null> => {
    return await loadFullEntry(id);
  };

  const createEntry = async (newEntry: Omit<JournalEntry, 'id' | 'date' | 'description'>) => {
    if (!user.value) {
      console.error('User not logged in.');
      return null;
    }
    const description = generateDescription(newEntry.content);
    const { data, error } = await supabase
      .from('journals')
      .insert({
        title: newEntry.title,
        content: newEntry.content,
        description: description,
        date: new Date().toISOString().slice(0, 10),
        user_id: user.value.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error.message);
      return null;
    }
    if (data) {
      await loadEntriesOverview(); // Refresh overview after creation
      return data;
    }
    return null;
  };

  const updateEntry = async (updatedEntry: JournalEntry) => {
    const description = generateDescription(updatedEntry.content);
    const { data, error } = await supabase
      .from('journals')
      .update({
        title: updatedEntry.title,
        content: updatedEntry.content,
        description: description,
        date: updatedEntry.date,
      })
      .eq('id', updatedEntry.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error.message);
      return null;
    }
    if (data) {
      entriesFullCache.set(data.id, data); // Update cache
      await loadEntriesOverview(); // Refresh overview after update
      return data;
    }
    return null;
  };

  const clearSelectedEntry = () => {
    selectedEntry.value = null;
  };

  return {
    entriesOverview,
    selectedEntry,
    loadEntriesOverview,
    loadFullEntry,
    selectEntry,
    findEntryById,
    createEntry,
    updateEntry,
    clearSelectedEntry,
  };
};