<template>
  <div class="flex flex-col h-full">
    <div class="flex-shrink-0">
      <div class="flex items-center p-4 h-12">
        <h1 class="text-xl font-bold">Journal</h1>
      </div>
      <Separator />
      <div class="p-4">
        <div class="flex items-center gap-2">
          <div class="relative flex-grow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search absolute left-2 top-2.5 size-4 text-muted-foreground">
              <path d="m21 21-4.34-4.34"></path>
              <circle cx="11" cy="11" r="8"></circle>
            </svg>
            <Input class="pl-8" placeholder="Search" v-model="searchQuery" />
          </div>
          <Button variant="ghost" size="icon" @click="navigateTo('/journal/new')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </Button>
        </div>
      </div>
      <Separator />
    </div>
    <div class="flex-grow overflow-y-auto">
      <div class="flex flex-col gap-2 p-4">
        <template v-if="isLoadingOverview || entriesOverview === null">
          <JournalEntryCardSkeleton v-for="i in 3" :key="i" />
        </template>
        <template v-else-if="filteredEntries.length === 0 && searchQuery">
          <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-x h-8 w-8 mb-2"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <p>No results found.</p>
          </div>
        </template>
        <template v-else-if="filteredEntries.length === 0 && !searchQuery">
          <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text h-8 w-8 mb-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            <p>No entries yet. Start by creating a new one!</p>
          </div>
        </template>
        <template v-else>
          <JournalEntryCard 
            v-for="entry in filteredEntries" 
            :key="entry.id" 
            :entry="entry"
            :selected="selectedEntry && selectedEntry.id === entry.id"
            @click="navigateTo(`/journal/${entry.id}`)" 
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import JournalEntryCard from './JournalEntryCard.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJournal } from '@/composables/useJournal';
import { Separator } from '@/components/ui/separator';
import { useRoute } from 'vue-router';
import JournalEntryCardSkeleton from './JournalEntryCardSkeleton.vue';
import type { JournalEntryOverview } from '@/composables/useJournal';

const { entriesOverview, selectedEntry, isLoadingOverview, loadEntriesOverview, selectEntry, clearSelectedEntry } = useJournal();
const searchQuery = ref('');
const route = useRoute();

onMounted(() => {
  loadEntriesOverview();
});

watch(() => route.path, async (newPath) => {
  if (newPath === '/journal') {
    clearSelectedEntry();
  } else if (newPath.startsWith('/journal/')) {
    const entryId = Number(newPath.split('/').pop());
    if (!isNaN(entryId)) {
      const entryOverview = entriesOverview.value.find(e => e.id === entryId);
      if (entryOverview) {
        await selectEntry(entryOverview);
      }
    }
  }
}, { immediate: true });

const filteredEntries = computed(() => {
  if (!entriesOverview.value) {
    return [];
  }
  if (!searchQuery.value) {
    return entriesOverview.value;
  }
  return entriesOverview.value.filter((entry: JournalEntryOverview) =>
    entry.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>
