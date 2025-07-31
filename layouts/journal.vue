<template>
  <NuxtLayout name="default">
    <div class="grid grid-cols-3 h-full">
      <div class="col-span-1 border-r overflow-y-auto pt-16">
        <JournalSidebar />
      </div>
      <div class="col-span-2 overflow-y-auto pt-16">
        <NuxtPage />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import JournalSidebar from '@/components/journal/JournalSidebar.vue';
</script>
