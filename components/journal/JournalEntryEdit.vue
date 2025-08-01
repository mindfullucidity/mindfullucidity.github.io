<template>
  <div class="flex flex-col h-full">
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a78bfa" />
          <stop offset="100%" stop-color="#60a5fa" />
        </linearGradient>
      </defs>
    </svg>
    <Tabs v-model="activeTab" class="flex flex-col h-full">
      <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isEnhancingEntry }">
        <TabsList>
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <div class="flex h-5 items-center space-x-1 text-sm">
          <Button variant="ghost" size="icon" @click="enhanceEntry" :disabled="isEnhancingEntry">
            <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
          </Button>
          <Separator orientation="vertical" class="mx-2" />
          <Button variant="ghost" size="icon" @click="() => { if (!editableEntry || editableEntry.id === 0) { navigateTo('/journal') } else { navigateTo(`/journal/${editableEntry.id}${route.hash}`) } }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-red-400"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
          <Button variant="ghost" size="icon" @click="saveEntry" :disabled="isSavingEntry">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
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
      <TabsContent value="analysis" class="flex-grow">
        <div class="p-6">
          <p>Analysis content goes here.</p>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useJournal } from '@/composables/useJournal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles } from 'lucide-vue-next';
import EditableInput from './EditableInput.vue';
import EditableTextarea from './EditableTextarea.vue';
import DatePicker from './DatePicker.vue';
import JournalEntrySkeleton from './JournalEntrySkeleton.vue';
import type { JournalEntry } from '@/composables/useJournal';
import { toast } from 'vue-sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{ entry: JournalEntry | null }>();

const { createEntry, updateEntry, isSavingEntry } = useJournal();
const editableEntry = ref<JournalEntry | null>(null);
const isEnhancingEntry = ref(false);
const supabase = useSupabaseClient();

const route = useRoute();
const router = useRouter();
const activeTab = ref('entry');

watch(() => props.entry, (newVal) => {
  editableEntry.value = newVal ? { ...newVal } : { id: 0, title: '', content: '', date: new Date().toISOString().slice(0, 10), description: '' };
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

const saveEntry = async () => {
  if (editableEntry.value) {
    console.log('Content before trim:', editableEntry.value.content);
    if (!editableEntry.value.content.trim()) {
      toast.error('Journal entry cannot be empty.');
      return;
    }

    let resultEntry: JournalEntry | null = null;
    if (editableEntry.value.id && editableEntry.value.id !== 0) {
      resultEntry = await updateEntry(editableEntry.value);
    } else {
      resultEntry = await createEntry({ title: editableEntry.value.title, content: editableEntry.value.content, date: editableEntry.value.date });
    }
    if (resultEntry) {
      navigateTo(`/journal/${resultEntry.id}${route.hash}`);
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
