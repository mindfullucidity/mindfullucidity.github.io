<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Markdown from '@/components/Markdown.vue';

const termsMarkdown = ref('');

definePageMeta({
  layout: 'documents',
});

onMounted(async () => {
  try {
    const response = await fetch('/TERMS_OF_SERVICE.md');
    termsMarkdown.value = await response.text();
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    termsMarkdown.value = 'Error loading Terms of Service.';
  }
});
</script>

<template>
  <div class="container mx-auto px-4 prose dark:prose-invert max-w-4xl">
    <Markdown>{{ termsMarkdown }}</Markdown>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>