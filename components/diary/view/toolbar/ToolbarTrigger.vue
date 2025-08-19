<script setup lang="ts">
import { inject } from 'vue';
import { TabsTrigger } from '@/components/ui/tabs';

const props = defineProps<{
  value: string;
}>();

const activeTab = inject('activeTab');
</script>

<template>
  <TabsTrigger :value="value">
    <slot />
  </TabsTrigger>
</template>
