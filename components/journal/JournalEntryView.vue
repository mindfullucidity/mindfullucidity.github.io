<template>
  <div class="p-8">
    <div v-if="selectedEntry">
      <h1 class="text-2xl font-bold">{{ selectedEntry.title }}</h1>
      <p class="text-sm text-muted-foreground mb-4">{{ selectedEntry.date }}</p>
      <p>{{ selectedEntry.description }}</p>
      <div class="mt-4">{{ selectedEntry.content }}</div>
    </div>
    <div v-else>
      <h1 class="text-2xl font-bold">Select a journal entry</h1>
      <p class="text-muted-foreground">Choose an entry from the sidebar to view its contents.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournal } from '@/composables/useJournal';

const { selectedEntry } = useJournal();
</script>
