<script setup lang="ts">
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <Card class="w-full bg-transparent border-border transition-colors cursor-pointer mb-4">
    <CardHeader class="flex flex-row items-center justify-between pb-2">
      <Skeleton class="h-7 w-3/7" />
      <Skeleton class="h-5 w-1/6" />
    </CardHeader>
    <CardContent>
      <div class="space-y-2 mb-4">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-11/12" />
        <Skeleton class="h-4 w-10/12" />
      </div>
      <div class="flex justify-between items-end">
        <div class="flex flex-wrap gap-2">
          <Skeleton class="h-6 w-20 rounded-full" />
        </div>
        <Skeleton class="h-5 w-16" />
      </div>
    </CardContent>
  </Card>
</template>