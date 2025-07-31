<script setup lang="ts">
import MobileNavbar from '~/components/mobile/Navbar.vue'
import DesktopNavbar from '~/components/desktop/Navbar.vue'

const { isMobile } = useDevice()
</script>

<template>
  <div>
    <nav v-if="isMobile">
      <MobileNavbar />
    </nav>
    <nav v-else>
      <DesktopNavbar />
    </nav>
    <main class="pt-16">
      <slot />
    </main>
  </div>
</template>
