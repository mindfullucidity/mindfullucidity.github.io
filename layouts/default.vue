<script setup lang="ts">
import MobileNavbar from '~/components/mobile/Navbar.vue'
import DesktopNavbar from '~/components/desktop/Navbar.vue'
import TopBar from '~/components/mobile/TopBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const shouldShowMobileNavbar = computed(() => {
  return !['/', '/login', '/register', '/plus'].includes(route.path)
})
</script>

<template>
  <Title>MindfulLucidity | MindfulLucidity</Title>
  <div class="h-screen flex flex-col">
    <nav class="lg:hidden">
      <TopBar />
      <MobileNavbar v-if="shouldShowMobileNavbar" />
    </nav>
    <nav class="hidden lg:block">
      <DesktopNavbar />
    </nav>
    <main class="flex-grow overflow-y-auto pt-16" :class="{ 'pb-16': shouldShowMobileNavbar, 'lg:pb-0': true }">
      <slot />
    </main>
  </div>
</template>