<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    class="w-full bg-transparent focus:outline-none text-2xl font-bold"
  />
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{ modelValue: string }>();
defineEmits(['update:modelValue']);
</script>