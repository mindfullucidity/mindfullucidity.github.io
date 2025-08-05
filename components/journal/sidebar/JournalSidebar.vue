<template>
  <div class="flex flex-col h-full">
    <div class="flex-shrink-0">
      <div class="flex items-center p-4 h-12">
        <h1 class="text-xl  font-semibold">Journal</h1>
      </div>
      <Separator />
      <div class="p-4">
        <div class="flex items-center gap-2">
          <div class="relative flex-grow">
            <Search class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input class="pl-8" placeholder="Search" v-model="searchQuery" />
          </div>
          <Button variant="ghost" size="icon" @click="navigateTo('/journal/new')">
            <Plus class="lucide lucide-plus" />
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
            <SearchX class="h-8 w-8 mb-2" />
            <p>No results found.</p>
          </div>
        </template>
        <template v-else-if="filteredEntries.length === 0 && !searchQuery">
          <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText class="h-8 w-8 mb-2" />
            <p>No entries yet. Start by creating a new one!</p>
          </div>
        </template>
        <template v-else>
          <JournalEntryCard 
            v-for="entry in filteredEntries" 
            :key="entry.journal_id" 
            :entry="entry"
            :selected="selectedEntry && selectedEntry.journal_id === entry.journal_id"
            @click="navigateTo(`/journal/${entry.journal_id}${route.hash}`)" 
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import JournalEntryCard from '../sidebar/JournalEntryCard.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJournal } from '@/composables/useJournal';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, SearchX, FileText } from 'lucide-vue-next';
import JournalEntryCardSkeleton from '../sidebar/JournalEntryCardSkeleton.vue';
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
      const entryOverview = entriesOverview.value?.find(e => e.journal_id === entryId);
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

  let filtered = entriesOverview.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    filtered = entriesOverview.value.filter((entry: JournalEntryOverview) => {
      const entryDate = new Date(entry.date);

      // Check for 'today'
      if ('today'.includes(query) &&
          entryDate.getDate() === today.getDate() &&
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear()) {
        return true;
      }

      // Check for 'last night' (assuming last night means yesterday's date)
      if ('last night'.includes(query) &&
          entryDate.getDate() === yesterday.getDate() &&
          entryDate.getMonth() === yesterday.getMonth() &&
          entryDate.getFullYear() === yesterday.getFullYear()) {
        return true;
      }

      // Check for specific date format (e.g., YYYY-MM-DD)
      if (!isNaN(Date.parse(query)) && entry.date === query) {
        return true;
      }

      // Existing title and description search
      return entry.title.toLowerCase().includes(query) ||
             entry.description.toLowerCase().includes(query);
    });
  }

  return filtered.sort((a, b) => {
    // Sort by date in descending order
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;

    // If dates are the same, sort by id in descending order
    return b.journal_id - a.journal_id;
  });
});
</script>
