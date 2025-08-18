<script setup lang="ts">
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
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:lucidityLevel',
  'update:lucidityTrigger',
  'update:mood',
  'update:characteristics',
]);

</script>

<template>
  <div class="w-full mx-auto space-y-8">
    <JournalEntryViewDetailsSkeleton v-if="isLoadingEntry || initialLucidityLevel === null" />
    <div v-else>
      <div class="w-full mx-auto space-y-8">
        <LucidityLevel
          :initial-lucidity-level="props.initialLucidityLevel"
          :initial-lucidity-trigger="props.initialLucidityTrigger"
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
          @update:lucidity-level="(value) => emit('update:lucidityLevel', value)"
          @update:lucidity-trigger="(value) => emit('update:lucidityTrigger', value)"
        />

        <MoodSpectrum
          :initial-mood="props.initialMood"
          @update:mood="(value) => emit('update:mood', value)"
        />

        <Characteristics
          :initial-characteristics="props.initialCharacteristics"
          @update:characteristics="(value) => emit('update:characteristics', value)"
        />

        <Symbols
          :is-loading-entry="props.isLoadingEntry"
          :is-enhancing-details="props.isEnhancingDetails"
        />
      </div>
    </div>
  </div>
</template>


