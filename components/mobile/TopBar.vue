<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '#imports';
import { SunMoon, Crown, Home, LogIn } from 'lucide-vue-next';
import { useSupabaseUser } from '#imports';
import { Button } from '@/components/ui/button';
import { useNuxtApp } from '#app';

const route = useRoute();
const user = useSupabaseUser();
const { $pwa } = useNuxtApp();

const pageTitle = computed(() => {
  if (route.path.startsWith('/settings')) {
    return 'Settings';
  }
  if (route.path.startsWith('/journal')) {
    return 'Journal';
  }
  if (route.path.startsWith('/documents')) {
    return 'Documents';
  }

  const head = useHead();
  if (head.title && head.title.value) {
    const match = head.title.value.match(/^(.*?)(?: \| MindfulLucidity)?$/);
    return match ? match[1] : head.title.value;
  }

  if (route.name) {
    return String(route.name).charAt(0).toUpperCase() + String(route.name).slice(1);
  }
  return 'MindfulLucidity';
});
</script>

<template>
  <div class="fixed top-0 left-0 z-40 w-full bg-black/90 p-4 shadow-sm flex justify-between items-center">
    <NuxtLink to="/" class="text-lg font-bold inline-flex items-center justify-center gap-2">
      <SunMoon class="w-5 h-5 mb-1"/>
      MindfulLucidity
    </NuxtLink>
    <div class="flex items-center mr-4">
      <template v-if="route.path === '/' && !$pwa?.isPWAInstalled">
        <Button v-if="!user" size="sm" as-child>
          <NuxtLink to="/login">
            <LogIn class="w-4 h-4 mr-1" />
            Login
          </NuxtLink>
        </Button>
        <Button v-else size="sm" as-child>
          <NuxtLink to="/home">
            <Home class="w-4 h-4 mr-1" />
            Home
          </NuxtLink>
        </Button>
      </template>
      <h1 v-if="route.path !== '/'" class="text-xl font-bold text-right mr-4" :class="{ 'text-plus-gold': route.path === '/plus' }">
        <Crown v-if="route.path === '/plus'" class="w-5 h-5 mr-2 inline-block" />
        {{ pageTitle }}
      </h1>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>