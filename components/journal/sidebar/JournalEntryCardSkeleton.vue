<template>
  <div class="w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all  max-w-lg lg:max-w-full">
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center">
        <div class="font-semibold w-2/4">
          <Skeleton class="h-4 w-full" />
        </div>
        <div class="ml-auto text-xs w-1/4">
          <Skeleton class="h-4 w-full" />
        </div>
      </div>
    </div>
    <div class="line-clamp-2 text-xs text-muted-foreground w-full">
      <Skeleton class="h-10 w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
</script>
