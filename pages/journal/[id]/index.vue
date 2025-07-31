<template>
  <JournalEntryView :entry="entry" />
</template>

<script setup lang="ts">
import JournalEntryView from '@/components/journal/JournalEntryView.vue';
import { useJournal } from '@/composables/useJournal';

const { findEntryById, loadEntries } = useJournal();
const route = useRoute();

loadEntries();

const entryId = Number(route.params.id);
const entry = findEntryById(entryId);

definePageMeta({
  layout: 'journal',
});
</script>
