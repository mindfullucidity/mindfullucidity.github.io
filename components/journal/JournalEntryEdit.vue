<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-end p-4 h-12 shrink-0">
      <div class="flex h-5 items-center space-x-1 text-sm">
        <Button variant="ghost" size="icon">
          <Sparkles class="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" class="mx-2" />
        <Button variant="ghost" size="icon" @click="() => { editableEntry?.id === 0 ? navigateTo('/journal') : navigateTo(`/journal/${editableEntry?.id}`) }">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-red-400"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </Button>
        <Button variant="ghost" size="icon" @click="saveEntry" :disabled="isSavingEntry">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 6 9 17l-5-5"/></svg>
        </Button>
      </div>
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
import { Sparkles } from 'lucide-vue-next';
import EditableInput from './EditableInput.vue';
import EditableTextarea from './EditableTextarea.vue';
import DatePicker from './DatePicker.vue';
import type { JournalEntry } from '@/composables/useJournal';
import { toast } from 'vue-sonner';

const props = defineProps<{ entry: JournalEntry | null }>();

const { createEntry, updateEntry, isSavingEntry } = useJournal();
const editableEntry = ref<JournalEntry | null>(null);


watch(() => props.entry, (newVal) => {
  editableEntry.value = newVal ? { ...newVal } : { id: 0, title: '', content: '', date: new Date().toISOString().slice(0, 10), description: '' };
}, { immediate: true });

const saveEntry = async () => {
  if (editableEntry.value) {
    console.log('Content before trim:', editableEntry.value.content);
    if (!editableEntry.value.content.trim()) {
      toast.error('Journal entry cannot be empty.');
      return;
    }

    let resultEntry: JournalEntry | null = null;
    if (editableEntry.value.id && editableEntry.value.id !== 0) {
      resultEntry = await updateEntry(editableEntry.value);
    } else {
      resultEntry = await createEntry({ title: editableEntry.value.title, content: editableEntry.value.content, date: editableEntry.value.date });
    }
    if (resultEntry) {
      navigateTo(`/journal/${resultEntry.id}`);
    } else {
      toast.error('Failed to save journal entry.');
    }
  }
};
</script>
