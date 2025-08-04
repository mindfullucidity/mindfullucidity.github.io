<template>
  <div class="flex flex-col h-full">
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isEnhancingEntry || isLoadingEntry || !isContentReady }">
        <TabsList>
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <div class="flex h-5 items-center space-x-1 text-sm">
          <Button v-if="activeTab === 'entry'" variant="ghost" size="icon" @click="enhanceEntry" :disabled="isEnhancingEntry">
            <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
          </Button>
          <Separator v-if="activeTab === 'entry'" orientation="vertical" class="mx-2" />
          <Button v-if="!isNewEntry" variant="ghost" size="icon" @click="deleteEntryAndNavigate">
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
          <template v-if="hasUnsavedChanges || isNewEntry">
            <Separator v-if="!isNewEntry" orientation="vertical" class="mx-2" />
            <Button variant="ghost" size="icon" @click="cancelEdit">
              <X class="w-4 h-4 text-red-400" />
            </Button>
            <Button variant="ghost" size="icon" @click="saveEntry" :disabled="isSavingEntry">
              <Check class="w-4 h-4" />
            </Button>
          </template>
        </div>
      </div>
      <Separator />
      <TabsContent value="entry" class="p-6 overflow-y-auto flex-grow">
        <div class="mx-auto max-w-4xl w-full">
          <JournalEntrySkeleton v-if="isLoadingEntry || !editableEntry || isEnhancingEntry" />
          <div v-else-if="editableEntry && !isEnhancingEntry">
            <EditableInput v-model="editableEntry.title" placeholder="Title" />
            <DatePicker variant="plain" v-model="editableEntry.date" />
            <EditableTextarea v-model="editableEntry.content" placeholder="What did you dream about?" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analysis" class="p-6 overflow-y-auto flex-grow">
          <div class="mx-auto max-w-4xl w-full">
            <div class="flex flex-col gap-4 overflow-y-auto flex-grow" ref="analysisContainerRef">
              <template v-if="isLoadingAnalyses">
                <SkeletonPreviewAnalysisCard :type="null" />
              </template>
              <template v-else-if="journalAnalyses.length > 0">
                <template v-for="analysis in journalAnalyses" :key="analysis.journal_analysis_id">
                  <NewPersonalAnalysisCard
                    v-if="editingAnalysis && editingAnalysis.journal_analysis_id === analysis.journal_analysis_id"
                    :journalId="editableEntry.journal_id"
                    :initialAnalysis="editingAnalysis"
                    @save="handleSaveNewAnalysis"
                    @cancel="handleCancelNewAnalysis"
                  />
                  <PreviewAnalysisCard
                    v-else
                    :analysisId="analysis.journal_analysis_id"
                    :type="analysis.type"
                    :title="getAnalysisPrettyTitle(analysis.title)"
                    :content="analysis.content"
                    :show-actions="true"
                    @delete="handleDeleteAnalysis"
                    @edit="handleEditAnalysis"
                  />
                </template>
              </template>

              <!-- This section is for adding *new* analyses, not editing existing ones -->
              <template v-if="showNewAnalysisCard === 'personal' && !editingAnalysis">
                <NewPersonalAnalysisCard
                  :journalId="editableEntry.journal_id"
                  @save="handleSaveNewAnalysis"
                  @cancel="handleCancelNewAnalysis"
                />
              </template>
              <template v-else-if="showNewAnalysisCard === 'ai' && !editingAnalysis">
                <NewAIAnalysisCard
                  :journalId="editableEntry.journal_id"
                  @generate-ai-analysis="handleGenerateAIAnalysis"
                  @cancel="handleCancelNewAnalysis"
                />
              </template>
              <template v-if="isGeneratingAIAnalysis">
                <SkeletonPreviewAnalysisCard type="ai" @cancel-generation="handleCancelAIAnalysisGeneration" />
              </template>

              <div class="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
                <Button variant="ghost" class="border w-full sm:w-auto text-blue-200" @click="handleAddPersonalAnalysis" :disabled="isGeneratingAIAnalysis">
                  <Plus class="w-4 h-4" /> Add Your Analysis
                </Button>
                <Button variant="ghost" class="border w-full sm:w-auto " @click="handleAddAIAnalysis" :disabled="isGeneratingAIAnalysis">
                  <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" /> <span class="bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text"> Generate AI Analysis</span>
                </Button>
              </div>
            </div>
          </div>
      </TabsContent>
      <TabsContent value="details" class="p-6 overflow-y-auto flex-grow">
        <div class="mx-auto max-w-4xl w-full">
          <JournalEntryMergeDetails
            v-if="editableEntry"
            :initial-lucidity-level="editableEntry.lucidity_level"
            :initial-lucidity-trigger="editableEntry.lucidity_trigger"
            :initial-mood="editableEntry.mood"
            :initial-characteristics="editableEntry.characteristics"
            @update:lucidity-level="editableEntry.lucidity_level = $event"
            @update:lucidity-trigger="editableEntry.lucidity_trigger = $event"
            @update:mood="editableEntry.mood = $event"
            @update:characteristics="editableEntry.characteristics = $event"
          />
        </div>
      </TabsContent>
    </Tabs>

    <Dialog v-model:open="showUpgradeDialog">
      <EnableCustomCardPlusUpgrade description="You've reached your rate limit for AI features for today. Upgrade to Plus or use your own AI model for unlimited access!" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { JournalEntry, JournalAnalysis } from '@/composables/useJournal';
