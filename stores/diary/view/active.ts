import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Journal, JournalAnalysis } from '@/components/diary';
import { useDiaryViewCacheStore } from './cache';
import { toast } from 'vue-sonner';
import { useSidebarStore } from '@/stores/diary/sidebar';

export const useDiaryViewActiveStore = defineStore('diary-view-active', () => {
  const diaryViewCacheStore = useDiaryViewCacheStore();
  const sidebarStore = useSidebarStore();

  const loaded = ref<Journal | null>(null);
  const current = ref<Journal>(createBlankJournal());
  const isLoaded = ref(false);
  const isEnhancing = ref(false);

  function createBlankJournal(): Journal {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split('T')[0];

    return {
      journal_id: 0,
      entry: {
        title: '',
        date: formattedYesterday,
        content: '',
      },
      analyses: [],
      details: {
        lucidity_level: null,
        lucidity_trigger: null,
        mood: null,
        characteristics: null,
        symbol_ids: null,
      },
    };
  }
  
  async function loadJournal(journalId: number) {
    isLoaded.value = false;
    try {
      const journal = await diaryViewCacheStore.load(journalId);
      if (journal) {
        loaded.value = JSON.parse(JSON.stringify(journal)); // Deep copy for loaded
        current.value = JSON.parse(JSON.stringify(journal)); // Deep copy for current
      }
    } finally {
      isLoaded.value = true;
    }
  }

  function newJournal() {
    isLoaded.value = false;
    loaded.value = null;
    current.value = createBlankJournal();
    isLoaded.value = true;
  }

  function cancelChanges() {
    if (loaded.value) {
      current.value = JSON.parse(JSON.stringify(loaded.value));
    } else {
      // If loaded is null, it means it's a new entry, so reset to blank
      current.value = createBlankJournal();
    }
  }

  // Helper to compare arrays of analyses
  function areAnalysesEqual(a: JournalAnalysis[], b: JournalAnalysis[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      // Compare relevant properties, ignoring journal_analysis_id for new analyses
      const aId = a[i].journal_analysis_id;
      const bId = b[i].journal_analysis_id;

      if (a[i].type !== b[i].type || a[i].title !== b[i].title || a[i].content !== b[i].content) {
        return false;
      }
      // If both have IDs, compare them. If one has an ID and the other doesn't, they are different.
      if (aId !== undefined && bId !== undefined && aId !== bId) return false;
      if ((aId === undefined && bId !== undefined) || (aId !== undefined && bId === undefined)) return false;
    }
    return true;
  }

  // Helper to compare arrays of symbol IDs
  function areSymbolIdsEqual(a: number[] | null, b: number[] | null): boolean {
    const sortedA = a ? [...a].sort((x, y) => x - y) : [];
    const sortedB = b ? [...b].sort((x, y) => x - y) : [];

    if (sortedA.length !== sortedB.length) return false;
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
  }

  const hasUnsaved = computed(() => {
    if (!loaded.value) {
      return true; // If no loaded journal, it's a new entry, so always unsaved
    }

    // Compare entry
    if (loaded.value.entry.title !== current.value.entry.title) return true;
    if (loaded.value.entry.date !== current.value.entry.date) return true;
    if (loaded.value.entry.content !== current.value.entry.content) return true;

    // Compare details (excluding symbol_ids which are handled separately)
    if (loaded.value.details.lucidity_level !== current.value.details.lucidity_level) return true;
    if (loaded.value.details.lucidity_trigger !== current.value.details.lucidity_trigger) return true;
    if (loaded.value.details.mood !== current.value.details.mood) return true;

    // Compare characteristics (arrays)
    const loadedCharacteristics = loaded.value.details.characteristics ? [...loaded.value.details.characteristics].sort() : [];
    const currentCharacteristics = current.value.details.characteristics ? [...current.value.details.characteristics].sort() : [];
    if (loadedCharacteristics.length !== currentCharacteristics.length) return true;
    for (let i = 0; i < loadedCharacteristics.length; i++) {
      if (loadedCharacteristics[i] !== currentCharacteristics[i]) return false; // Changed from true to false
    }

    // Compare analyses
    if (!areAnalysesEqual(loaded.value.analyses, current.value.analyses)) return true;

    // Compare symbol_ids
    if (!areSymbolIdsEqual(loaded.value.details.symbol_ids, current.value.details.symbol_ids)) return true;

    return false;
  });

  const isNew = computed(() => loaded.value === null);

  async function saveJournal() {
    if (!current.value) {
      toast.error('No journal data to save.');
      return;
    }

    if (!current.value.entry.content.trim()) {
      toast.error('Journal content cannot be empty.');
      return;
    }

    let mainSaved = false;
    let analysesSaved = false;
    let symbolsSaved = false;
    let journalIdToUse = current.value.journal_id;

    try {
      // 1. Save Main Journal Entry (if new or changed)
      const isMainChanged = !loaded.value ||
        loaded.value.entry.title !== current.value.entry.title ||
        loaded.value.entry.date !== current.value.entry.date ||
        loaded.value.entry.content !== current.value.entry.content ||
        loaded.value.details.lucidity_level !== current.value.details.lucidity_level ||
        loaded.value.details.lucidity_trigger !== current.value.details.lucidity_trigger ||
        loaded.value.details.mood !== current.value.details.mood ||
        !areSymbolIdsEqual(loaded.value.details.characteristics, current.value.details.characteristics); // Re-check characteristics comparison

      if (isMainChanged || isNew.value) {
        const savedId = await diaryViewCacheStore.saveJournalMain(current.value);
        if (savedId === undefined) {
          throw new Error('Failed to save main journal entry.');
        }
        journalIdToUse = savedId;
        current.value.journal_id = savedId; // Update current with new ID if it was a new journal
        mainSaved = true;
      }

      // Ensure we have a journalId for subsequent saves
      if (!journalIdToUse) {
        throw new Error('Journal ID not available for saving analyses or symbols.');
      }

      // 2. Save Analyses (if changed)
      if (!loaded.value || !areAnalysesEqual(loaded.value.analyses, current.value.analyses)) {
        const success = await diaryViewCacheStore.saveJournalAnalysis(journalIdToUse, current.value.analyses);
        if (!success) {
          throw new Error('Failed to save journal analyses.');
        }
        analysesSaved = true;
      }

      // 3. Save Symbols (if changed)
      if (!loaded.value || !areSymbolIdsEqual(loaded.value.details.symbol_ids, current.value.details.symbol_ids)) {
        const success = await diaryViewCacheStore.saveJournalSymbols(journalIdToUse, current.value.details.symbol_ids);
        if (!success) {
          throw new Error('Failed to save journal symbols.');
        }
        symbolsSaved = true;
      }

      // Update loaded.value to reflect the saved state
      loaded.value = JSON.parse(JSON.stringify(current.value));
      toast.success('Journal saved successfully!');

    } catch (error: any) {
      console.error('Error saving journal:', error);
      toast.error(`Failed to save journal: ${error.message || 'An unknown error occurred.'}`);
    }
  }

  async function createJournal() {
    if (!current.value) {
      toast.error('No journal data to create.');
      return;
    }

    if (!current.value.entry.content.trim()) {
      toast.error('Journal content cannot be empty.');
      return;
    }

    try {
      const newJournal = await diaryViewCacheStore.createJournal(current.value);
      if (newJournal) {
        loaded.value = JSON.parse(JSON.stringify(newJournal));
        current.value = JSON.parse(JSON.stringify(newJournal));
        toast.success('Journal created successfully!');

        // Add to sidebar
        sidebarStore.addItem({
          journal_id: newJournal.journal_id!,
          title: newJournal.entry.title,
          date: newJournal.entry.date,
          description: newJournal.entry.content.substring(0, 100) + (newJournal.entry.content.length > 100 ? '...' : ''),
        });

      } else {
        throw new Error('Failed to create journal.');
      }
    } catch (error: any) {
      console.error('Error creating journal:', error);
      toast.error(`Failed to create journal: ${error.message || 'An unknown error occurred.'}`);
    }
  }

  async function deleteJournal(journalId: number) {
    try {
      const success = await diaryViewCacheStore.deleteJournal(journalId);
      if (success) {
        newJournal(); // Reset active and loaded journal
        sidebarStore.deleteItem(journalId); // Remove from sidebar
        toast.success('Journal deleted successfully!');
      } else {
        throw new Error('Failed to delete journal from database.');
      }
    } catch (error: any) {
      console.error('Error deleting journal:', error);
      toast.error(`Failed to delete journal: ${error.message || 'An unknown error occurred.'}`);
    }
  }

  return {
    loaded,
    current,
    loadJournal,
    newJournal,
    cancelChanges,
    hasUnsaved,
    isLoaded,
    isNew,
    saveJournal,
    createJournal,
    deleteJournal,
  };
});
