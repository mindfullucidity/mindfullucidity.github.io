<template>
  <NuxtLayout name="default">
    <div class="relative flex h-full">
      <div class="relative z-10 border-r overflow-y-auto w-[24rem]">
        <JournalSidebar />
      </div>
      <div class="relative z-10 flex-grow overflow-y-auto">
        <NuxtPage />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import JournalSidebar from '~/components/journal/sidebar/JournalSidebar.vue';
</script>
