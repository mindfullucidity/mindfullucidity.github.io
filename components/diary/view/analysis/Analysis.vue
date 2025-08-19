<template>
  <TabsContent value="analysis" class="p-6 overflow-y-auto flex-grow min-w-0">
    <div class="mx-auto max-w-4xl w-full">
      <div class="flex flex-col gap-4 overflow-y-auto flex-grow" ref="analysisContainerRef">
        <template v-if="!diaryViewActiveStore.isLoaded">
          <SkeletonPreviewAnalysisCard :type="null" />
        </template>
        <template v-else-if="diaryAnalyses.length > 0">
          <template v-for="analysis in diaryAnalyses" :key="analysis.journal_analysis_id">
            <NewPersonalAnalysisCard
              v-if="editingAnalysis && editingAnalysis.journal_analysis_id === analysis.journal_analysis_id"
              :journalId="diaryViewActiveStore.current.journal_id"
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
            :journalId="diaryViewActiveStore.current.journal_id"
            @save="handleSaveNewAnalysis"
            @cancel="handleCancelNewAnalysis"
          />
        </template>
        <template v-else-if="showNewAnalysisCard === 'ai' && !editingAnalysis">
          <NewAIAnalysisCard
            :journalId="diaryViewActiveStore.current.journal_id"
            :journalContent="diaryViewActiveStore.current.entry.content"
            @generate-ai-analysis="handleGenerateAIAnalysis"
            @cancel="handleCancelNewAnalysis"
          />
        </template>
        <template v-if="isGeneratingAIAnalysis && currentStreamingAnalysis">
          <AIStreamingPreviewAnalysisCard
            :type="currentStreamingAnalysis.type"
            :title="currentStreamingAnalysis.title"
            :text-chunks="currentStreamingAnalysis.textChunks"
            :is-streaming="isGeneratingAIAnalysis"
            @cancel-generation="handleCancelAIAnalysisGeneration"
            @stream-complete="handleStreamComplete"
          />
        </template>
        <template v-else-if="newlyGeneratedAnalysis">
          <PreviewAnalysisCard
            :analysisId="newlyGeneratedAnalysis.journal_analysis_id"
            :type="newlyGeneratedAnalysis.type"
            :title="getAnalysisPrettyTitle(newlyGeneratedAnalysis.title)"
            :content="newlyGeneratedAnalysis.content"
            :show-actions="true"
            @delete="handleDeleteAnalysis"
            @edit="handleEditAnalysis"
          />
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
import { toast } from 'vue-sonner';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-vue-next';
import SkeletonPreviewAnalysisCard from '@/components/journal/analysis_card/SkeletonPreviewAnalysisCard.vue';
import NewPersonalAnalysisCard from '@/components/journal/analysis_card/NewPersonalAnalysisCard.vue';
import PreviewAnalysisCard from '@/components/journal/analysis_card/PreviewAnalysisCard.vue';
import NewAIAnalysisCard from '@/components/journal/analysis_card/NewAIAnalysisCard.vue';
import AIStreamingPreviewAnalysisCard from '@/components/journal/analysis_card/AIStreamingPreviewAnalysisCard.vue';
import { useAI } from '@/composables/useAI';
import { useLocalStorage } from '@vueuse/core';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';
import type { JournalAnalysis } from '@/components/diary'; // Assuming this path for types

const props = defineProps<{
  activeTab: string;
}>();

const emit = defineEmits([
  'showUpgradeDialog',
]);

const diaryViewActiveStore = useDiaryViewActiveStore();
const { invokeAIAnalysis, streamAIAnalysis } = useAI();

const diaryAnalyses = computed(() => diaryViewActiveStore.current.analyses);
const currentStreamingAnalysis = ref<{ type: 'ai', title: string | null, textChunks: string[] } | null>(null);
const newlyGeneratedAnalysis = ref<JournalAnalysis | null>(null);
const showNewAnalysisCard = ref<'ai' | 'personal' | null>(null);
const editingAnalysis = ref<JournalAnalysis | null>(null);
const lastDeletedAnalysis = ref<JournalAnalysis | null>(null);
const isLoadingAnalyses = ref(false); // This will be managed by the store's loading state
const isGeneratingAIAnalysis = ref(false);
const generatingAnalysisType = ref<string | null>(null);
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

