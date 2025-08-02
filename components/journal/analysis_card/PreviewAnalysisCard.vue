<script setup lang="ts">
import { Sparkle, User, Pencil, Trash2, ChevronDown } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ref, computed } from 'vue'
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  analysisId: number;
  type: 'ai' | 'personal'
  title: string
  content: string;
  showActions?: boolean; // New prop
}>()

const emit = defineEmits(['delete', 'edit']);

const isOpen = ref(true)

const handleDelete = () => {
  emit('delete', props.analysisId);
};

const handleEdit = () => {
  emit('edit', props.analysisId);
};

const renderedContent = computed(() => {
  let content = props.content;
  const html = marked.parse(content, { breaks: true, gfm: true });
  return DOMPurify.sanitize(html);
});
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
              <User v-if="props.type === 'personal'" class="h-3 w-3 text-blue-200" aria-hidden="true" />
              <Sparkle v-else-if="props.type === 'ai'" class="h-3 w-3" aria-hidden="true" stroke="url(#sparkle-gradient)" />
              <span class="pt-1" :class="props.type === 'ai' ? 'bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text' : 'text-blue-200'">{{ props.type === 'personal' ? 'Your Analysis' : 'AI Analysis' }}</span>
            </div>
            <CardTitle class="font-medium">{{ props.title }}</CardTitle>
          </div>
          <div v-if="props.showActions" class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="h-8 w-8 text-red-400 hover:text-red-400" @click="handleDelete">
              <Trash2 class="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button v-if="props.type === 'personal'" variant="ghost" size="icon" class="h-8 w-8" @click="handleEdit">
              <Pencil class="h-4 w-4" aria-hidden="true" />
            </Button>
            <CollapsibleTrigger as-child>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <ChevronDown :class="isOpen ? 'rotate-180' : ''" class="h-4 w-4 transition-transform" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <div v-else class="flex items-center gap-2">
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
          <div class="prose prose-sm dark:prose-invert max-w-none" v-html="renderedContent"></div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
</template>
