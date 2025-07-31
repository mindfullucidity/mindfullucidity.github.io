<template>
  <div class="flex flex-col h-full">
    <div class="p-4">
      <div class="flex items-center gap-2">
        <div class="relative flex-grow">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search absolute left-2 top-2.5 size-4 text-muted-foreground">
            <path d="m21 21-4.34-4.34"></path>
            <circle cx="11" cy="11" r="8"></circle>
          </svg>
          <Input class="pl-8" placeholder="Search" v-model="searchQuery" />
        </div>
        <Button variant="ghost" size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-2 p-4">
      <JournalEntryCard 
        v-for="entry in filteredEntries" 
        :key="entry.id" 
        :entry="entry"
        :selected="selectedEntry && selectedEntry.id === entry.id"
        @click="selectEntry(entry)" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import JournalEntryCard from './JournalEntryCard.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJournal } from '@/composables/useJournal';

const { entries, selectedEntry, loadEntries, selectEntry } = useJournal();
const searchQuery = ref('');

onMounted(() => {
  loadEntries();
});

const filteredEntries = computed(() => {
  if (!entries.value) {
    return [];
  }
  if (!searchQuery.value) {
    return entries.value;
  }
  return entries.value.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>
