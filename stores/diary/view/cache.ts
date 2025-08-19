import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Journal, JournalAnalysis, JournalDetails } from '@/components/diary';
import { useSupabaseClient } from '#imports';
import { useAuth } from '@/composables/useAuth';

const MAX_CACHE_SIZE = 10;

export const useDiaryViewCacheStore = defineStore('diary-view-cache', () => {
  const cache = ref<Journal[]>([]);
  const supabase = useSupabaseClient();
  const { user } = useAuth();

  async function load(journalId: number): Promise<Journal | undefined> {
    // Check if journal is already in cache
    const existingIndex = cache.value.findIndex(j => j.journal_id === journalId);
    if (existingIndex !== -1) {
      // Move to front (most recently used)
      const [journal] = cache.value.splice(existingIndex, 1);
      cache.value.unshift(journal);
      return journal;
    }

    // If not in cache, load from DB
    const { data: journalData, error: journalError } = await supabase
      .from('journals')
      .select('journal_id, date, title, content, lucidity_level, lucidity_trigger, mood, characteristics')
      .eq('journal_id', journalId)
      .single();

    if (journalError) {
      console.error('Error loading journal:', journalError);
      return undefined;
    }

    const { data: analysesData, error: analysesError } = await supabase
      .from('journal_analyses')
      .select('journal_analysis_id, type, title, content')
      .eq('journal_id', journalId);

    if (analysesError) {
      console.error('Error loading analyses:', analysesError);
      // Continue without analyses if there's an error
    }

    const { data: symbolsData, error: symbolsError } = await supabase
      .from('journal_details_symbols')
      .select('symbol_id')
      .eq('journal_id', journalId);

    if (symbolsError) {
      console.error('Error loading symbols:', symbolsError);
      // Continue without symbols if there's an error
    }

    const newJournal: Journal = {
      journal_id: journalData.journal_id,
      entry: {
        title: journalData.title,
        date: journalData.date,
        content: journalData.content,
      },
      analyses: (analysesData as JournalAnalysis[]) || [],
      details: {
        lucidity_level: journalData.lucidity_level || null,
        lucidity_trigger: journalData.lucidity_trigger || null,
        mood: journalData.mood || null,
        characteristics: journalData.characteristics || null,
        symbol_ids: symbolsData?.map(s => s.symbol_id) || null,
      },
    };

    // Add to front of cache
    cache.value.unshift(newJournal);

    // Evict oldest if cache exceeds max size
    if (cache.value.length > MAX_CACHE_SIZE) {
      cache.value.pop();
    }

    return newJournal;
  }

  function updateCache(updatedJournal: Journal) {
    const index = cache.value.findIndex(j => j.journal_id === updatedJournal.journal_id);
    if (index !== -1) {
      cache.value.splice(index, 1, updatedJournal);
    } else {
      cache.value.unshift(updatedJournal);
      if (cache.value.length > MAX_CACHE_SIZE) {
        cache.value.pop();
      }
    }
  }

  function generateDescription(content: string): string {
    const maxLength = 100;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  async function saveJournalMain(journal: Journal): Promise<number | undefined> {
    if (!user.value) {
      console.error('User not authenticated.');
      return undefined;
    }

    const journalData = {
      date: journal.entry.date,
      title: journal.entry.title,
      content: journal.entry.content,
      description: generateDescription(journal.entry.content),
      lucidity_level: journal.details.lucidity_level,
      lucidity_trigger: journal.details.lucidity_trigger,
      mood: journal.details.mood,
      characteristics: journal.details.characteristics,
      user_id: user.value.id,
    };

    let query = supabase.from('journals');
    if (journal.journal_id) {
      // Update existing journal
      query = query.update(journalData).eq('journal_id', journal.journal_id);
    } else {
      // Insert new journal
      query = query.insert(journalData);
    }

    const { data, error } = await query.select('journal_id').single();

    if (error) {
      console.error('Error saving main journal:', error);
      return undefined;
    }

    const savedJournalId = data.journal_id;
    const updatedJournal = { ...journal, journal_id: savedJournalId };
    updateCache(updatedJournal);
    return savedJournalId;
  }

  async function saveJournalAnalysis(journalId: number, analyses: JournalAnalysis[]): Promise<boolean> {
    if (!user.value) {
      console.error('User not authenticated.');
      return false;
    }

    // Delete existing analyses for this journal
    const { error: deleteError } = await supabase
      .from('journal_analyses')
      .delete()
      .eq('journal_id', journalId);

    if (deleteError) {
      console.error('Error deleting old analyses:', deleteError);
      return false;
    }

    if (analyses.length === 0) {
      // No analyses to insert, so we're done
      return true;
    }

    // Prepare analyses for insert (remove journal_analysis_id as it's auto-generated)
    const analysesToInsert = analyses.map(analysis => ({
      journal_id: journalId,
      type: analysis.type,
      title: analysis.title,
      content: analysis.content,
      user_id: user.value!.id,
    }));

    const { error: insertError } = await supabase
      .from('journal_analyses')
      .insert(analysesToInsert);

    if (insertError) {
      console.error('Error inserting new analyses:', insertError);
      return false;
    }

    // Re-fetch analyses to get generated IDs and update cache
    const { data: newAnalysesData, error: fetchError } = await supabase
      .from('journal_analyses')
      .select('journal_analysis_id, type, title, content')
      .eq('journal_id', journalId);

    if (fetchError) {
      console.error('Error fetching new analyses after insert:', fetchError);
      return false;
    }

    // Update the journal in cache with new analyses
    const cachedJournal = cache.value.find(j => j.journal_id === journalId);
    if (cachedJournal) {
      cachedJournal.analyses = newAnalysesData as JournalAnalysis[];
      updateCache(cachedJournal);
    }

    return true;
  }

  async function saveJournalSymbols(journalId: number, symbolIds: number[] | null): Promise<boolean> {
    if (!user.value) {
      console.error('User not authenticated.');
      return false;
    }

    // Delete existing symbol associations for this journal
    const { error: deleteError } = await supabase
      .from('journal_details_symbols')
      .delete()
      .eq('journal_id', journalId);

    if (deleteError) {
      console.error('Error deleting old symbols:', deleteError);
      return false;
    }

    if (!symbolIds || symbolIds.length === 0) {
      // No symbols to insert, so we're done
      return true;
    }

    // Prepare symbols for insert
    const symbolsToInsert = symbolIds.map(symbol_id => ({
      journal_id: journalId,
      symbol_id: symbol_id,
    }));

    const { error: insertError } = await supabase
      .from('journal_details_symbols')
      .insert(symbolsToInsert);

    if (insertError) {
      console.error('Error inserting new symbols:', insertError);
      return false;
    }

    // Update the journal in cache with new symbol IDs
    const cachedJournal = cache.value.find(j => j.journal_id === journalId);
    if (cachedJournal) {
      cachedJournal.details.symbol_ids = symbolIds;
      updateCache(cachedJournal);
    }

    return true;
  }

  async function createJournal(journal: Journal): Promise<Journal | undefined> {
    if (!user.value) {
      console.error('User not authenticated.');
      return undefined;
    }

    const journalData = {
      date: journal.entry.date,
      title: journal.entry.title,
      content: journal.entry.content,
      description: generateDescription(journal.entry.content),
      lucidity_level: journal.details.lucidity_level,
      lucidity_trigger: journal.details.lucidity_trigger,
      mood: journal.details.mood,
      characteristics: journal.details.characteristics,
      user_id: user.value.id,
    };

    const { data: newJournalData, error: journalError } = await supabase
      .from('journals')
      .insert(journalData)
      .select('journal_id')
      .single();

    if (journalError) {
      console.error('Error creating journal:', journalError);
      return undefined;
    }

    const newJournalId = newJournalData.journal_id;
    let createdAnalyses: JournalAnalysis[] = [];
    let createdSymbolIds: number[] | null = null;

    // Insert analyses if they exist
    if (journal.analyses && journal.analyses.length > 0) {
      const analysesToInsert = journal.analyses.map(analysis => ({
        journal_id: newJournalId,
        type: analysis.type,
        title: analysis.title,
        content: analysis.content,
        user_id: user.value!.id,
      }));

      const { data: insertedAnalyses, error: analysesError } = await supabase
        .from('journal_analyses')
        .insert(analysesToInsert)
        .select('journal_analysis_id, type, title, content');

      if (analysesError) {
        console.error('Error inserting analyses for new journal:', analysesError);
        // Continue even if analyses fail, main journal is still created
      } else {
        createdAnalyses = insertedAnalyses as JournalAnalysis[];
      }
    }

    // Insert symbols if they exist
    if (journal.details.symbol_ids && journal.details.symbol_ids.length > 0) {
      const symbolsToInsert = journal.details.symbol_ids.map(symbol_id => ({
        journal_id: newJournalId,
        symbol_id: symbol_id,
      }));

      const { error: symbolsError } = await supabase
        .from('journal_details_symbols')
        .insert(symbolsToInsert);

      if (symbolsError) {
        console.error('Error inserting symbols for new journal:', symbolsError);
        // Continue even if symbols fail
      } else {
        createdSymbolIds = journal.details.symbol_ids;
      }
    }

    const completeNewJournal: Journal = {
      journal_id: newJournalId,
      entry: journal.entry,
      analyses: createdAnalyses,
      details: {
        ...journal.details,
        symbol_ids: createdSymbolIds,
      },
    };

    updateCache(completeNewJournal);
    return completeNewJournal;
  }

  async function deleteJournal(journalId: number): Promise<boolean> {
    if (!user.value) {
      console.error('User not authenticated.');
      return false;
    }

    try {
      // 1. Delete from journal_details_symbols
      const { error: symbolsDeleteError } = await supabase
        .from('journal_details_symbols')
        .delete()
        .eq('journal_id', journalId);

      if (symbolsDeleteError) {
        console.error('Error deleting journal symbols:', symbolsDeleteError);
        throw new Error('Failed to delete associated symbols.');
      }

      // 2. Delete from journal_analyses
      const { error: analysesDeleteError } = await supabase
        .from('journal_analyses')
        .delete()
        .eq('journal_id', journalId);

      if (analysesDeleteError) {
        console.error('Error deleting journal analyses:', analysesDeleteError);
        throw new Error('Failed to delete associated analyses.');
      }

      // 3. Delete from journals
      const { error: journalDeleteError } = await supabase
        .from('journals')
        .delete()
        .eq('journal_id', journalId);

      if (journalDeleteError) {
        console.error('Error deleting journal:', journalDeleteError);
        throw new Error('Failed to delete main journal entry.');
      }

      // Remove from cache
      const index = cache.value.findIndex(j => j.journal_id === journalId);
      if (index !== -1) {
        cache.value.splice(index, 1);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteJournal (cache store):', error);
      return false;
    }
  }

  return {
    cache,
    load,
    saveJournalMain,
    saveJournalAnalysis,
    saveJournalSymbols,
    createJournal,
    deleteJournal,
  };
});
