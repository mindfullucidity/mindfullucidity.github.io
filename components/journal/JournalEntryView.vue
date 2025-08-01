<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0" :class="{ 'pointer-events-none opacity-50': isLoadingEntry }">
        <div class="flex h-5 items-center space-x-1 text-sm">
        <Button variant="ghost" size="icon" @click="deleteCurrentEntry">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-red-400"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </Button>
        <Button variant="ghost" size="icon" @click="navigateTo(`/journal/${entry?.id}/edit`)">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </Button>
        </div>
    </div>
    <Separator />
    <div class="p-8 overflow-y-auto">
      <JournalEntrySkeleton v-if="isLoadingEntry || !entry" />
      <div v-else-if="entry">
        <h1 class="text-2xl font-bold">{{ entry.title }}</h1>
        <div class="flex items-center gap-2 text-sm text-muted-foreground  px-2 py-1 mb-4">
          <CalendarIcon class="h-4 w-4 translate-y-[-1px]" />
          <p>{{ formattedDate }}</p>
        </div>
        <div class="mt-4 whitespace-pre-wrap">{{ entry.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useJournal } from '@/composables/useJournal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon } from 'lucide-vue-next';
import JournalEntrySkeleton from './JournalEntrySkeleton.vue';
import type { JournalEntry } from '@/composables/useJournal';
import { formatDate } from '@/lib/utils';

const props = defineProps<{ entryId: number | null }>();

const { findEntryById, isLoadingEntry } = useJournal();
const entry = ref<JournalEntry | null>(null);

watch(() => props.entryId, async (newId) => {
  entry.value = null; // Clear current entry to force re-render
  if (newId) {
    entry.value = await findEntryById(newId);
  }
}, { immediate: true });

const { deleteEntry } = useJournal();

const formattedDate = computed(() => {
  return entry.value ? formatDate(entry.value.date) : '';
});

const deleteCurrentEntry = async () => {
  if (entry.value) {
    await deleteEntry(entry.value.id);
    navigateTo('/journal');
  }
};
</script>
