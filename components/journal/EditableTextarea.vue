<template>
  <textarea
    ref="textarea"
    :value="modelValue"
    @input="handleInput"
    class="w-full bg-transparent focus:outline-none resize-none overflow-hidden"
  ></textarea>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(['update:modelValue']);

const textarea = ref<HTMLTextAreaElement | null>(null);

const adjustHeight = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
};

const handleInput = (event: Event) => {
  adjustHeight();
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

onMounted(() => {
  adjustHeight();
});

watch(() => props.modelValue, () => {
  // Use nextTick to ensure the DOM has updated with the new modelValue
  // before we try to calculate the new height.
  nextTick(() => {
    adjustHeight();
  });
});
</script>
