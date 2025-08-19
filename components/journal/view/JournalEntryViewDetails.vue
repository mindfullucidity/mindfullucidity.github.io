<script setup lang="ts">
import { ref, watch } from 'vue';
import LucidityLevel from './details/LucidityLevel.vue';
import MoodSpectrum from './details/MoodSpectrum.vue';
import Characteristics from './details/Characteristics.vue';
import Symbols from './details/Symbols.vue';
import JournalEntryViewDetailsSkeleton from './JournalEntryViewDetailsSkeleton.vue';

import type { JournalEntry } from '@/composables/useJournal';

const props = defineProps({
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
  journalEntry: { type: Object as PropType<JournalEntry>, required: true },
});

const emit = defineEmits([
  'update:journalEntry',
]);

const contentReady = ref(false);
const componentsReady = ref(new Set<string>());
const totalComponents = 4; // LucidityLevel, MoodSpectrum, Characteristics, Symbols

const handleComponentReady = (componentName: string) => {
  componentsReady.value.add(componentName);
  if (componentsReady.value.size === totalComponents) {
    contentReady.value = true;
  }
};

// Reset contentReady when isLoadingEntry changes to true
watch(() => props.isLoadingEntry, (newVal) => {
  if (newVal) {
    contentReady.value = false;
    componentsReady.value.clear();
  }
});

</script>

<template>
  <div class="w-full mx-auto">
    <JournalEntryViewDetailsSkeleton v-show="!contentReady || props.isLoadingEntry" />
    <div v-show="contentReady && !props.isLoadingEntry" class=" space-y-8">
        <LucidityLevel
          :initial-lucidity-level="props.journalEntry.lucidity_level"
          :initial-lucidity-trigger="props.journalEntry.lucidity_trigger"
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
          @update:lucidity-level="(value) => emit('update:journalEntry', { ...props.journalEntry, lucidity_level: value })"
          @update:lucidity-trigger="(value) => emit('update:journalEntry', { ...props.journalEntry, lucidity_trigger: value })"
          @component-ready="() => handleComponentReady('LucidityLevel')"
        />

        <MoodSpectrum
          :initial-mood="props.journalEntry.mood"
          @update:mood="(value) => emit('update:journalEntry', { ...props.journalEntry, mood: value })"
          @component-ready="() => handleComponentReady('MoodSpectrum')"
        />

        <Characteristics
          :initial-characteristics="props.journalEntry.characteristics"
          @update:characteristics="(value) => emit('update:journalEntry', { ...props.journalEntry, characteristics: value })"
          @component-ready="() => handleComponentReady('Characteristics')"
        />

        <Symbols
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
          :journal-entry="props.journalEntry"
          @update:journal-entry="(value) => emit('update:journalEntry', value)"
          @component-ready="() => handleComponentReady('Symbols')"
        />
      </div>
  </div>
</template>


