<template>
    <div class="p-8 overflow-y-auto">
      <Skeleton class="h-8 w-3/4 mb-4" />
      <Skeleton class="h-4 w-1/4 mb-8" />
      <Skeleton class="h-48 w-full" />
    </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
</script>