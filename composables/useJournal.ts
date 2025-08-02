import { ref } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';

interface JournalEntryOverview {
  journal_id: number;
  title: string;
  date: string;
  description: string;
}

interface JournalEntry {
  journal_id: number;
  title: string;
  date: string;
  description: string;
  content: string;
  analyses?: JournalAnalysis[];
}

export interface JournalAnalysis {
  journal_analysis_id: number;
  created_at: string;
  journal_id: number;
  type: string;
  title: string;
  content: string;
  user_id: string;
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
        .select('journal_id, title, date, description')
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

  const loadFullEntry = async (journal_id: number): Promise<JournalEntry | null> => {
    if (entriesFullCache.has(journal_id)) {
      return entriesFullCache.get(journal_id)!;
    }

    isLoadingEntry.value = true;
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('journal_id, title, date, description, content, journal_analyses(*)')
        .eq('journal_id', journal_id)
        .single();

      if (error) {
        console.error(`Error loading full journal entry ${journal_id}:`, error.message);
        return null;
      }

      if (data) {
        if (entriesFullCache.size >= MAX_CACHE_SIZE) {
          // Remove the oldest entry from cache
          const oldestKey = entriesFullCache.keys().next().value;
          entriesFullCache.delete(oldestKey);
        }
        entriesFullCache.set(journal_id, data);
        return data;
      }
      return null;
    } finally {
      isLoadingEntry.value = false;
    }
  };

  const selectEntry = async (entryOverview: JournalEntryOverview | null) => {
    if (entryOverview) {
      selectedEntry.value = await loadFullEntry(entryOverview.journal_id);
    } else {
      selectedEntry.value = null;
    }
  };

  const findEntryById = async (journal_id: number): Promise<JournalEntry | null> => {
    return await loadFullEntry(journal_id);
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
          journal_id: data.journal_id,
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
        .eq('journal_id', updatedEntry.journal_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal entry:', error.message);
        return null;
      }
      if (data) {
        entriesFullCache.set(data.journal_id, data); // Update cache
        const index = entriesOverview.value.findIndex(entry => entry.journal_id === data.journal_id);
        if (index !== -1) {
          entriesOverview.value[index] = {
            journal_id: data.journal_id,
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

  const deleteEntry = async (journal_id: number) => {
    isSavingEntry.value = true;
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('journal_id', journal_id);

      if (error) {
        console.error('Error deleting journal entry:', error.message);
        return false;
      }

      // Remove from overview
      entriesOverview.value = entriesOverview.value.filter(entry => entry.journal_id !== journal_id);
      // Remove from cache
      entriesFullCache.delete(journal_id);
      // Clear selected entry if it was the one deleted
      if (selectedEntry.value?.journal_id === journal_id) {
        selectedEntry.value = null;
      }
      return true;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const loadJournalAnalyses = async (journalId: number): Promise<JournalAnalysis[]> => {
    isLoadingEntry.value = true; // Re-using this for now, might need a separate one later
    try {
      const { data, error } = await supabase
        .from('journal_analyses')
        .select('*')
        .eq('journal_id', journalId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`Error loading journal analyses for journal ${journalId}:`, error.message);
        return [];
      }
      return data || [];
    } finally {
      isLoadingEntry.value = false;
    }
  };

  const createJournalAnalysis = async (newAnalysis: Omit<JournalAnalysis, 'journal_analysis_id' | 'created_at' | 'user_id'>): Promise<JournalAnalysis | null> => {
    if (!user.value) {
      console.error('User not logged in.');
      return null;
    }
    isSavingEntry.value = true;
    try {
      const { data, error } = await supabase
        .from('journal_analyses')
        .insert({
          ...newAnalysis,
          user_id: user.value.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal analysis:', error.message);
        return null;
      }
      return data;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const updateJournalAnalysis = async (updatedAnalysis: JournalAnalysis): Promise<JournalAnalysis | null> => {
    isSavingEntry.value = true;
    try {
      const { data, error } = await supabase
        .from('journal_analyses')
        .update({
          type: updatedAnalysis.type,
          title: updatedAnalysis.title,
          content: updatedAnalysis.content,
        })
        .eq('journal_analysis_id', updatedAnalysis.journal_analysis_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal analysis:', error.message);
        return null;
      }
      return data;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const deleteJournalAnalysis = async (analysisId: number): Promise<boolean> => {
    isSavingEntry.value = true;
    try {
      const { error } = await supabase
        .from('journal_analyses')
        .delete()
        .eq('journal_analysis_id', analysisId);

      if (error) {
        console.error('Error deleting journal analysis:', error.message);
        return false;
      }
      return true;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const getAnalysisPrettyTitle = (type: string): string => {
    switch (type) {
      case 'jungian':
        return 'Jungian Analysis';
      case 'symbolic':
        return 'Symbolic Analysis';
      case 'narrative':
        return 'Narrative Analysis';
      case 'cognitive-behavioral':
        return 'Cognitive Behavioral Analysis';
      case 'psychodynamic':
        return 'Psychodynamic Analysis';
      case 'humanistic':
        return 'Humanistic Analysis';
      case 'initial-thoughts':
        return 'Initial Thoughts';
      case 'meditation':
        return 'Meditation';
      case 'retrospective':
        return 'Retrospective';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
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
    loadJournalAnalyses,
    createJournalAnalysis,
    updateJournalAnalysis,
    deleteJournalAnalysis,
    getAnalysisPrettyTitle,
  };
};