import { toast } from 'vue-sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnableCustomCardPlusUpgrade from '@/components/EnableCustomCardPlusUpgrade.vue';
import { useAI } from '@/composables/useAI';


import { useLocalStorage } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';
import NewAIAnalysisCard from './analysis_card/NewAIAnalysisCard.vue';
import NewPersonalAnalysisCard from './analysis_card/NewPersonalAnalysisCard.vue';
import PreviewAnalysisCard from './analysis_card/PreviewAnalysisCard.vue';
import EditableInput from './EditableInput.vue';
import DatePicker from './DatePicker.vue';
import EditableTextarea from './EditableTextarea.vue';
import { Plus, Sparkles, X, Check, Trash2 } from 'lucide-vue-next';
import SkeletonPreviewAnalysisCard from './analysis_card/SkeletonPreviewAnalysisCard.vue';
import JournalEntryMergeDetails from './JournalEntryMergeDetails.vue';

const props = defineProps<{
  entryId: number | null,
  isNewEntry?: boolean,
}>();

const { createEntry, updateEntry, isSavingEntry, loadJournalAnalyses, createJournalAnalysis, updateJournalAnalysis, deleteJournalAnalysis, getAnalysisPrettyTitle, isLoadingEntry, findEntryById, deleteEntry } = useJournal();
const { invokeAIAnalysis, invokeEnhance } = useAI();
const showUpgradeDialog = ref(false);
import { getData, setData } from 'nuxt-storage/local-storage';

const lastShownDate = useLocalStorage('lastUpgradeDialogShown', '');

const shouldShowDialog = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (lastShownDate.value !== today) {
    return true;
  }
  return false;
};
const editableEntry = ref<JournalEntry | null>(null);
const originalEntry = ref<JournalEntry | null>(null);
const hasUnsavedChanges = ref(false);
const isEnhancingEntry = ref(false);
const isContentReady = ref(false);
const isGeneratingAIAnalysis = ref(false);
const isLoadingAnalyses = ref(false);
const abortController = ref<AbortController | null>(null);
const supabase = useSupabaseClient();

const route = useRoute();
const router = useRouter();
const activeTab = ref('entry');

const journalAnalyses = ref<JournalAnalysis[]>([]);
const showNewAnalysisCard = ref<'ai' | 'personal' | null>(null);
const editingAnalysis = ref<JournalAnalysis | null>(null);
const analysisContainerRef = ref<HTMLElement | null>(null);
const lastDeletedAnalysis = ref<JournalAnalysis | null>(null);
const lastDeletedEntry = ref<JournalEntry | null>(null);

