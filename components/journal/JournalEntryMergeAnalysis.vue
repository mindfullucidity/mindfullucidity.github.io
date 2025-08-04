<template>
  <TabsContent value="analysis" class="p-6 overflow-y-auto flex-grow min-w-0">
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
</template>

<script setup lang="ts">
import type { JournalEntry, JournalAnalysis } from '@/composables/useJournal';
import { toast } from 'vue-sonner';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-vue-next';
import SkeletonPreviewAnalysisCard from './analysis_card/SkeletonPreviewAnalysisCard.vue';
import NewPersonalAnalysisCard from './analysis_card/NewPersonalAnalysisCard.vue';
import PreviewAnalysisCard from './analysis_card/PreviewAnalysisCard.vue';
import NewAIAnalysisCard from './analysis_card/NewAIAnalysisCard.vue';
import { useJournal } from '@/composables/useJournal';
import { useAI } from '@/composables/useAI';
import { useLocalStorage } from '@vueuse/core';

const props = defineProps<{
  editableEntry: JournalEntry;
  isNewEntry: boolean;
  activeTab: string;
}>();

const emit = defineEmits([
  'showUpgradeDialog',
  'saveNewEntryAnalyses', // New emit for saving analyses when the entry is new
]);

const { loadJournalAnalyses, createJournalAnalysis, updateJournalAnalysis, deleteJournalAnalysis, getAnalysisPrettyTitle } = useJournal();
const { invokeAIAnalysis } = useAI();

const journalAnalyses = ref<JournalAnalysis[]>([]);
const showNewAnalysisCard = ref<'ai' | 'personal' | null>(null);
const editingAnalysis = ref<JournalAnalysis | null>(null);
const lastDeletedAnalysis = ref<JournalAnalysis | null>(null);
const isLoadingAnalyses = ref(false);
const isGeneratingAIAnalysis = ref(false);
const abortController = ref<AbortController | null>(null);

const analysisContainerRef = ref<HTMLElement | null>(null);

const lastShownDate = useLocalStorage('lastUpgradeDialogShown', '');

const shouldShowDialog = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (lastShownDate.value !== today) {
    return true;
  }
  return false;
};

watch(() => props.activeTab, async (newTab) => {
  if (newTab === 'analysis') {
    if (props.isNewEntry) {
      journalAnalyses.value = journalAnalyses.value; 
    } else if (props.editableEntry.journal_id && props.editableEntry.journal_id !== 0) {
      await fetchJournalAnalyses(props.editableEntry.journal_id);
    } else {
      journalAnalyses.value = [];
    }
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
    editingAnalysis.value = null; 
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
  if (!props.editableEntry) {
    toast.error('Journal entry is not loaded.');
    return;
  }

  isGeneratingAIAnalysis.value = true;
  showNewAnalysisCard.value = null; 
  abortController.value = new AbortController();

  try {
    const { data, error } = await invokeAIAnalysis({
      entry: {
        title: props.editableEntry.title,
        content: props.editableEntry.content,
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
        emit('showUpgradeDialog');
      }
    } else if (data && data.object && data.object.content) {
      if (isGeneratingAIAnalysis.value) {
        if (props.isNewEntry) {
          const newAnalysis: JournalAnalysis = {
            journal_analysis_id: Date.now() * -1, 
            created_at: new Date().toISOString(),
            journal_id: 0, 
            type: `ai`,
            title: `${payload.type}`,
            content: data.object.content,
            user_id: '', 
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
      }
    } else {
      toast.error("AI Analysis failed: Unexpected response from function.");
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
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
  if (props.isNewEntry) {
    if (editingAnalysis.value) {
      const index = journalAnalyses.value.findIndex(a => a.journal_analysis_id === editingAnalysis.value?.journal_analysis_id);
      if (index !== -1) {
        journalAnalyses.value[index] = {
          ...journalAnalyses.value[index],
          ...analysisData,
        };
        toast.success('Analysis updated in memory!');
      }
    } else {
      const newAnalysis: JournalAnalysis = {
        journal_analysis_id: Date.now() * -1, 
        created_at: new Date().toISOString(),
        journal_id: 0, 
        type: analysisData.type,
        title: analysisData.title,
        content: analysisData.content,
        user_id: '', 
      };
      journalAnalyses.value.push(newAnalysis);
      toast.success('Analysis added to entry!');
    }
    journalAnalyses.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    showNewAnalysisCard.value = null;
    editingAnalysis.value = null;
    return;
  }

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
      journal_id: props.editableEntry.journal_id,
    });
  }

  if (resultAnalysis) {
    toast.success('Analysis saved successfully!');
    if (editingAnalysis.value) { 
      const index = journalAnalyses.value.findIndex(a => a.journal_analysis_id === resultAnalysis.journal_analysis_id);
      if (index !== -1) {
        journalAnalyses.value[index] = resultAnalysis;
      }
    } else { 
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
    const success = await deleteJournalAnalysis(analysisId, props.editableEntry.journal_id);
    if (success) {
      lastDeletedAnalysis.value = analysisToDelete;
      journalAnalyses.value = journalAnalyses.value.filter(a => a.journal_analysis_id !== analysisId);
      toast.success('Analysis deleted successfully!', {
        action: {
          label: 'Undo',
          onClick: () => handleUndoDeleteAnalysis(),
        },
        duration: 5000, 
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
    console.warn('Attempted to edit an AI analysis, which is not supported via this flow.');
  }
};

// Expose journalAnalyses for parent component to access when saving a new entry
defineExpose({
  journalAnalyses,
});
</script>
