import { ref } from 'vue';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import { useHome } from './useHome';

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
  lucidity_level?: number;
  lucidity_trigger?: string;
  mood?: number;
  characteristics?: string[];
  symbol_ids?: number[];
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
  const { clearCache: clearHomeCache } = useHome();

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
  console.log(`Attempting to load full entry for journal_id: ${journal_id}`); // Log start of load     

    if (entriesFullCache.has(journal_id)) {  
      const cachedEntry = entriesFullCache.get(journal_id)!;
      console.log(`Returning cached entry for journal_id: ${journal_id}, symbol_ids: ${cachedEntry.symbol_ids}`); // Log cached entry
      return cachedEntry;
    }

    isLoadingEntry.value = true;
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('journal_id, title, date, description, content, lucidity_level, lucidity_trigger, mood, characteristics, journal_analyses(*), journal_details_symbols(symbol_id)')
        .eq('journal_id', journal_id)
        .single();

      if (error) {
        console.error(`Error loading full journal entry ${journal_id}:`, error.message);
        return null;
      }

      if (data) {
        const symbol_ids = data.journal_details_symbols.map((s: { symbol_id: number }) => s.symbol_id);
        // Remove journal_details_symbols from data to clean up the object before caching
        delete data.journal_details_symbols;

        const entryWithSymbols: JournalEntry = {
          ...data,
          symbol_ids: symbol_ids,
        };

        console.log(`Successfully loaded entry for journal_id: ${journal_id}, symbol_ids: ${entryWithSymbols.symbol_ids}`); // Log loaded entry

        if (entriesFullCache.size >= MAX_CACHE_SIZE) {
          // Remove the oldest entry from cache
          const oldestKey = entriesFullCache.keys().next().value;
          entriesFullCache.delete(oldestKey);
        }
        entriesFullCache.set(journal_id, entryWithSymbols);
        return entryWithSymbols;
      }
      console.log(`No data found for journal_id: ${journal_id}`); // Log no data
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
          lucidity_level: newEntry.lucidity_level,
          lucidity_trigger: newEntry.lucidity_trigger,
          mood: newEntry.mood,
          characteristics: newEntry.characteristics,
          user_id: user.value.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating journal entry:', error.message);
        return null;
      }
      if (data) {
        // Upsert symbols after journal entry is created
        await upsertJournalSymbols(data.journal_id, newEntry.symbol_ids);

        // Force reload the entry to ensure symbols are fetched and cached correctly
        const fullEntry = await loadFullEntry(data.journal_id);

        const newOverviewEntry: JournalEntryOverview = {
          journal_id: data.journal_id,
          title: data.title,
          date: data.date,
          description: data.description,
        };
        entriesOverview.value.unshift(newOverviewEntry); // Add to the beginning
        entriesOverview.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Re-sort
        clearHomeCache();
        return fullEntry; // Return the full entry with symbols
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
          lucidity_level: updatedEntry.lucidity_level,
          lucidity_trigger: updatedEntry.lucidity_trigger,
          mood: updatedEntry.mood,
          characteristics: updatedEntry.characteristics,
        })
        .eq('journal_id', updatedEntry.journal_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating journal entry:', error.message);
        return null;
      }
      if (data) {
        // Upsert symbols after journal entry is updated
        await upsertJournalSymbols(data.journal_id, updatedEntry.symbol_ids);

        // Force reload the entry to ensure symbols are fetched and cached correctly
        const fullEntry = await loadFullEntry(data.journal_id);

        // Update cache with the reloaded full entry
        entriesFullCache.set(data.journal_id, fullEntry);

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
        clearHomeCache();
        return fullEntry; // Return the full entry with symbols
      }
      return null;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const clearSelectedEntry = () => {
    selectedEntry.value = null;
  };

  const deleteJournalAnalysesByJournalId = async (journalId: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('journal_analyses')
        .delete()
        .eq('journal_id', journalId);

      if (error) {
        console.error(`Error deleting analyses for journal ${journalId}:`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`Unexpected error deleting analyses for journal ${journalId}:`, err);
      return false;
    }
  };

  const deleteEntry = async (journal_id: number) => {
    isSavingEntry.value = true;
    try {
      // First, delete all associated analyses
      const analysesDeleted = await deleteJournalAnalysesByJournalId(journal_id);
      if (!analysesDeleted) {
        console.error(`Failed to delete analyses for journal ${journal_id}. Aborting journal deletion.`);
        return false;
      }

      // Delete associated symbols
      const { error: deleteSymbolsError } = await supabase
        .from('journal_details_symbols')
        .delete()
        .eq('journal_id', journal_id);

      if (deleteSymbolsError) {
        console.error(`Error deleting symbols for journal ${journal_id}:`, deleteSymbolsError.message);
        return false;
      }

      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('journal_id', journal_id);

      if (error) {
        console.error('Error deleting journal entry:', error.message, error);
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
      clearHomeCache();
      return true;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const loadJournalAnalyses = async (journalId: number): Promise<JournalAnalysis[]> => {
    // Check if analyses are already cached with the full entry
    const cachedEntry = entriesFullCache.get(journalId);
    if (cachedEntry && cachedEntry.analyses) {
      return cachedEntry.analyses;
    }

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
      const analyses = data || [];
      // Update the cached entry with analyses if it exists
      if (cachedEntry) {
        cachedEntry.analyses = analyses;
      }
      return analyses;
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
      if (data) {
        const cachedEntry = entriesFullCache.get(data.journal_id);
        if (cachedEntry) {
          if (!cachedEntry.analyses) {
            cachedEntry.analyses = [];
          }
          cachedEntry.analyses.push(data);
        }
        clearHomeCache();
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
      if (data) {
        const cachedEntry = entriesFullCache.get(data.journal_id);
        if (cachedEntry && cachedEntry.analyses) {
          const index = cachedEntry.analyses.findIndex(a => a.journal_analysis_id === data.journal_analysis_id);
          if (index !== -1) {
            cachedEntry.analyses[index] = data;
          }
        }
        clearHomeCache();
      }
      return data;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const deleteJournalAnalysis = async (analysisId: number, journalId: number): Promise<boolean> => {
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
      // Remove from cache
      const cachedEntry = entriesFullCache.get(journalId);
      if (cachedEntry && cachedEntry.analyses) {
        cachedEntry.analyses = cachedEntry.analyses.filter(a => a.journal_analysis_id !== analysisId);
      }
      clearHomeCache();
      return true;
    } finally {
      isSavingEntry.value = false;
    }
  };

  const getAnalysisPrettyTitle = (type: string): string => {
    switch (type) {
      case 'jungian':
        return 'Jungian Analysis';
      case 'cognitive-behavioral':
        return 'Cognitive Behavioral Analysis';
      case 'freudian':
        return 'Freudian Analysis';
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

  const upsertJournalSymbols = async (journalId: number, symbolIds: number[] | undefined) => {
    // First, delete all existing symbols for this journal entry
    const { error: deleteError } = await supabase
      .from('journal_details_symbols')
      .delete()
      .eq('journal_id', journalId);

    if (deleteError) {
      console.error(`Error deleting existing symbols for journal ${journalId}:`, deleteError.message);
      return;
    }

    // Then, insert the new symbols
    if (symbolIds && symbolIds.length > 0) {
      const symbolsToInsert = symbolIds.map(symbol_id => ({
        journal_id: journalId,
        symbol_id: symbol_id,
      }));

      const { error: insertError } = await supabase
        .from('journal_details_symbols')
        .insert(symbolsToInsert);

      if (insertError) {
        console.error(`Error inserting new symbols for journal ${journalId}:`, insertError.message);
      }
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
    userGender: user.value?.user_metadata?.gender as string | "Unknown", // Expose user gender
  };
};