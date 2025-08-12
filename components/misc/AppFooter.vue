<template>
  <footer class="w-full py-6">
    <div class="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
      <p>&copy; 2025 Mindful Lucidity. All rights reserved.</p>
      <nav class="flex gap-4 sm:gap-6 mt-4 md:mt-0">
        <NuxtLink to="/privacy-policy" class="hover:underline">Privacy Policy</NuxtLink>
        <NuxtLink to="/terms-of-service" class="hover:underline">Terms of Service</NuxtLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No script needed for this simple footer
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>