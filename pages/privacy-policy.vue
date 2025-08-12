<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { marked } from 'marked';

const privacyMarkdown = ref('');
const privacyHtml = ref('');

definePageMeta({
  layout: 'default',
});

onMounted(async () => {
  try {
    const response = await fetch('/PRIVACY_POLICY.md');
    privacyMarkdown.value = await response.text();
    privacyHtml.value = marked(privacyMarkdown.value);
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    privacyHtml.value = '<p>Error loading Privacy Policy.</p>';
  }
});
</script>

<template>
  <Title>Privacy Policy</Title>
  <div class="container mx-auto px-4 py-8 prose dark:prose-invert max-w-4xl">
    <div v-html="privacyHtml"></div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>