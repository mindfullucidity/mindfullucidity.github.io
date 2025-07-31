<template>
  <JournalEntryEdit v-if="entry" :entry="entry" />
</template>

<script setup lang="ts">
import JournalEntryEdit from '@/components/journal/JournalEntryEdit.vue';
import { useJournal } from '@/composables/useJournal';
import { ref, watch, onMounted } from 'vue';

const { findEntryById, selectedEntry, selectEntry } = useJournal();
const route = useRoute();

const entry = ref(null);

watch(() => route.params.id, async (newId) => {
  const entryId = Number(newId);
  const foundEntry = await findEntryById(entryId);
  if (foundEntry) {
    entry.value = foundEntry;
    await selectEntry(foundEntry);
  } else {
    entry.value = null; // Clear entry if not found
  }
}, { immediate: true });

definePageMeta({
  layout: 'journal',
});
</script>
