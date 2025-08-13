<script setup lang="ts">
import { ref, watch, useSlots } from 'vue'
import { marked } from 'marked'

const renderedHtml = ref('')
const slots = useSlots()

watch(() => slots.default ? slots.default()[0]?.children : '', (newContent) => {
  renderedHtml.value = marked(newContent || '')
}, { immediate: true })
</script>

<template>
  <div v-html="renderedHtml"></div>
</template>

<style>
h3 {
  margin-top: 0.5rem !important; /* mt-2 */
}

h2 {
  margin-top: 1rem !important;
}
</style>
