<template>
  <JournalEntryMerge :entryId="null" :isNewEntry="true" />
</template>

<script setup lang="ts">
import JournalEntryMerge from '@/components/journal/JournalEntryMerge.vue';
import { useJournal } from '@/composables/useJournal';

const { clearSelectedEntry } = useJournal();
clearSelectedEntry();

definePageMeta({
  layout: 'journal',
});
</script>
