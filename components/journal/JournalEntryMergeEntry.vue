<template>
  <TabsContent value="entry" class="p-6 overflow-y-auto flex-grow">
    <div class="mx-auto max-w-4xl w-full">
      <JournalEntrySkeleton v-if="isLoadingEntry || !editableEntry || isEnhancingEntry" />
      <div v-else-if="editableEntry && !isEnhancingEntry">
        <EditableInput v-model="editableEntry.title" placeholder="Title" @update:modelValue="emit('update:editableEntry', editableEntry)" />
        <DatePicker variant="plain" v-model="editableEntry.date" @update:modelValue="emit('update:editableEntry', editableEntry)" />
        <EditableTextarea v-model="editableEntry.content" placeholder="What did you dream about?" @update:modelValue="emit('update:editableEntry', editableEntry)" />
      </div>
    </div>
  </TabsContent>
</template>

<script setup lang="ts">
import type { JournalEntry } from '@/composables/useJournal';
import { TabsContent } from '@/components/ui/tabs';
import JournalEntrySkeleton from '@/components/journal/JournalEntrySkeleton.vue';
import EditableInput from '@/components/journal/EditableInput.vue';
import DatePicker from '@/components/journal/DatePicker.vue';
import EditableTextarea from '@/components/journal/EditableTextarea.vue';

const props = defineProps<{
  editableEntry: JournalEntry | null;
  isLoadingEntry: boolean;
  isEnhancingEntry: boolean;
}>();

const emit = defineEmits([
  'update:editableEntry',
]);

// Watch for changes to editableEntry and emit an update event
watch(() => props.editableEntry, (newVal) => {
  emit('update:editableEntry', newVal);
}, { deep: true });
</script>
