<template>
  <JournalEntryEdit :entry="newEntry" />
</template>

<script setup lang="ts">
import JournalEntryEdit from '@/components/journal/JournalEntryEdit.vue';
import { useJournal } from '@/composables/useJournal';
import { ref } from 'vue';

const { clearSelectedEntry } = useJournal();
clearSelectedEntry();

const newEntry = ref({
  title: '',
  content: '',
  date: new Date(new Date().setDate(new Date().getDate() - 1)),
});

definePageMeta({
  layout: 'journal',
});
</script>