watch(() => props.entryId, async (newId) => {
  isContentReady.value = false; // Set to false when loading starts
  editableEntry.value = null; // Clear current entry to show skeleton immediately
  if (newId) {
    editableEntry.value = await findEntryById(newId);
    if (editableEntry.value) {
      editableEntry.value.characteristics = editableEntry.value.characteristics || [];
      editableEntry.value.lucidity_level = editableEntry.value.lucidity_level ?? 0;
    }
    originalEntry.value = editableEntry.value ? { ...editableEntry.value } : null;
    hasUnsavedChanges.value = false;
  } else {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    editableEntry.value = { journal_id: 0, title: '', content: '', date: yesterday.toISOString().slice(0, 10), description: '', lucidity_level: 0, lucidity_trigger: '', mood: 50, characteristics: [] };
    originalEntry.value = null;
    hasUnsavedChanges.value = false;
  }
  isContentReady.value = true; // Set to true after content is loaded
}, { immediate: true });

watch(editableEntry, (newVal, oldVal) => {
  if (!originalEntry.value) {
    hasUnsavedChanges.value = false;
    return;
  }
  const isContentSame = newVal?.content === originalEntry.value.content;
  const isTitleSame = newVal?.title === originalEntry.value.title;
  const isDateSame = newVal?.date === originalEntry.value.date;
  const isLucidityLevelSame = newVal?.lucidity_level === originalEntry.value.lucidity_level;
  const isLucidityTriggerSame = newVal?.lucidity_trigger === originalEntry.value.lucidity_trigger;
  const isMoodSame = newVal?.mood === originalEntry.value.mood;
  const isCharacteristicsSame = JSON.stringify(newVal?.characteristics) === JSON.stringify(originalEntry.value.characteristics);

  hasUnsavedChanges.value = !(isContentSame && isTitleSame && isDateSame && isLucidityLevelSame && isLucidityTriggerSame && isMoodSame && isCharacteristicsSame);

  // old console log
}, { deep: true });

watch([activeTab, () => editableEntry.value?.journal_id], async ([newTab, newJournalId]) => {
  if (newTab === 'analysis') {
    if (props.isNewEntry) {
      // For new entries, analyses are in-memory, no need to fetch from DB
      journalAnalyses.value = journalAnalyses.value; // Trigger reactivity if needed, or ensure it's an empty array initially
    } else if (newJournalId && newJournalId !== 0) {
      await fetchJournalAnalyses(newJournalId);
    } else {
      journalAnalyses.value = [];
    }
    router.push({ hash: '#analysis' });
  } else if (newTab === 'details') {
    router.push({ hash: '#details' });
  } else {
    router.push({ hash: '' });
  }
});

onMounted(() => {
  if (route.hash === '#analysis') {
    activeTab.value = 'analysis';
  } else if (route.hash === '#details') {
    activeTab.value = 'details';
  } else {
    activeTab.value = 'entry';
  }
});

const fetchJournalAnalyses = async (journalId: number) => {
  isLoadingAnalyses.value = true;
  try {
    const analyses = await loadJournalAnalyses(journalId);
    if (analyses) {
      journalAnalyses.value.splice(0, journalAnalyses.value.length, ...analyses);
    }
  } finally {
    isLoadingAnalyses.value = false;
  }
};

