<script setup lang="ts">
import { ref, watch } from 'vue';
import { Card } from '@/components/ui/card';
import { RotateCcw, Ghost, Bed, EyeOff } from 'lucide-vue-next';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active'; // Assuming this path and store structure

interface Characteristic {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const diaryStore = useDiaryViewActiveStore();

const selectedCharacteristics = ref<string[]>(diaryStore.current.details.characteristics || []);

watch(() => diaryStore.current.details.characteristics, (newVal) => {
  selectedCharacteristics.value = newVal || [];
});

const characteristics: Characteristic[] = [
  {
    id: 'recurrent',
    label: 'Recurrent',
    icon: RotateCcw,
    color: 'bg-[#50FA7B]/40' // Dracula green
  },
  {
    id: 'nightmare',
    label: 'Nightmare',
    icon: Ghost,
    color: 'bg-[#FF5555]/40' // Dracula red
  },
  {
    id: 'sleep_paralysis',
    label: 'Sleep Paralysis',
    icon: Bed,
    color: 'bg-[#BD93F9]/40' // Dracula purple
  },
  {
    id: 'false_awakening',
    label: 'False Awakening',
    icon: EyeOff,
    color: 'bg-[#FFB86C]/40' // Dracula orange
  }
];

const handleCharacteristicToggle = (characteristicId: string) => {
  const index = selectedCharacteristics.value.indexOf(characteristicId);
  let updatedCharacteristics: string[];
  if (index > -1) {
    updatedCharacteristics = selectedCharacteristics.value.filter(id => id !== characteristicId);
  } else {
    updatedCharacteristics = [...selectedCharacteristics.value, characteristicId];
  }
  // Update the store directly
  if (diaryStore.current.details) {
    diaryStore.current.details.characteristics = updatedCharacteristics;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-0">
      <h3 class="text-lg font-semibold text-foreground">Characteristics</h3>
      <p class="text-muted-foreground">Select any special qualities your dream had</p>
    </div>
    <div class="grid sm:grid-cols-2 gap-3">
      <div
        v-for="characteristic in characteristics"
        :key="characteristic.id"
        @click="handleCharacteristicToggle(characteristic.id)"
      >
        <Card
          :class="[
            'p-4 cursor-pointer transition-all duration-300 border-2',
            selectedCharacteristics.includes(characteristic.id)
              ? `${characteristic.color} border-white shadow-lg text-white`
              : 'bg-card border-border hover:bg-muted'
          ]"
        >
          <div class="flex items-center space-x-3">
            <component :is="characteristic.icon" class="w-5 h-5" />
            <span class="font-medium">{{ characteristic.label }}</span>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
