<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0">
      <Skeleton class="h-8 w-8 rounded-full" />
    </div>
    <Separator />
    <div class="p-8 overflow-y-auto">
      <Skeleton class="h-8 w-3/4 mb-4" />
      <Skeleton class="h-4 w-1/4 mb-8" />
      <Skeleton class="h-48 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
</script>
