<template>
  <div class="w-full mx-auto space-y-8">
    <!-- Lucidity Level Skeleton -->
    <div class="space-y-4">
      <Skeleton class="h-6 w-1/2" />
      <div class="flex justify-between gap-4">
        <div v-for="i in 4" :key="i" class="relative flex-1">
          <Skeleton class="w-full h-20 rounded-xl" />
        </div>
      </div>
      <Skeleton class="h-10 w-full mt-4" />
    </div>

    <!-- Mood Spectrum Skeleton -->
    <div class="space-y-4">
      <Skeleton class="h-6 w-1/2" />
      <div class="flex justify-between text-xs text-muted-foreground mt-2">
        <Skeleton class="h-4 w-1/4" />
        <Skeleton class="h-4 w-1/4" />
        <Skeleton class="h-4 w-1/4" />
      </div>
    </div>

    <!-- Characteristics Skeleton -->
    <div class="space-y-4">
      <Skeleton class="h-6 w-1/2" />
      <div class="grid grid-cols-2 gap-3">
        <div v-for="i in 4" :key="i">
          <Skeleton class="p-4 rounded-lg h-20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
</script>