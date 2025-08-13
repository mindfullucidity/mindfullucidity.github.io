<script setup lang="ts">
import { navigateTo } from '#app'

definePageMeta({
  layout: 'support',
});

// Redirect to contact_us when accessing /support
navigateTo('/support/contact_us')
</script>

<template>
  <div>
    <!-- This page will redirect -->
  </div>
</template>
