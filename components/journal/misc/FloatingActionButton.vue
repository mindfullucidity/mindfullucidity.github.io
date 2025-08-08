<template>
  <Button
    variant="secondary"
    size="icon"
    class="rounded-full h-14 w-14 shadow-lg"
    @click="$emit('click')"
  >
    <slot />
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';

defineEmits(['click']);
</script>