// Helper function for pretty titles (can be moved to a composable later)
const getAnalysisPrettyTitle = (title: string) => {
  switch (title) {
    case 'jungian': return 'Jungian Analysis';
    case 'freudian': return 'Freudian Analysis';
    case 'cognitive-behavioral': return 'Cognitive Behavioral Analysis';
    case 'initial-thoughts': return 'Initial Thoughts';
    case 'meditation': return 'Meditation';
    case 'retrospective': return 'Retrospective';
    default: return title;
  }
};

// No need for onMounted or watch(activeTab) to fetch analyses, as the store manages it.
// However, we might want to ensure the store is loaded when this tab becomes active.
watch(() => props.activeTab, async (newTab) => {
  if (newTab === 'analysis') {
    // Ensure the store has loaded the journal if it's not a new entry
    if (!diaryViewActiveStore.isNew && !diaryViewActiveStore.isLoaded) {
      // This scenario should ideally be handled by the parent component loading the store
      // before rendering this tab. For now, we'll just rely on the store's reactivity.
    }
  }
});


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
  generatingAnalysisType.value = null;
};

const handleCancelAIAnalysisGeneration = () => {
  if (abortController.value) {
    abortController.value.abort();
  }
  isGeneratingAIAnalysis.value = false;
  generatingAnalysisType.value = null;
};

const handleGenerateAIAnalysis = async (payload: { journal_id: number, type: string, depth: string, content: string }) => {
  
  if (!diaryViewActiveStore.current) {
    toast.error('Diary entry is not loaded.');
    return;
  }

  isGeneratingAIAnalysis.value = true;
  generatingAnalysisType.value = payload.type;
  showNewAnalysisCard.value = null;
  abortController.value = new AbortController();

  currentStreamingAnalysis.value = {
    type: 'ai',
    title: getAnalysisPrettyTitle(payload.type),
    textChunks: [],
  };
  

  try {
    await streamAIAnalysis({
      entry: {
        title: diaryViewActiveStore.current.entry.title,
        content: diaryViewActiveStore.current.entry.content,
      },
      analyses: diaryAnalyses.value,
      generate: {
        type: payload.type,
        depth: payload.depth,
        note: payload.content,
      },
    }, (chunk) => {
      if (currentStreamingAnalysis.value) {
        currentStreamingAnalysis.value.textChunks.push(chunk);
        
      }
    }, abortController.value.signal);

    // Only call handleStreamComplete if the generation was NOT aborted
    if (!abortController.value.signal.aborted && currentStreamingAnalysis.value) {
      await handleStreamComplete(currentStreamingAnalysis.value.textChunks.join(''));
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      toast.info('AI Analysis generation cancelled.');
      
    } else {
      toast.error(`An unexpected error occurred during AI Analysis: ${err.message}`);
      console.error("handleGenerateAIAnalysis: Unexpected AI Analysis error:", err);
      if (err.message.includes("rate limit") && shouldShowDialog()) {
        emit('showUpgradeDialog');
      }
    }
  } finally {
    isGeneratingAIAnalysis.value = false;
    currentStreamingAnalysis.value = null;
    abortController.value = null;
    
  }
};

