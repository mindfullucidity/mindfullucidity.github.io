<template>
  <div class="mx-auto max-w-4xl w-full">
    <EntrySkeleton v-if="!activeStore.isLoaded || activeStore.isEnhancing" />
    <div v-else>
      <EntryInput v-model="activeStore.current.entry.title" placeholder="Title" />
      <EntryDatePicker variant="plain" v-model="activeStore.current.entry.date" />
      <EntryTextarea v-model="activeStore.current.entry.content" placeholder="What did you dream about?" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EntrySkeleton from '~/components/diary/view/entry/EntrySkeleton.vue';
import EntryInput from '~/components/diary/view/entry/EntryInput.vue';
import EntryDatePicker from '~/components/diary/view/entry/EntryDatePicker.vue';
import EntryTextarea from '~/components/diary/view/entry/EntryTextarea.vue';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';

const activeStore = useDiaryViewActiveStore();
</script>