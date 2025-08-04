<template>
  <button 
    class="w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
    :class="{ 'bg-accent': selected }"
  >
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <div class="font-semibold">{{ displayTitle }}</div>
        </div>
        <div v-if="entry.title" class="ml-auto text-xs text-foreground whitespace-nowrap">{{ formattedDate }}</div>
      </div>
    </div>
    <div class="line-clamp-2 text-xs text-muted-foreground">
      {{ entry.description }}
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { JournalEntryOverview } from '@/composables/useJournal';
import { formatDate } from '@/lib/utils';

interface Props {
  entry: JournalEntryOverview;
  selected?: boolean;
}

const props = defineProps<Props>();

const formattedDate = computed(() => {
  return formatDate(props.entry.date);
});

const displayTitle = computed(() => {
  return props.entry.title || formattedDate.value;
});
</script>

