<template>
  <div class="grid grid-cols-3 h-full">
    <div class="col-span-1 border-r overflow-y-auto">
      <JournalSidebar />
    </div>
    <div class="col-span-2 overflow-y-auto">
      <JournalEntryView />
    </div>
  </div>
</template>

<script setup lang="ts">
import JournalSidebar from '@/components/journal/JournalSidebar.vue';
import JournalEntryView from '@/components/journal/JournalEntryView.vue';
</script>
