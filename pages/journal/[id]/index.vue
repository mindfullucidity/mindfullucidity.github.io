<template>
  <template v-if="isLoadingEntry">
    <JournalEntryViewSkeleton />
  </template>
  <template v-else>
    <JournalEntryView :entry="entry" />
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import JournalEntryView from '@/components/journal/JournalEntryView.vue';
import JournalEntryViewSkeleton from '@/components/journal/JournalEntryViewSkeleton.vue';
import { useJournal } from '@/composables/useJournal';

const { findEntryById, loadEntriesOverview, isLoadingEntry } = useJournal();
const route = useRoute();

const entry = ref(null);

watch(() => route.params.id, async (newId) => {
  console.log('pages/journal/[id]/index.vue: route.params.id changed to', newId);
  const entryId = Number(newId);
  if (!isNaN(entryId)) {
    entry.value = await findEntryById(entryId);
    console.log('pages/journal/[id]/index.vue: entry loaded', entry.value);
  }
}, { immediate: true });

onMounted(() => {
  console.log('pages/journal/[id]/index.vue mounted. isLoadingEntry:', isLoadingEntry.value, 'entry:', entry.value);
});

definePageMeta({
  layout: 'journal',
});
</script>
