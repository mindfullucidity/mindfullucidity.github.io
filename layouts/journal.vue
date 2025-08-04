<template>
  <NuxtLayout name="default">
    <div class="flex h-full">
      <div class="border-r overflow-y-auto pt-16 max-w-sm">
        <JournalSidebar />
      </div>
      <div class="flex-grow overflow-y-auto pt-16">
        <NuxtPage />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import JournalSidebar from '@/components/journal/JournalSidebar.vue';
</script>
