<script setup lang="ts">
import { Home, Book, Settings } from 'lucide-vue-next'

const route = useRoute()
</script>

<template>
  <div class="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
    <div class="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
      <NuxtLink
        to="/"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path === '/' }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path === '/' }">
          <Home class="w-5 h-5" />
        </div>
        <span class="text-sm">Home</span>
      </NuxtLink>
      <NuxtLink
        to="/journal"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path === '/journal' }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path === '/journal' }">
          <Book class="w-5 h-5" />
        </div>
        <span class="text-sm">Journal</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path === '/settings' }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path === '/settings' }">
          <Settings class="w-5 h-5" />
        </div>
        <span class="text-sm">Settings</span>
      </NuxtLink>
    </div>
  </div>
</template>
