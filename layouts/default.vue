<script setup lang="ts">
import MobileNavbar from '~/components/mobile/Navbar.vue'
import DesktopNavbar from '~/components/desktop/Navbar.vue'
import TopBar from '~/components/mobile/TopBar.vue'
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue' // Import ref and watch
import { useNuxtApp } from '#app'
import { useMediaQuery } from '@vueuse/core'

const route = useRoute()
const { $pwa } = useNuxtApp()
const isLessThanLg = useMediaQuery('(max-width: 1023px)')

const shouldShowMobileNavbar = computed(() => {
  return !(['/login', '/register'].includes(route.path)) && ((!['/', '/plus'].includes(route.path)) || ($pwa?.isPWAInstalled && isLessThanLg.value))
})

const mainContentRef = ref<HTMLElement | null>(null) // Create a ref for the main content area

// Watch for route changes and scroll to top
watch(() => route.path, () => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollTop = 0
  }
})
</script>

<template>
  <Title>MindfulLucidity | MindfulLucidity</Title>
  <div class="h-screen flex flex-col">
    <nav class="lg:hidden">
      <TopBar v-if="!['/login', '/register'].includes(route.path)" />
      <MobileNavbar v-if="shouldShowMobileNavbar" />
    </nav>
    <nav class="hidden lg:block">
      <DesktopNavbar />
    </nav>
    <main ref="mainContentRef" class="flex-grow overflow-y-auto pt-16" :class="{ 'pb-16': shouldShowMobileNavbar, 'lg:pb-0': true }">
      <slot />
    </main>
  </div>
</template>