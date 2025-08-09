<template>
  <NuxtLayout name="default">
    <Title>Journal | MindfulLucidity</Title>
    <div class="relative flex h-full">
      <div
        :class="[
          'relative z-10 border-r overflow-y-auto lg:w-[24rem] min-w-[24rem]',
          route.path === '/journal' ? 'block w-full' : 'hidden',
          'lg:block',
        ]"
      >
        <JournalSidebar />
      </div>
      <div
        :class="[
          'relative z-10 flex-grow overflow-y-auto',
          route.path === '/journal' ? 'hidden' : 'block',
          'lg:block',
        ]"
      >
        <NuxtPage />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import JournalSidebar from '~/components/journal/sidebar/JournalSidebar.vue';
import { useRoute } from '#imports';

const route = useRoute();
</script>
