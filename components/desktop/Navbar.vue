<script setup lang="ts">
import { Home, Book, Settings } from 'lucide-vue-next'

const route = useRoute()
</script>

<template>
  <div class="hidden md:block fixed top-0 left-0 z-50 w-full h-16 bg-background border-b">
    <div class="flex justify-between items-center h-full max-w-5xl mx-auto px-4 font-medium">
      <div class="flex items-center gap-x-4">
        <NuxtLink to="/" class="text-lg font-bold">
          Lucid Awakening
        </NuxtLink>
      </div>
      <div class="flex items-center gap-x-4">
        <NuxtLink
          to="/home"
          class="inline-flex items-center justify-center px-3 py-1 rounded-lg"
          :class="{ 'bg-primary/10 text-primary': route.path === '/home' }"
        >
          <Home v-if="route.path === '/home'" class="w-5 h-5 mr-2" />
          <span class="text-sm">Home</span>
        </NuxtLink>
        <NuxtLink
          to="/journal"
          class="inline-flex items-center justify-center px-3 py-1 rounded-lg"
          :class="{ 'bg-primary/10 text-primary': route.path === '/journal' }"
        >
          <Book v-if="route.path === '/journal'" class="w-5 h-5 mr-2" />
          <span class="text-sm">Journal</span>
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="inline-flex items-center justify-center px-3 py-1 rounded-lg"
          :class="{ 'bg-primary/10 text-primary': route.path === '/settings' }"
        >
          <Settings v-if="route.path === '/settings'" class="w-5 h-5 mr-2" />
          <span class="text-sm">Settings</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
