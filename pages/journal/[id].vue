<script setup lang="ts">
import { View } from '@/components/diary/view'
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';

definePageMeta({
  layout: 'diary',
});

const route = useRoute();
const activeStore = useDiaryViewActiveStore();

onMounted(() => {
  const journalId = Number(route.params.id);
  if (!isNaN(journalId)) {
    activeStore.loadJournal(journalId);
  }
});
</script>

<template>
    <View/>
</template>