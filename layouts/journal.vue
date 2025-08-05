<template>
  <NuxtLayout name="default">
    <div class="flex h-full">
      <div class="border-r overflow-y-auto w-[24rem]">
        <JournalSidebar />
      </div>
      <div class="flex-grow overflow-y-auto">
        <NuxtPage />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import JournalSidebar from '~/components/journal/sidebar/JournalSidebar.vue';
</script>