const handleAddPersonalAnalysis = () => {
  if (editingAnalysis.value) {
    editingAnalysis.value = null; // Cancel current edit
  }
  if (showNewAnalysisCard.value === 'personal') {
    return;
  }
  showNewAnalysisCard.value = 'personal';
  nextTick(() => {
    if (analysisContainerRef.value) {
      const lastChild = analysisContainerRef.value.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  });
};

const handleAddAIAnalysis = () => {
  if (showNewAnalysisCard.value === 'ai') {
    return;
  }
  showNewAnalysisCard.value = 'ai';
  editingAnalysis.value = null;
  nextTick(() => {
    if (analysisContainerRef.value) {
      const lastChild = analysisContainerRef.value.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  });
};

const handleCancelNewAnalysis = () => {
  showNewAnalysisCard.value = null;
  editingAnalysis.value = null;
};

const handleCancelAIAnalysisGeneration = () => {
  if (abortController.value) {
    abortController.value.abort();
  }
  isGeneratingAIAnalysis.value = false;
};

const handleGenerateAIAnalysis = async (payload: { journal_id: number, type: string, depth: string, content: string }) => {
  if (!editableEntry.value) {
    toast.error('Journal entry is not loaded.');
    return;
  }

  isGeneratingAIAnalysis.value = true;
  showNewAnalysisCard.value = null; // Hide the new AI analysis card
  abortController.value = new AbortController();

  try {
    const { data, error } = await invokeAIAnalysis({
      entry: {
        title: editableEntry.value.title,
        content: editableEntry.value.content,
      },
      analyses: journalAnalyses.value,
      generate: {
        type: payload.type,
        depth: payload.depth,
        note: payload.content,
      },
    }, abortController.value.signal);

    if (error) {
      toast.error(`AI Analysis failed: ${error.message}`);
      console.error("AI Analysis error:", error);
      if (error.message.includes("rate limit") && shouldShowDialog()) {
        showUpgradeDialog.value = true;
      }
    } else if (data && data.object && data.object.content) {
      // Only save if generation was not cancelled
      if (isGeneratingAIAnalysis.value) {
        if (props.isNewEntry) {
          const newAnalysis: JournalAnalysis = {
            journal_analysis_id: Date.now() * -1, // Temporary ID for in-memory analysis
            created_at: new Date().toISOString(),
            journal_id: 0, // Will be updated on save
            type: `ai`,
            title: `${payload.type}`,
            content: data.object.content,
            user_id: '', // Will be updated on save
          };
          journalAnalyses.value.push(newAnalysis);
          journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          toast.success('AI Analysis generated and added to entry!');
        } else {
          const resultAnalysis = await createJournalAnalysis({
            journal_id: payload.journal_id,
            type: `ai`,
            title: `${payload.type}`,
            content: data.object.content,
          });

          if (resultAnalysis) {
            toast.success('AI Analysis generated and saved successfully!');
            journalAnalyses.value.push(resultAnalysis);
            journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          } else {
            toast.error('Failed to save AI Analysis to database.');
          }
        }
      } else {
        // old console log
      }
    } else {
      toast.error("AI Analysis failed: Unexpected response from function.");
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // old console log
    } else {
      toast.error(`An unexpected error occurred during AI Analysis: ${err.message}`);
      console.error("Unexpected AI Analysis error:", err);
    }
  } finally {
    isGeneratingAIAnalysis.value = false;
    abortController.value = null;
  }
};

const handleSaveNewAnalysis = async (analysisData: Omit<JournalAnalysis, 'journal_analysis_id' | 'created_at' | 'user_id'>) => {
  // old console log
  if (props.isNewEntry) {
    if (editingAnalysis.value) {
      // Update existing in-memory analysis
      const index = journalAnalyses.value.findIndex(a => a.journal_analysis_id === editingAnalysis.value?.journal_analysis_id);
      if (index !== -1) {
        journalAnalyses.value[index] = {
          ...journalAnalyses.value[index],
          ...analysisData,
        };
        toast.success('Analysis updated in memory!');
      }
    } else {
      // Add new in-memory analysis
      const newAnalysis: JournalAnalysis = {
        journal_analysis_id: Date.now() * -1, // Temporary ID
        created_at: new Date().toISOString(),
        journal_id: 0, // Will be updated on save
        type: analysisData.type,
        title: analysisData.title,
        content: analysisData.content,
        user_id: '', // Will be updated on save
      };
      journalAnalyses.value.push(newAnalysis);
      toast.success('Analysis added to entry!');
    }
    journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    showNewAnalysisCard.value = null;
    editingAnalysis.value = null;
    return;
  }

  // Existing logic for saving to DB
  let resultAnalysis: JournalAnalysis | null = null;
  if (editingAnalysis.value) {
    resultAnalysis = await updateJournalAnalysis({
      ...analysisData,
      journal_analysis_id: editingAnalysis.value.journal_analysis_id,
      created_at: editingAnalysis.value.created_at,
      user_id: editingAnalysis.value.user_id,
    });
  } else {
    resultAnalysis = await createJournalAnalysis({
      ...analysisData,
      journal_id: editableEntry.value.journal_id,
    });
  }

  if (resultAnalysis) {
    toast.success('Analysis saved successfully!');
    if (editingAnalysis.value) { // Check if it was an edit operation
      const index = journalAnalyses.value.findIndex(a => a.journal_analysis_id === resultAnalysis.journal_analysis_id);
      if (index !== -1) {
        journalAnalyses.value[index] = resultAnalysis;
      }
    } else { // It was a new analysis
      journalAnalyses.value.push(resultAnalysis);
    }
    journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    showNewAnalysisCard.value = null;
    editingAnalysis.value = null;
  } else {
    toast.error('Failed to save analysis.');
  }
};

const handleUndoDeleteAnalysis = async () => {
  if (lastDeletedAnalysis.value) {
    if (props.isNewEntry) {
      journalAnalyses.value.push(lastDeletedAnalysis.value);
      journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      lastDeletedAnalysis.value = null;
      toast.success('Analysis restored to memory!');
    } else {
      const restoredAnalysis = await createJournalAnalysis({
        journal_id: lastDeletedAnalysis.value.journal_id,
        type: lastDeletedAnalysis.value.type,
        title: lastDeletedAnalysis.value.title,
        content: lastDeletedAnalysis.value.content,
      });

      if (restoredAnalysis) {
        toast.success('Analysis restored successfully!');
        journalAnalyses.value.push(restoredAnalysis);
        journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        lastDeletedAnalysis.value = null;
      } else {
        toast.error('Failed to restore analysis.');
      }
    }
  }
};

const handleDeleteAnalysis = async (analysisId: number) => {
  // old console log
  const analysisToDelete = journalAnalyses.value.find(a => a.journal_analysis_id === analysisId);
  if (!analysisToDelete) {
    toast.error('Analysis not found.');
    return;
  }

  if (props.isNewEntry) {
    lastDeletedAnalysis.value = analysisToDelete;
    journalAnalyses.value = journalAnalyses.value.filter(a => a.journal_analysis_id !== analysisId);
    toast.success('Analysis deleted from memory!', {
      action: {
        label: 'Undo',
        onClick: () => handleUndoDeleteAnalysis(),
      },
      duration: 5000,
    });
  } else {
    const success = await deleteJournalAnalysis(analysisId, editableEntry.value.journal_id);
    if (success) {
      lastDeletedAnalysis.value = analysisToDelete;
      journalAnalyses.value = journalAnalyses.value.filter(a => a.journal_analysis_id !== analysisId);
      toast.success('Analysis deleted successfully!', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoDeleteAnalysis(),
        },
        duration: 5000, // Toast duration in ms
      });
    } else {
      toast.error('Failed to delete analysis.');
    }
  }
};

