<template>
  <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isEnhancingEntry || isLoadingEntry || !isContentReady }">
    <TabsList>
      <TabsTrigger value="entry">Entry</TabsTrigger>
      <TabsTrigger value="analysis">Analysis</TabsTrigger>
      <TabsTrigger value="details">Details</TabsTrigger>
    </TabsList>
    <div class="flex h-5 items-center space-x-1 text-sm">
      <Button v-if="activeTab === 'entry'" variant="ghost" size="icon" @click="emit('enhanceEntry')" :disabled="isEnhancingEntry">
        <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
      </Button>
      <Separator v-if="activeTab === 'entry'" orientation="vertical" class="mx-2" />
      <Button v-if="!isNewEntry" variant="ghost" size="icon" @click="emit('deleteEntryAndNavigate')">
        <Trash2 class="w-4 h-4 text-red-400" />
      </Button>
      <template v-if="hasUnsavedChanges || isNewEntry">
        <Separator v-if="!isNewEntry" orientation="vertical" class="mx-2" />
        <Button variant="ghost" size="icon" @click="emit('cancelEdit')">
          <X class="w-4 h-4 text-red-400" />
        </Button>
        <Button variant="ghost" size="icon" @click="emit('saveEntry')" :disabled="isSavingEntry">
          <Check class="w-4 h-4" />
        </Button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, X, Check, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  activeTab: string;
  isEnhancingEntry: boolean;
  isLoadingEntry: boolean;
  isContentReady: boolean;
  isNewEntry: boolean;
  hasUnsavedChanges: boolean;
  isSavingEntry: boolean;
}>();

const emit = defineEmits([
  'update:activeTab',
  'enhanceEntry',
  'deleteEntryAndNavigate',
  'cancelEdit',
  'saveEntry',
]);

watch(() => props.activeTab, (newVal) => {
  emit('update:activeTab', newVal);
});
</script>
