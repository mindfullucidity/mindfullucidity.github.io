<template>
  <JournalEntryEdit :entry="newEntry" />
</template>

<script setup lang="ts">
import JournalEntryEdit from '@/components/journal/JournalEntryEdit.vue';
import { useJournal } from '@/composables/useJournal';
import { ref } from 'vue';

const { loadEntries, clearSelectedEntry } = useJournal();

loadEntries();
clearSelectedEntry();

const newEntry = ref({
  title: '',
  content: '',
  date: new Date(),
});

definePageMeta({
  layout: 'journal',
});
</script>
