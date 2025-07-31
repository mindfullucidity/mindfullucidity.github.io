<template>
  <JournalEntryView :entry="entry" />
</template>

<script setup lang="ts">
import JournalEntryView from '@/components/journal/JournalEntryView.vue';
import { useJournal } from '@/composables/useJournal';

const { findEntryById, loadEntriesOverview } = useJournal();
const route = useRoute();

await loadEntriesOverview();

const entryId = Number(route.params.id);
const entry = await findEntryById(entryId);

definePageMeta({
  layout: 'journal',
});
</script>
