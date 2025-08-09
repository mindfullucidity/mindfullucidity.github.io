<template>
  <div class="flex flex-col h-full">
    <div class="flex-shrink-0">
      <div class="lg:flex items-center p-4 h-12 hidden">
        <h1 class="text-xl  font-semibold">Journal</h1>
      </div>
      <Separator class="hidden lg:block"/>
      <div class="p-4">
        <div class="flex   items-center justify-center  gap-2">
          <div class="relative flex-grow lg:max-w-full max-w-lg">
            <Search class="absolute left-2 top-2.5 size-4 text-muted-foreground " />
            <Input class="pl-8 " placeholder="Search" v-model="searchQuery" />
          </div>
          <Button variant="ghost" size="icon" @click="navigateTo('/journal/new')" class="hidden lg:inline-flex">
            <Plus class="lucide lucide-plus" />
          </Button>
        </div>
      </div>
      <Separator class="hidden lg:block"/>
    </div>
    <ScrollArea class="flex-grow overflow-y-auto">
      <div class="flex flex-col items-center lg:items-stretch gap-2 px-4 pb-4 pt-0 lg:pt-4">
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
    </ScrollArea>
    <FloatingActionButtonSection class="lg:hidden mb-16">
      <FloatingActionButton @click="navigateTo('/journal/new')" class="bg-primary">
        <Plus class="w-6 h-6" />
      </FloatingActionButton>
    </FloatingActionButtonSection>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import JournalEntryCard from '../sidebar/JournalEntryCard.vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useJournal } from '@/composables/useJournal.ts';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, SearchX, FileText } from 'lucide-vue-next';
import JournalEntryCardSkeleton from '../sidebar/JournalEntryCardSkeleton.vue';
import type { JournalEntryOverview } from '@/composables/useJournal';
import { ScrollArea } from '@/components/ui/scroll-area';
import FloatingActionButtonSection from '~/components/journal/misc/FloatingActionButtonSection.vue';
import FloatingActionButton from '~/components/journal/misc/FloatingActionButton.vue';
import { navigateTo } from '#imports';
import { parseISO, isSameDay, subDays, addDays, format } from 'date-fns';

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
  const query = searchQuery.value.toLowerCase().trim();
  
  

  if (query) {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const tomorrow = addDays(today, 1);

    let parsedDate: Date | null = null;

    // --- Existing Date Parsing Logic ---
    // Try to parse as a specific date (e.g., YYYY-MM-DD, MM/DD/YYYY)
    if (!isNaN(Date.parse(query))) {
      parsedDate = new Date(query);
    }

    // Try to parse common date formats
    const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MMM dd, yyyy', 'MMMM dd, yyyy'];
    for (const formatStr of dateFormats) {
      try {
        const parsed = parse(query, formatStr, new Date());
        if (!isNaN(parsed.getTime())) {
          parsedDate = parsed;
          break;
        }
      } catch (e) {
        // Ignore parsing errors, try next format
      }
    }

    // Handle keywords
    if (query.includes('today')) {
      parsedDate = today;
    } else if (query.includes('yesterday') || query.includes('last night')) {
      parsedDate = yesterday;
    } else if (query.includes('tomorrow')) {
      parsedDate = tomorrow;
    }

    // --- Month Name Parsing Logic ---
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const shortMonthNames = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];

    let matchingMonthIndices: number[] = [];
    for (let i = 0; i < monthNames.length; i++) {
      if (monthNames[i].includes(query) || shortMonthNames[i].includes(query)) {
        matchingMonthIndices.push(i);
      }
    }

    

    // This is the corrected month search block
    if (matchingMonthIndices.length > 0) {
      
      const monthFilteredEntries = entriesOverview.value.filter((entry: JournalEntryOverview) => {
        const entryDate = parseISO(entry.date);
        const entryMonth = entryDate.getMonth(); // 0-indexed

        if (matchingMonthIndices.includes(entryMonth)) {
          const yearMatch = query.match(/\b(\d{4})\b/);
          if (yearMatch) {
            const searchYear = parseInt(yearMatch[1], 10);
            return entryDate.getFullYear() === searchYear;
          }
          return true;
        }
        return false;
      });

      if (monthFilteredEntries.length > 0) {
        
        return monthFilteredEntries.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA < dateB) return 1;
          if (dateB < dateA) return -1;
          return b.journal_id - a.journal_id;
        });
      } else {
        
      }
    } else {
      
    }

    // --- Main Filtering Logic (now also a fallback for month search with no results) ---
    filtered = entriesOverview.value.filter((entry: JournalEntryOverview) => {
      const entryDate = parseISO(entry.date);

      // If a specific date was parsed from the query, prioritize date matching
      if (parsedDate && isSameDay(entryDate, parsedDate)) {
        
        const nonDateQuery = query.replace(/today|yesterday|last night|tomorrow|\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4}|\w{3} \d{2}, \d{4}|\w+ \d{2}, \d{4}/g, '').trim();
        if (nonDateQuery) {
          
          const regex = new RegExp(nonDateQuery, 'i');
          return regex.test(entry.title) || regex.test(entry.description);
        }
        return true;
      }

      // Fallback to title and description search if no date was parsed or matched
      
      const regex = new RegExp(query, 'i');
      const matches = regex.test(entry.title) || regex.test(entry.description);
      
      return matches;
    });
  }

  
  return filtered.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) return 1;
    if (dateB < dateA) return -1;
    return b.journal_id - a.journal_id;
  });
});
</script>