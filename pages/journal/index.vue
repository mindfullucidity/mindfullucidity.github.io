<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0">
    </div>
    <Separator />
    <div class="p-8" v-if="shouldShowPlaceholder">
        <h1 class="text-2xl font-bold">Select a journal entry</h1>
        <p class="text-muted-foreground">Choose an entry from the sidebar to view its contents.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Separator } from '@/components/ui/separator';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const shouldShowPlaceholder = computed(() => {
  return route.name === 'journal';
});

definePageMeta({
  layout: 'journal',
  middleware: ['auth'], 
});
</script>
