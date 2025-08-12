<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { marked } from 'marked';

const termsMarkdown = ref('');
const termsHtml = ref('');

definePageMeta({
  layout: 'default',
});

onMounted(async () => {
  try {
    const response = await fetch('/TERMS_OF_SERVICE.md');
    termsMarkdown.value = await response.text();
    termsHtml.value = marked(termsMarkdown.value);
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    termsHtml.value = '<p>Error loading Terms of Service.</p>';
  }
});
</script>

<template>
  <Title>Terms of Service</Title>
  <div class="container mx-auto px-4 py-8 prose dark:prose-invert max-w-4xl">
    <div v-html="termsHtml"></div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>