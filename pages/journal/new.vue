<template>
  <JournalEntryView :entryId="null" :isNewEntry="true" />
</template>

<script setup lang="ts">
import JournalEntryView from '~/components/journal/view/JournalEntryView.vue';
import { useJournal } from '@/composables/useJournal';

const { clearSelectedEntry } = useJournal();
clearSelectedEntry();

definePageMeta({
  layout: 'journal',
});
</script>
