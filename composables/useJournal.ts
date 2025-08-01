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

const entriesOverview = ref<JournalEntryOverview[] | null>(null);
const entriesFullCache = new Map<number, JournalEntry>();
const MAX_CACHE_SIZE = 20;

const selectedEntry = ref<JournalEntry | null>(null);
const isLoadingOverview = ref(false);
const isLoadingEntry = ref(false);
const isSavingEntry = ref(false);

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
    if (entriesOverview.value !== null && entriesOverview.value.length > 0 && !isLoadingOverview.value) {
      // Data already loaded, no need to fetch again unless explicitly refreshed
      return;
    }
    isLoadingOverview.value = true;
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('id, title, date, description')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading journal entries overview:', error.message);
        return;
      }
      entriesOverview.value = data || [];
    } finally {
      isLoadingOverview.value = false;
    }
  };

  const loadFullEntry = async (id: number): Promise<JournalEntry | null> => {
    if (entriesFullCache.has(id)) {
      return entriesFullCache.get(id)!;
    }

    isLoadingEntry.value = true;
    try {
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
    } finally {
      isLoadingEntry.value = false;
    }
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

  const createEntry = async (newEntry: Omit<JournalEntry, 'id' | 'description'>) => {
    if (!user.value) {
      console.error('User not logged in.');
      return null;
    }
    isSavingEntry.value = true;
    try {
      const description = generateDescription(newEntry.content);
      const { data, error } = await supabase
        .from('journals')
        .insert({
          title: newEntry.title,
          content: newEntry.content,
          description: description,
          date: newEntry.date,
          user_id: user.value.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal entry:', error.message);
        return null;
      }
      if (data) {
        const newOverviewEntry: JournalEntryOverview = {
          id: data.id,
          title: data.title,
          date: data.date,
          description: data.description,
        };
        entriesOverview.value.unshift(newOverviewEntry); // Add to the beginning
        entriesOverview.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Re-sort
        return data;
      }
      return null;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const updateEntry = async (updatedEntry: JournalEntry) => {
    isSavingEntry.value = true;
    try {
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
        const index = entriesOverview.value.findIndex(entry => entry.id === data.id);
        if (index !== -1) {
          entriesOverview.value[index] = {
            id: data.id,
            title: data.title,
            date: data.date,
            description: data.description,
          };
          entriesOverview.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Re-sort
        }
        return data;
      }
      return null;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const clearSelectedEntry = () => {
    selectedEntry.value = null;
  };

  const deleteEntry = async (id: number) => {
    isSavingEntry.value = true;
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting journal entry:', error.message);
        return false;
      }

      // Remove from overview
      entriesOverview.value = entriesOverview.value.filter(entry => entry.id !== id);
      // Remove from cache
      entriesFullCache.delete(id);
      // Clear selected entry if it was the one deleted
      if (selectedEntry.value?.id === id) {
        selectedEntry.value = null;
      }
      return true;
    } finally {
      isSavingEntry.value = false;
    }
  };

  return {
    entriesOverview,
    selectedEntry,
    isLoadingOverview,
    isLoadingEntry,
    isSavingEntry,
    loadEntriesOverview,
    loadFullEntry,
    selectEntry,
    findEntryById,
    createEntry,
    updateEntry,
    clearSelectedEntry,
    deleteEntry,
  };
};