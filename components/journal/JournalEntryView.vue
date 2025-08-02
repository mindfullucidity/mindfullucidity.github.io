<template>
  <div class="flex flex-col h-full">
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isLoadingEntry }">
        <TabsList>
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <div class="flex h-5 items-center space-x-1 text-sm">
          <Button variant="ghost" size="icon" @click="deleteCurrentEntry">
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
          <Button variant="ghost" size="icon" @click="navigateTo(`/journal/${entry?.journal_id}/edit${route.hash}`)">
            <Pencil class="w-4 h-4" />
          </Button>
        </div>
      </div>
      <Separator />
      <TabsContent value="entry" class="p-6 overflow-y-auto flex-grow">
        <JournalEntrySkeleton v-if="isLoadingEntry || !entry" />
        <div v-else-if="entry">
          <h1 class="text-2xl font-bold">{{ entry.title }}</h1>
          <div class="flex items-center gap-2 text-sm text-muted-foreground  px-2 py-1 mb-4">
            <CalendarIcon class="h-4 w-4 translate-y-[-1px]" />
            <p>{{ formattedDate }}</p>
          </div>
          <div class="mt-4 whitespace-pre-wrap">{{ entry.content }}</div>
        </div>
      </TabsContent>
      <TabsContent value="analysis" class="p-6 overflow-y-auto flex-grow">
        <div v-if="entry?.journal_analyses?.length">
          <div v-for="analysis in entry.journal_analyses" :key="analysis.journal_analysis_id" class="mb-4">
            <PreviewAnalysisCard
              :analysis-id="analysis.journal_analysis_id"
              :type="analysis.type"
              :title="getAnalysisPrettyTitle(analysis.title)"
              :content="analysis.content"
              :show-actions="false"
              @delete="handleAnalysisDelete"
            />
          </div>
        </div>
        <div v-else class="text-center text-muted-foreground">
          <p>No analyses created yet.</p>
          <p>Go to the edit page to create one.</p>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUpdated } from 'vue';
import { useJournal } from '@/composables/useJournal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Trash2, Pencil } from 'lucide-vue-next';
import JournalEntrySkeleton from './JournalEntrySkeleton.vue';
import type { JournalEntry, JournalAnalysis } from '@/composables/useJournal';
import { formatDate } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoute, useRouter } from 'vue-router';
import PreviewAnalysisCard from './analysis_card/PreviewAnalysisCard.vue';
import NewPersonalAnalysisCard from './analysis_card/NewPersonalAnalysisCard.vue';
import NewAIAnalysisCard from './analysis_card/NewAIAnalysisCard.vue';

const props = defineProps<{ entryId: number | null }>();

const { findEntryById, isLoadingEntry, updateJournalAnalysis, deleteJournalAnalysis, getAnalysisPrettyTitle } = useJournal();
const entry = ref<JournalEntry | null>(null);

onUpdated(() => {
  console.log('JournalEntryView: Component updated.');
});

const route = useRoute();
const router = useRouter();
const activeTab = ref('entry');

watch(() => props.entryId, async (newId) => {
  entry.value = null; // Clear current entry to force re-render
  if (newId) {
    entry.value = await findEntryById(newId);
  }
}, { immediate: true });

watch(activeTab, (newTab) => {
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

watch(activeTab, (newTab) => {
  if (newTab === 'analysis') {
    router.push({ hash: '#analysis' });
  } else {
    router.push({ hash: '' });
  }
});

const { deleteEntry } = useJournal();

const formattedDate = computed(() => {
  return entry.value ? formatDate(entry.value.date) : '';
});

const deleteCurrentEntry = async () => {
  if (entry.value) {
    await deleteEntry(entry.value.journal_id);
    navigateTo('/journal');
  }
};

const handleAnalysisSave = async (updatedAnalysis: JournalAnalysis) => {
  console.log('JournalEntryView: handleAnalysisSave called with', updatedAnalysis);
  const result = await updateJournalAnalysis(updatedAnalysis);
  if (result && entry.value?.journal_analyses) {
    const existingAnalysis = entry.value.journal_analyses.find(a => a.journal_analysis_id === updatedAnalysis.journal_analysis_id);
    if (existingAnalysis) {
      // Update properties of the existing object to maintain reactivity
      Object.assign(existingAnalysis, result);
    }
  }
  console.log('JournalEntryView: handleAnalysisSave completed.');
};

const handleAnalysisCancel = () => {
  console.log('JournalEntryView: handleAnalysisCancel called.');
};

const handleAnalysisDelete = async (analysisId: number) => {
  console.log('JournalEntryView: handleAnalysisDelete called for analysis', analysisId);
  const success = await deleteJournalAnalysis(analysisId);
  if (success && entry.value) {
    entry.value.journal_analyses = entry.value.journal_analyses?.filter(a => a.journal_analysis_id !== analysisId);
  }
  console.log('JournalEntryView: handleAnalysisDelete completed.');
};
</script>
