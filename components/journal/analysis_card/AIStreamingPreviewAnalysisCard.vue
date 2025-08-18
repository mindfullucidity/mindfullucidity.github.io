<script setup lang="ts">
import { X, Sparkle, User, ChevronDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ref, watch, computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import Markdown from '@/components/Markdown.vue'

const props = defineProps<{
  type: 'ai' | 'personal' | null;
  title: string | null;
  textChunks: string[];
  isStreaming: boolean;
}>();

const emit = defineEmits(['cancel-generation']);

const isOpen = ref(true);
const hasInitialContent = ref(false);

// Concatenate chunks for the final content to be emitted
const fullContent = computed(() => props.textChunks.join(''));

watch(() => props.textChunks.length, (newLength) => {
  if (newLength > 0 && !hasInitialContent.value) {
    hasInitialContent.value = true;
  }
}, { immediate: true });

const handleCancel = () => {
  emit('cancel-generation');
};
</script>

<template>
  <Collapsible v-model:open="isOpen">
    <Card class="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm transition-all duration-200">
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex flex-wrap items-start gap-3 flex-grow">
            <div
              class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-card border"
            >
              <template v-if="props.type === 'personal'">
                <User class="h-3 w-3 text-blue-200" aria-hidden="true" />
                <span class="pt-1 text-blue-200">Your Analysis</span>
              </template>
              <template v-else-if="props.type === 'ai'">
                <Sparkle class="h-3 w-3" aria-hidden="true" stroke="url(#sparkle-gradient)" />
                <span class="pt-1 bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text">AI Analysis</span>
              </template>
              <template v-else>
                <Skeleton class="h-3 w-3 rounded-full" />
                <Skeleton class="h-3 w-20" />
              </template>
            </div>
            <CardTitle class="font-medium  flex-grow min-w-0 truncate">
                <template v-if="props.title">
                  {{ props.title }}
                </template>
                <template v-else>
                  <Skeleton class="h-5 w-[150px]" />
                </template>
            </CardTitle>
          </div>
          <div class="flex items-center gap-2">
            <Button v-if="props.isStreaming" variant="ghost" size="icon" class="h-8 w-8 text-red-400 hover:text-red-400" @click="handleCancel">
              <X class="h-4 w-4" aria-hidden="true" />
            </Button>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <ChevronDown :class="isOpen ? 'rotate-180' : ''" class="h-4 w-4 transition-transform" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CardHeader>
      <CollapsibleContent>
        <CardContent class="pt-0">
          <div v-if="!hasInitialContent" class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-[80%]" />
          </div>
          <div v-else class="prose prose-sm dark:prose-invert max-w-none">
            <Markdown>{{ fullContent }}</Markdown>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
</template>