const handleEditAnalysis = (analysisId: number) => {
  const analysisToEdit = journalAnalyses.value.find(a => a.journal_analysis_id === analysisId);
  if (analysisToEdit && analysisToEdit.type === 'personal') {
    editingAnalysis.value = { ...analysisToEdit };
    showNewAnalysisCard.value = 'personal';
  } else if (analysisToEdit && analysisToEdit.type.includes('ai')) {
    // AI analyses are not editable via this flow, but we can log if needed
    console.warn('Attempted to edit an AI analysis, which is not supported via this flow.');
  }
};

const cancelEdit = () => {
  if (props.isNewEntry) {
    navigateTo('/journal');
  } else if (originalEntry.value) {
    editableEntry.value = { ...originalEntry.value };
  }
  hasUnsavedChanges.value = false;
};

const deleteEntryAndNavigate = async () => {
  // old console log
  if (editableEntry.value && editableEntry.value.journal_id !== 0) {
    lastDeletedEntry.value = { ...editableEntry.value }; // Store a copy for undo
    const success = await deleteEntry(editableEntry.value.journal_id);
    if (success) {
      toast.success('Journal entry deleted successfully!', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoDeleteEntry(),
        },
        duration: 5000,
      });
      navigateTo('/journal');
    } else {
      toast.error('Failed to delete journal entry.', {
        duration: 5000,
      });
      lastDeletedEntry.value = null; // Clear if deletion failed
    }
  } else {
    navigateTo('/journal');
  }
};

