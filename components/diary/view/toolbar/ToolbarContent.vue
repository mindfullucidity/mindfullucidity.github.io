<script setup lang="ts">
import { TabsContent } from '@/components/ui/tabs';

defineProps<{
  value: string;
}>();
</script>

<template>
  <TabsContent :value="value" class="p-6 overflow-y-auto flex-grow">
    <slot />
  </TabsContent>
</template>
