<script setup lang="ts">
import { NuxtLink } from '#components'
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  id: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    required: true,
  },
  staticColor: {
    type: String,
    default: '',
  },
  activeSection: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="w-full inline-flex items-center justify-between px-3 py-1 rounded-lg text-sm font-medium transition-colors"
    :class="[
      activeSection === id && id !== 'plus' ? 'text-primary' : '',
      staticColor ? `!${staticColor}` : '',
      activeSection === id ? 'bg-muted' : 'hover:bg-muted',
    ]"
  >
    <div class="flex items-center space-x-3">
      <component :is="icon" class="h-4 w-4 mr-3" />
      <slot />
    </div>
    <div class="flex items-center space-x-2">
      <ChevronRight class="h-3 w-3" />
    </div>
  </NuxtLink>
</template>
