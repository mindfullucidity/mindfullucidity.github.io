<script setup lang="ts">
import MobileNavbar from '~/components/mobile/Navbar.vue'
import DesktopNavbar from '~/components/desktop/Navbar.vue'

const { isMobile } = useDevice()
</script>

<template>
  <div class="h-screen flex flex-col">
    <nav v-if="isMobile">
      <MobileNavbar />
    </nav>
    <nav v-else>
      <DesktopNavbar />
    </nav>
    <main class="flex-grow h-0">
      <slot />
    </main>
  </div>
</template>
