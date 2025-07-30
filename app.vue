<script setup lang="ts">
const { isMobile } = useDevice()
</script>

<template>
  <div>
    <NuxtPage />
    <nav v-if="isMobile">
      <MobileNavbar />
    </nav>
    <nav v-else>
      <DesktopNavbar />
    </nav>
  </div>
</template>