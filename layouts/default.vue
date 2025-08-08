<script setup lang="ts">
import MobileNavbar from '~/components/mobile/Navbar.vue'
import DesktopNavbar from '~/components/desktop/Navbar.vue'
</script>

<template>
  <Title>MindfulLucidity | MindfulLucidity</Title>
  <div class="h-screen flex flex-col">
    <nav class="lg:hidden">
      <MobileNavbar />
    </nav>
    <nav class="hidden lg:block">
      <DesktopNavbar />
    </nav>
    <main class="flex-grow overflow-y-auto pt-0 lg:pt-16 pb-16 lg:pb-0">
      <slot />
    </main>
  </div>
</template>