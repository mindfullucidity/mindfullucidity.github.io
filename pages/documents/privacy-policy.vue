<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Markdown from '@/components/Markdown.vue';

const privacyMarkdown = ref('');

definePageMeta({
  layout: 'documents',
});

onMounted(async () => {
  try {
    const response = await fetch('/PRIVACY_POLICY.md');
    privacyMarkdown.value = await response.text();
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    privacyMarkdown.value = 'Error loading Privacy Policy.';
  }
});
</script>

<template>
  <div class="container mx-auto px-4 prose dark:prose-invert max-w-4xl">
    <Markdown>{{ privacyMarkdown }}</Markdown>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>