<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0">
      <Button variant="ghost" size="icon" @click="saveEntry">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
      </Button>
    </div>
    <Separator />
    <div class="p-8 overflow-y-auto">
      <div v-if="editableEntry">
        <EditableInput v-model="editableEntry.title" placeholder="Title" />
        <DatePicker variant="plain" v-model="editableEntry.date" />
        <EditableTextarea v-model="editableEntry.content" placeholder="What did you dream about?" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useJournal } from '@/composables/useJournal';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import EditableInput from './EditableInput.vue';
import EditableTextarea from './EditableTextarea.vue';
import DatePicker from './DatePicker.vue';

const props = defineProps<{ entry: any }>();

const { createEntry, updateEntry, selectedEntry } = useJournal();
const editableEntry = ref<any>(null);

watch(() => props.entry, (newVal) => {
  editableEntry.value = newVal ? { ...newVal } : { title: '', content: '', date: new Date() };
}, { immediate: true });

const saveEntry = () => {
  if (editableEntry.value) {
    if (editableEntry.value.id) {
      updateEntry(editableEntry.value);
      navigateTo(`/journal/${editableEntry.value.id}`);
    } else {
      const newEntry = createEntry(editableEntry.value);
      navigateTo(`/journal/${newEntry.id}`);
    }
  }
};
</script>
