<template>
  <JournalEntryView :entry-id="Number(route.params.id)" />
</template>

<script setup lang="ts">
import JournalEntryView from '@/components/journal/JournalEntryView.vue';

const route = useRoute();

definePageMeta({
  layout: 'journal',
});
</script>