const handleUndoDeleteEntry = async () => {
  if (lastDeletedEntry.value) {
    const restoredEntry = await createEntry({
      title: lastDeletedEntry.value.title,
      content: lastDeletedEntry.value.content,
      date: lastDeletedEntry.value.date,
    });

    if (restoredEntry) {
      toast.success('Journal entry restored successfully!');
      // Optionally navigate back to the restored entry or update the current view
      navigateTo(`/journal/${restoredEntry.journal_id}`);
      lastDeletedEntry.value = null;
    } else {
      toast.error('Failed to restore journal entry.');
    }
  }
};

const saveEntry = async () => {
  if (editableEntry.value) {
    // old console log
    if (!editableEntry.value.content.trim()) {
      toast.error('Journal entry cannot be empty.');
      return;
    }

    let resultEntry: JournalEntry | null = null;
    if (editableEntry.value.journal_id && editableEntry.value.journal_id !== 0) {
      resultEntry = await updateEntry(editableEntry.value);
    } else {
      resultEntry = await createEntry({ title: editableEntry.value.title, content: editableEntry.value.content, date: editableEntry.value.date });
    }
    if (resultEntry) {
      originalEntry.value = { ...resultEntry };
      hasUnsavedChanges.value = false;
      toast.success('Journal entry saved successfully!');

      // If it was a new entry, save all in-memory analyses to the database
      if (props.isNewEntry) {
        for (const analysis of journalAnalyses.value) {
          await createJournalAnalysis({
            journal_id: resultEntry.journal_id,
            type: analysis.type,
            title: analysis.title,
            content: analysis.content,
          });
        }
        journalAnalyses.value = []; // Clear in-memory analyses after saving
      }

      navigateTo(`/journal/${resultEntry.journal_id}${route.hash}`);
    } else {
      toast.error('Failed to save journal entry.');
    }
  }
};

const enhanceEntry = async () => {
  if (!editableEntry.value || (!editableEntry.value.title.trim() && !editableEntry.value.content.trim())) {
    toast.error("Journal entry is empty. Nothing to enhance.");
    return;
  }

  isEnhancingEntry.value = true;
  try {
    const { data, error } = await invokeEnhance({
      type: "journal_entry",
      object: {
        title: editableEntry.value.title,
        content: editableEntry.value.content,
      },
    });

    if (error) {
      toast.error(`Enhancement failed: ${error.message}`);
      console.error("Enhancement error:", error);
      const includesRateLimit = error.message.toLowerCase().includes("rate limit");
      const shouldShow = shouldShowDialog();
      if (includesRateLimit && shouldShow) {
        showUpgradeDialog.value = true;
        lastShownDate.value = new Date().toISOString().slice(0, 10);
      }
    } else if (data && data.object) {
      editableEntry.value.title = data.object.title;
      editableEntry.value.content = data.object.content;
      toast.success("Journal entry enhanced successfully!");
    } else {
      toast.error("Enhancement failed: Unexpected response.");
    }
  } catch (err) {
    toast.error(`An unexpected error occurred: ${err.message}`);
    console.error("Unexpected enhancement error:", err);
  } finally {
    isEnhancingEntry.value = false;
  }
};
</script>