<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue';
import { Tabs } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, X, Check } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';
import FloatingActionButtonSection from '~/components/journal/misc/FloatingActionButtonSection.vue';
import FloatingActionButton from '~/components/journal/misc/FloatingActionButton.vue';

const props = defineProps<{
  disabled: boolean;
}>();

const route = useRoute();
const router = useRouter();
const activeStore = useDiaryViewActiveStore();

const activeTab = ref(route.hash === '#analysis' ? 'analysis' : route.hash === '#details' ? 'details' : 'entry');

const handleDelete = async () => {
  if (activeStore.current.journal_id) {
    await activeStore.deleteJournal(activeStore.current.journal_id);
    router.push('/journal');
  }
};

import { useDiaryViewActiveStore } from '@/stores/diary/view/active';
import { toast } from 'vue-sonner';

const { invokeEnhance } = useAI();

const handleEnhance = async () => {
  activeStore.isEnhancing = true;
  try {
    if (activeTab.value === 'entry') {
      const { data, error } = await invokeEnhance({
        type: 'journal_entry',
        object: {
          title: activeStore.current.entry.title,
          content: activeStore.current.entry.content,
        },
      });
      if (error) {
        console.error('Error enhancing journal entry:', error);
        toast.error('Failed to enhance journal entry.');
      } else if (data && data.object) {
        activeStore.current.entry.title = data.object.title;
        activeStore.current.entry.content = data.object.content;
        toast.success('Journal entry enhanced successfully!');
      }
    } else if (activeTab.value === 'details') {
      const { data, error } = await invokeEnhance({
        type: 'journal_details',
        object: {
          lucidity_level: activeStore.current.details.lucidity_level,
          lucidity_trigger: activeStore.current.details.lucidity_trigger,
        },
      });
      if (error) {
        console.error('Error enhancing journal details:', error);
        toast.error('Failed to enhance journal details.');
      } else if (data && data.object) {
        activeStore.current.details.lucidity_trigger = data.object.lucidity_trigger;
        toast.success('Journal details enhanced successfully!');
      }
    }
  } finally {
    activeStore.isEnhancing = false;
  }
};

const handleCancel = () => {
  if (activeStore.isNew) {
    activeStore.cancelNew();
    router.push('/journal');
  } else {
    activeStore.cancelChanges();
  }
};

const handleSave = async () => {
  if (activeStore.isNew) {
    await activeStore.createJournal();
    if (activeStore.current.journal_id) {
      router.push(`/journal/${activeStore.current.journal_id}`);
    }
  } else {
    await activeStore.saveJournal();
  }
};

const showEnhanceButton = computed(() => activeTab.value === 'entry' || activeTab.value === 'details');

watch(() => route.hash, (newHash) => {
  const newTab = newHash === '#analysis' ? 'analysis' : newHash === '#details' ? 'details' : 'entry';
  if (activeTab.value !== newTab) {
    activeTab.value = newTab;
  }
});

provide('activeTab', activeTab);

const updateActiveTab = (newTab: string) => {
  activeTab.value = newTab;
  if (newTab === 'analysis') {
    router.push({ hash: '#analysis' });
  } else if (newTab === 'details') {
    router.push({ hash: '#details' });
  } else {
    router.push({ hash: '' });
  }
};
</script>

<template>
  <Tabs :model-value="activeTab" @update:model-value="updateActiveTab" class="flex flex-col h-full">
    <div class="flex items-center justify-between p-2 mt-2 h-8 shrink-0" :class="{ 'pointer-events-none opacity-50': props.disabled }">
      <div class="flex items-center">
        <slot name="toolbar-list" />
      </div>
      <div class="flex h-5 items-center gap-x-1text-sm">
        <template v-if="showEnhanceButton">
          <Button variant="ghost" size="icon" @click="handleEnhance()">
            <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" />
          </Button>
          <Separator v-if="!activeStore.isNew" orientation="vertical" class="mx-2" />
        </template>
        <template v-if="!activeStore.isNew">
          <Button variant="ghost" size="icon" @click="handleDelete()">
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
        </template>
        <template v-if="(activeStore.hasUnsaved || activeStore.isNew) && activeStore.isLoaded">
          <Separator orientation="vertical" class="mx-2 hidden lg:block" />
          <Button variant="ghost" size="icon" @click="handleCancel()" class="hidden lg:inline-flex">
            <X class="w-4 h-4 text-red-400" />
          </Button>
          <Button variant="ghost" size="icon" @click="handleSave()" class="hidden lg:inline-flex">
            <Check class="w-4 h-4" />
          </Button>
        </template>
        <slot name="actions" />
      </div>
    </div>
    <Separator />
    <slot />
    <FloatingActionButtonSection v-if="(activeStore.hasUnsaved || activeStore.isNew) && activeStore.isLoaded" class="lg:hidden  mb-16">
      <FloatingActionButton @click="handleCancel()" class="bg-red-400/90">
        <X class="w-6 h-6" />
      </FloatingActionButton>
      <FloatingActionButton @click="handleSave()" class="bg-green-400/90">
        <Check class="w-6 h-6" />
      </FloatingActionButton>
    </FloatingActionButtonSection>
  </Tabs>
</template>
