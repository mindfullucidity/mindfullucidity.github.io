<script setup lang="ts">
import { View } from '@/components/diary/view'
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';

definePageMeta({
  layout: 'diary',
});

const activeStore = useDiaryViewActiveStore();

onMounted(() => {
  activeStore.newJournal();
});
</script>

<template>
    <View/>
</template>