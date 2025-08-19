<script setup lang="ts">
import { ref, watch } from 'vue';
import LucidityLevel from './details/LucidityLevel.vue';
import MoodSpectrum from './details/MoodSpectrum.vue';
import Characteristics from './details/Characteristics.vue';
import Symbols from './details/Symbols.vue';
import JournalEntryViewDetailsSkeleton from './JournalEntryViewDetailsSkeleton.vue';

const props = defineProps({
  initialLucidityLevel: { type: Number, default: 0 },
  initialLucidityTrigger: { type: String, default: '' },
  initialMood: { type: Number as PropType<number | null>, default: 50 },
  initialCharacteristics: { type: Array as () => string[], default: () => [] },
  initialSymbolIds: { type: Array as PropType<number[]>, default: () => [] },
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:lucidityLevel',
  'update:lucidityTrigger',
  'update:mood',
  'update:characteristics',
  'update:symbolIds',
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
          :initial-lucidity-level="props.initialLucidityLevel"
          :initial-lucidity-trigger="props.initialLucidityTrigger"
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
          @update:lucidity-level="(value) => emit('update:lucidityLevel', value)"
          @update:lucidity-trigger="(value) => emit('update:lucidityTrigger', value)"
          @component-ready="() => handleComponentReady('LucidityLevel')"
        />

        <MoodSpectrum
          :initial-mood="props.initialMood"
          @update:mood="(value) => emit('update:mood', value)"
          @component-ready="() => handleComponentReady('MoodSpectrum')"
        />

        <Characteristics
          :initial-characteristics="props.initialCharacteristics"
          @update:characteristics="(value) => emit('update:characteristics', value)"
          @component-ready="() => handleComponentReady('Characteristics')"
        />

        <Symbols
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
          :initial-symbol-ids="props.initialSymbolIds"
          @update:symbol-ids="(value) => emit('update:symbolIds', value)"
          @component-ready="() => handleComponentReady('Symbols')"
        />
      </div>
  </div>
</template>


