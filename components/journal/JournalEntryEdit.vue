<template>
  <div class="flex flex-col h-full">
    
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isEnhancingEntry }">
        <TabsList>
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <div class="flex h-5 items-center space-x-1 text-sm">
          <Button v-if="activeTab === 'entry'" variant="ghost" size="icon" @click="enhanceEntry" :disabled="isEnhancingEntry">
            <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
          </Button>
          <Separator v-if="activeTab === 'entry'" orientation="vertical" class="mx-2" />
          <Button variant="ghost" size="icon" @click="() => { if (!editableEntry || editableEntry.journal_id === 0) { navigateTo('/journal') } else { navigateTo(`/journal/${editableEntry.journal_id}${route.hash}`) } }">
            <X class="w-4 h-4 text-red-400" />
          </Button>
          <Button variant="ghost" size="icon" @click="saveEntry" :disabled="isSavingEntry">
            <Check class="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <TabsContent value="entry" class="p-6 overflow-y-auto flex-grow">
        <JournalEntrySkeleton v-if="isEnhancingEntry" />
        <div v-else-if="editableEntry">
          <EditableInput v-model="editableEntry.title" placeholder="Title" />
          <DatePicker variant="plain" v-model="editableEntry.date" />
          <EditableTextarea v-model="editableEntry.content" placeholder="What did you dream about?" />
        </div>
      </TabsContent>
      <TabsContent value="analysis" class="p-6 overflow-y-auto flex-grow">
          <div class="flex flex-col gap-4">
            <template v-if="journalAnalyses.length > 0">
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
                  :type="analysis.type.includes('ai') ? 'ai' : 'personal'"
                  :title="getAnalysisPrettyTitle(analysis.type)"
                  :content="analysis.content"
                  showActions="true"
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
                @save="handleSaveNewAnalysis"
                @cancel="handleCancelNewAnalysis"
              />
            </template>

            <div class="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
              <Button variant="ghost" class="border w-full sm:w-auto text-blue-200" @click="handleAddPersonalAnalysis">
                <Plus class="w-4 h-4" /> Add Your Analysis
              </Button>
              <Button variant="ghost" class="border w-full sm:w-auto " @click="handleAddAIAnalysis">
                <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" /> <span class="bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text"> Generate AI Analysis</span>
              </Button>
            </div>
          </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import type { JournalEntry, JournalAnalysis } from '@/composables/useJournal';
import { toast } from 'vue-sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoute, useRouter } from 'vue-router';
import NewAIAnalysisCard from './analysis_card/NewAIAnalysisCard.vue';
import NewPersonalAnalysisCard from './analysis_card/NewPersonalAnalysisCard.vue';
import PreviewAnalysisCard from './analysis_card/PreviewAnalysisCard.vue';
import { Plus, Sparkles, X, Check } from 'lucide-vue-next';

const props = defineProps<{ entry: JournalEntry | null }>();

const { createEntry, updateEntry, isSavingEntry, loadJournalAnalyses, createJournalAnalysis, updateJournalAnalysis, deleteJournalAnalysis, getAnalysisPrettyTitle } = useJournal();
const editableEntry = ref<JournalEntry | null>(null);
const isEnhancingEntry = ref(false);
const supabase = useSupabaseClient();

const route = useRoute();
const router = useRouter();
const activeTab = ref('entry');

const journalAnalyses = ref<JournalAnalysis[]>([]);
const showNewAnalysisCard = ref<'ai' | 'personal' | null>(null);
const editingAnalysis = ref<JournalAnalysis | null>(null);

watch(() => props.entry, (newVal) => {
  editableEntry.value = newVal ? { ...newVal } : { journal_id: 0, title: '', content: '', date: new Date().toISOString().slice(0, 10), description: '' };
}, { immediate: true });

watch([activeTab, () => editableEntry.value?.journal_id], async ([newTab, newJournalId]) => {
  if (newTab === 'analysis' && newJournalId && newJournalId !== 0) {
    await fetchJournalAnalyses(newJournalId);
  } else if (newTab === 'analysis' && (!newJournalId || newJournalId === 0)) {
    journalAnalyses.value = [];
  }
  if (newTab === 'analysis') {
    router.push({ hash: '#analysis' });
  } else {
    router.push({ hash: '' });
  }
});

onMounted(() => {
  if (route.hash === '#analysis') {
    activeTab.value = 'analysis';
  } else {
    activeTab.value = 'entry';
  }
});

const fetchJournalAnalyses = async (journalId: number) => {
  const analyses = await loadJournalAnalyses(journalId);
  if (analyses) {
    journalAnalyses.value = analyses;
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
};

const handleAddAIAnalysis = () => {
  if (showNewAnalysisCard.value === 'ai') {
    return;
  }
  showNewAnalysisCard.value = 'ai';
  editingAnalysis.value = null;
};

const handleCancelNewAnalysis = () => {
  showNewAnalysisCard.value = null;
  editingAnalysis.value = null;
};

const handleSaveNewAnalysis = async (analysisData: Omit<JournalAnalysis, 'journal_analysis_id' | 'created_at' | 'user_id'>) => {
  if (!editableEntry.value || editableEntry.value.journal_id === 0) {
    toast.error('Please save the journal entry first.');
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
      journal_id: editableEntry.value.journal_id,
    });
  }

  if (resultAnalysis) {
    toast.success('Analysis saved successfully!');
    showNewAnalysisCard.value = null;
    editingAnalysis.value = null;
    await fetchJournalAnalyses(editableEntry.value.journal_id);
  } else {
    toast.error('Failed to save analysis.');
  }
};

const handleDeleteAnalysis = async (analysisId: number) => {
  const success = await deleteJournalAnalysis(analysisId);
  if (success) {
    toast.success('Analysis deleted successfully!');
    if (editableEntry.value) {
      await fetchJournalAnalyses(editableEntry.value.journal_id);
    }
  } else {
    toast.error('Failed to delete analysis.');
  }
};

const handleEditAnalysis = (analysisId: number) => {
  const analysisToEdit = journalAnalyses.value.find(a => a.journal_analysis_id === analysisId);
  const personalAnalysisTypes = ['initial-thoughts', 'meditation', 'retrospective'];
  if (analysisToEdit && personalAnalysisTypes.includes(analysisToEdit.type)) {
    editingAnalysis.value = { ...analysisToEdit };
    showNewAnalysisCard.value = 'personal';
  } else if (analysisToEdit && analysisToEdit.type.includes('ai')) {
    // AI analyses are not editable via this flow, but we can log if needed
    console.warn('Attempted to edit an AI analysis, which is not supported via this flow.');
  }
};

const saveEntry = async () => {
  if (editableEntry.value) {
    console.log('Content before trim:', editableEntry.value.content);
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
    const { data, error } = await supabase.functions.invoke('enhance', {
      body: {
        type: "journal_entry",
        object: {
          title: editableEntry.value.title,
          content: editableEntry.value.content,
        },
      },
    });

    if (error) {
      toast.error(`Enhancement failed: ${error.message}`);
      console.error("Enhancement error:", error);
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
