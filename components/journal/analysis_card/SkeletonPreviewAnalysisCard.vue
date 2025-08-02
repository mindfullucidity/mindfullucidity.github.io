<script setup lang="ts">
import { X, Sparkle } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ref } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'

const emit = defineEmits(['cancel-generation']);

const isOpen = ref(true)

const handleCancel = () => {
  emit('cancel-generation');
};
</script>

<template>
  <Collapsible v-model:open="isOpen">
    <Card class="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm transition-all duration-200">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-card border"
            >
              <Sparkle class="h-3 w-3" aria-hidden="true" stroke="url(#sparkle-gradient)" />
              <span class="pt-1 bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text">AI Analysis</span>
            </div>
            <CardTitle class="font-medium">
                <Skeleton class="h-5 w-[150px]" />
            </CardTitle>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="h-8 w-8 text-red-400 hover:text-red-400" @click="handleCancel">
              <X class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CollapsibleContent>
        <CardContent class="pt-0">
          <div class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-[80%]" />
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
</template>
