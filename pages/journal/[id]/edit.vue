<template>
  <JournalEntryEdit v-if="entry" :entry="entry" />
</template>

<script setup lang="ts">
import JournalEntryEdit from '@/components/journal/JournalEntryEdit.vue';
import { useJournal } from '@/composables/useJournal';
import { ref, watch, onMounted } from 'vue';

const { findEntryById, loadEntries, selectedEntry, selectEntry } = useJournal();
const route = useRoute();

const entry = ref(null);

onMounted(() => {
  loadEntries(); // Load entries once when component is mounted
});

watch(() => route.params.id, (newId) => {
  const entryId = Number(newId);
  const foundEntry = findEntryById(entryId);
  if (foundEntry) {
    entry.value = foundEntry;
    selectEntry(foundEntry);
  } else {
    entry.value = null; // Clear entry if not found
  }
}, { immediate: true });

definePageMeta({
  layout: 'journal',
});
</script>
