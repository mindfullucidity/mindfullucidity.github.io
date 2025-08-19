<script setup lang="ts">
import LucidityLevel from './sections/LucidityLevel.vue';
import MoodSpectrum from './sections/MoodSpectrum.vue';
import Characteristics from './sections/Characteristics.vue';
import Symbols from './sections/Symbols.vue';
import DetailsSkeleton from './DetailsSkeleton.vue';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active'; // Assuming this path and store structure

const diaryStore = useDiaryViewActiveStore();

</script>

<template>
  <div class="w-full mx-auto max-w-4xl">
    <DetailsSkeleton v-show="!diaryStore.isLoaded" />
    <div v-show="diaryStore.isLoaded" class=" space-y-8">
        <LucidityLevel />
        <MoodSpectrum />
        <Characteristics />
        <Symbols />
      </div>
  </div>
</template>
