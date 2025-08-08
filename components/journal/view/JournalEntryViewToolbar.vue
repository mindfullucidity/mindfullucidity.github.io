<template>
  <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': isEnhancingEntry || isLoadingEntry || !isContentReady }">
    <div class="flex items-center">
      <Button variant="ghost" size="icon" class="lg:hidden mr-2" @click="navigateTo('/journal')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <TabsList>
        <TabsTrigger value="entry">Entry</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
    </div>
    <div class="flex h-5 items-center space-x-1 text-sm">
      <Button v-if="activeTab === 'entry' || activeTab === 'details'" variant="ghost" size="icon" @click="emit('enhanceEntry')" :disabled="isEnhancingEntry">
        <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
      </Button>
      <Separator v-if="activeTab === 'entry' || activeTab === 'details'" orientation="vertical" class="mx-2" />
      <Button v-if="!isNewEntry" variant="ghost" size="icon" @click="emit('deleteEntryAndNavigate')">
        <Trash2 class="w-4 h-4 text-red-400" />
      </Button>
      <template v-if="hasUnsavedChanges || isNewEntry">
        <Separator v-if="!isNewEntry" orientation="vertical" class="mx-2 hidden lg:block" />
        <Button variant="ghost" size="icon" @click="emit('cancelEdit')" class="hidden lg:inline-flex">
          <X class="w-4 h-4 text-red-400" />
        </Button>
        <Button variant="ghost" size="icon" @click="emit('saveEntry')" :disabled="isSavingEntry" class="hidden lg:inline-flex">
          <Check class="w-4 h-4" />
        </Button>
      </template>
    </div>
  </div>
  <FloatingActionButtonSection v-if="hasUnsavedChanges || isNewEntry" class="lg:hidden  mb-16">
    <FloatingActionButton @click="emit('cancelEdit')" class="bg-red-400/90">
      <X class="w-6 h-6" />
    </FloatingActionButton>
    <FloatingActionButton @click="emit('saveEntry')" :disabled="isSavingEntry" class="bg-green-400/90">
      <Check class="w-6 h-6" />
    </FloatingActionButton>
  </FloatingActionButtonSection>
</template>

<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, X, Check, Trash2, ArrowLeft } from 'lucide-vue-next';
import { navigateTo } from '#imports';
import FloatingActionButtonSection from '~/components/journal/misc/FloatingActionButtonSection.vue';
import FloatingActionButton from '~/components/journal/misc/FloatingActionButton.vue';

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
