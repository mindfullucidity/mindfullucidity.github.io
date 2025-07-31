<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0">
      <Button v-if="entry" variant="ghost" size="icon" @click="navigateTo(`/journal/${entry.id}/edit`)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      </Button>
    </div>
    <Separator />
    <div class="p-8 overflow-y-auto">
      <div v-if="entry">
        <h1 class="text-2xl font-bold">{{ entry.title }}</h1>
        <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <CalendarIcon class="h-4 w-4 translate-y-[-1px]" />
          <p>{{ entry.date }}</p>
        </div>
        <div class="mt-4">{{ entry.content }}</div>
      </div>
      <div v-else>
        <h1 class="text-2xl font-bold">Select a journal entry</h1>
        <p class="text-muted-foreground">Choose an entry from the sidebar to view its contents.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournal } from '@/composables/useJournal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon } from 'lucide-vue-next';

const props = defineProps<{ entry: any }>();
</script>