const handleStreamComplete = async (fullContent: string) => {

  if (!currentStreamingAnalysis.value) {
    toast.error('Streaming analysis data missing.');
    console.error('handleStreamComplete: Streaming analysis data missing.');
    return;
  }

  if (!fullContent.trim()) { // Check if content is empty or just whitespace
    toast.error('AI did not return an analysis. It might have deemed the content inappropriate or encountered an internal issue.');
    console.error('handleStreamComplete: AI returned empty content.');
    isGeneratingAIAnalysis.value = false;
    currentStreamingAnalysis.value = null;
    abortController.value = null;
    return;
  }

  const payloadType = generatingAnalysisType.value;
  if (!payloadType) {
    toast.error('Analysis type missing after stream completion.');
    console.error('handleStreamComplete: Analysis type missing after stream completion.');
    return;
  }

  const newAnalysis: JournalAnalysis = {
    journal_analysis_id: Date.now() * -1, // Temporary ID for new analysis
    created_at: new Date().toISOString(),
    journal_id: diaryViewActiveStore.current.journal_id,
    type: `ai`,
    title: `${payloadType}`,
    content: fullContent,
    user_id: '', // Will be filled on save to DB
  };

  diaryViewActiveStore.current.analyses.push(newAnalysis);
  diaryViewActiveStore.current.analyses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  toast.success('AI Analysis generated and added to entry!');
  newlyGeneratedAnalysis.value = newAnalysis;

  await nextTick();
  newlyGeneratedAnalysis.value = null; // Clear after nextTick to prevent duplication

  isGeneratingAIAnalysis.value = false;
  currentStreamingAnalysis.value = null;
  abortController.value = null;

};

const handleSaveNewAnalysis = async (analysisData: Omit<JournalAnalysis, 'journal_analysis_id' | 'created_at' | 'user_id'>) => {
  if (editingAnalysis.value) {
    const index = diaryViewActiveStore.current.analyses.findIndex(a => a.journal_analysis_id === editingAnalysis.value?.journal_analysis_id);
    if (index !== -1) {
      diaryViewActiveStore.current.analyses[index] = {
        ...diaryViewActiveStore.current.analyses[index],
        ...analysisData,
      };
      toast.success('Analysis updated in memory!');
    }
  } else {
    const newAnalysis: JournalAnalysis = {
      journal_analysis_id: Date.now() * -1, // Temporary ID
      created_at: new Date().toISOString(),
      journal_id: diaryViewActiveStore.current.journal_id,
      type: analysisData.type,
      title: analysisData.title,
      content: analysisData.content,
      user_id: '', // Will be filled on save to DB
    };
    diaryViewActiveStore.current.analyses.push(newAnalysis);
    toast.success('Analysis added to entry!');
  }
  diaryViewActiveStore.current.analyses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  showNewAnalysisCard.value = null;
  editingAnalysis.value = null;
};

const handleUndoDeleteAnalysis = async () => {
  if (lastDeletedAnalysis.value) {
    diaryViewActiveStore.current.analyses.push(lastDeletedAnalysis.value);
    diaryViewActiveStore.current.analyses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    lastDeletedAnalysis.value = null;
    toast.success('Analysis restored to memory!');
  }
};

const handleDeleteAnalysis = async (analysisId: number) => {
  const analysisToDelete = diaryViewActiveStore.current.analyses.find(a => a.journal_analysis_id === analysisId);
  if (!analysisToDelete) {
    toast.error('Analysis not found.');
    return;
  }

  lastDeletedAnalysis.value = analysisToDelete;
  diaryViewActiveStore.current.analyses = diaryViewActiveStore.current.analyses.filter(a => a.journal_analysis_id !== analysisId);
  toast.success('Analysis deleted from memory!', {
    action: {
      label: 'Undo',
      onClick: () => handleUndoDeleteAnalysis(),
    },
    duration: 5000, 
  });
};

const handleEditAnalysis = (analysisId: number) => {
  const analysisToEdit = diaryViewActiveStore.current.analyses.find(a => a.journal_analysis_id === analysisId);
  if (analysisToEdit && analysisToEdit.type === 'personal') {
    editingAnalysis.value = { ...analysisToEdit };
    showNewAnalysisCard.value = 'personal';
  } else if (analysisToEdit && analysisToEdit.type.includes('ai')) {
    console.warn('Attempted to edit an AI analysis, which is not supported via this flow.');
  }
};
</script>
