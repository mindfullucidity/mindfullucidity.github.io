<template>
  <div class="flex flex-col h-full">
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <JournalEntryViewToolbar
        v-model:activeTab="activeTab"
        :is-enhancing-entry="isEnhancingEntry"
        :is-loading-entry="isLoadingEntry"
        :is-content-ready="isContentReady"
        :is-new-entry="isNewEntry"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving-entry="isSavingEntry"
        @enhance-entry="enhanceEntry"
        @delete-entry-and-navigate="deleteEntryAndNavigate"
        @cancel-edit="cancelEdit"
        @save-entry="saveEntry"
      />
      <Separator />
      <JournalEntryViewEntry
        v-model:editableEntry="editableEntry"
        :is-loading-entry="isLoadingEntry"
        :is-enhancing-entry="isEnhancingEntry"
      />
      <JournalEntryViewAnalysis
        v-if="editableEntry"
        ref="journalAnalysisRef"
        :editable-entry="editableEntry"
        :is-new-entry="isNewEntry"
        :active-tab="activeTab"
        @show-upgrade-dialog="showUpgradeDialog = true"
      />
      <TabsContent value="details" class="p-6 overflow-y-auto flex-grow">
        <div class="mx-auto max-w-4xl w-full">
          <JournalEntryViewDetails
            :initial-lucidity-level="editableEntry?.lucidity_level"
            :initial-lucidity-trigger="editableEntry?.lucidity_trigger"
            :initial-mood="editableEntry?.mood"
            :initial-characteristics="editableEntry?.characteristics"
            :is-loading-entry="isLoadingEntry"
            :is-enhancing-details="activeTab === 'details' && isEnhancingEntry"
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
import type { JournalEntry } from '@/composables/useJournal';
import { toast } from 'vue-sonner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import EnableCustomCardPlusUpgrade from '@/components/EnableCustomCardPlusUpgrade.vue';
import { useAI } from '@/composables/useAI';
import { useJournal } from '@/composables/useJournal';

import { useLocalStorage } from '@vueuse/core';
import { useRoute, useRouter } from 'vue-router';

import JournalEntryViewToolbar from './JournalEntryViewToolbar.vue';
import JournalEntryViewEntry from './JournalEntryViewEntry.vue';
import JournalEntryViewAnalysis from './JournalEntryViewAnalysis.vue';
import JournalEntryViewDetails from './JournalEntryViewDetails.vue';

const props = defineProps<{
  entryId: number | null,
  isNewEntry?: boolean,
}>();

const { createEntry, updateEntry, isSavingEntry, isLoadingEntry, findEntryById, deleteEntry, createJournalAnalysis } = useJournal();
const { invokeEnhance } = useAI();
const showUpgradeDialog = ref(false);

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

const route = useRoute();
const router = useRouter();
const activeTab = ref('entry');

const lastDeletedEntry = ref<JournalEntry | null>(null);

const journalAnalysisRef = ref<typeof JournalEntryViewAnalysis | null>(null);

watch(() => props.entryId, async (newId) => {
  isContentReady.value = false; 
  editableEntry.value = null; 
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
  isContentReady.value = true; 
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

}, { deep: true });

watch(activeTab, (newTab) => {
  if (newTab === 'analysis') {
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

const cancelEdit = () => {
  if (props.isNewEntry) {
    navigateTo('/journal');
  } else if (originalEntry.value) {
    editableEntry.value = { ...originalEntry.value };
  }
  hasUnsavedChanges.value = false;
};

const deleteEntryAndNavigate = async () => {
  if (editableEntry.value && editableEntry.value.journal_id !== 0) {
    lastDeletedEntry.value = { ...editableEntry.value }; 
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
      lastDeletedEntry.value = null; 
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
      lucidity_level: lastDeletedEntry.value.lucidity_level,
      lucidity_trigger: lastDeletedEntry.value.lucidity_trigger,
      mood: lastDeletedEntry.value.mood,
      characteristics: lastDeletedEntry.value.characteristics,
    });

    if (restoredEntry) {
      toast.success('Journal entry restored successfully!');
      const restoredAnalyses: JournalAnalysis[] = [];
      if (lastDeletedEntry.value.analyses) {
        for (const analysis of lastDeletedEntry.value.analyses) {
          const newAnalysis = await createJournalAnalysis({
            journal_id: restoredEntry.journal_id,
            type: analysis.type,
            title: analysis.title,
            content: analysis.content,
          });
          if (newAnalysis) {
            restoredAnalyses.push(newAnalysis);
          }
        }
      }
      editableEntry.value = {
        ...restoredEntry,
        analyses: restoredAnalyses,
      };
      navigateTo(`/journal/${restoredEntry.journal_id}`);
      lastDeletedEntry.value = null;
    } else {
      toast.error('Failed to restore journal entry.');
    }
  }
};

const saveEntry = async () => {
  if (editableEntry.value) {
    if (!editableEntry.value.content.trim()) {
      toast.error('Journal entry cannot be empty.');
      return;
    }

    if (props.isNewEntry) {
      const newEntry = await createEntry(editableEntry.value);
      if (newEntry) {
        editableEntry.value.journal_id = newEntry.journal_id;
      } else {
        toast.error('Failed to create new entry.');
        return;
      }
    } else {
      await updateEntry(editableEntry.value);
    }

    if (props.isNewEntry && journalAnalysisRef.value) {
      for (const analysis of journalAnalysisRef.value.journalAnalyses) {
        await createJournalAnalysis({
          journal_id: editableEntry.value.journal_id,
          type: analysis.type,
          title: analysis.title,
          content: analysis.content,
        });
      }
      journalAnalysisRef.value.journalAnalyses = []; 
    }

    navigateTo(`/journal/${editableEntry.value.journal_id}${route.hash}`);
  }
};

const enhanceJournalEntry = async () => {
  if (!editableEntry.value || (!editableEntry.value.title.trim() && !editableEntry.value.content.trim())) {
    toast.error("Journal entry is empty. Nothing to enhance.");
    return;
  }

  const wordCount = editableEntry.value.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 3) {
    toast.error("Journal entry must have at least 3 words to enhance.");
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

const enhanceJournalDetails = async () => {
  if (!editableEntry.value || !editableEntry.value.lucidity_trigger.trim()) {
    toast.error("Lucidity trigger is empty. Nothing to enhance.");
    return;
  }

  const wordCount = editableEntry.value.lucidity_trigger.trim().split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 3) {
    toast.error("Lucidity trigger must have at least 3 words to enhance.");
    return;
  }

  isEnhancingEntry.value = true;
  try {
    const { data, error } = await invokeEnhance({
      type: "journal_details",
      object: {
        lucidity_level: editableEntry.value.lucidity_level,
        lucidity_trigger: editableEntry.value.lucidity_trigger,
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
      editableEntry.value.lucidity_trigger = data.object.lucidity_trigger;
      toast.success("Lucidity trigger enhanced successfully!");
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

const enhanceEntry = () => {
  if (activeTab.value === 'details') {
    enhanceJournalDetails();
  } else {
    enhanceJournalEntry();
  }
};
</script>