<template>
  <button 
    class="w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
    :class="{ 'bg-accent': selected }"
  >
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center">
        <div class="flex items-center gap-2">
          <div class="font-semibold">{{ entry.title }}</div>
        </div>
        <div class="ml-auto text-xs text-foreground">{{ entry.date }}</div>
      </div>
    </div>
    <div class="line-clamp-2 text-xs text-muted-foreground">
      {{ entry.description }}
    </div>
  </button>
</template>

<script setup lang="ts">

defineProps({
  entry: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});
</script>

