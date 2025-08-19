<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Card } from '@/components/ui/card';
import { RotateCcw, Ghost, Bed, EyeOff } from 'lucide-vue-next';

interface Characteristic {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const props = defineProps({
  initialCharacteristics: { type: Array as () => string[], default: () => [] },
});

const emit = defineEmits([
  'update:characteristics',
  'component-ready',
]);

const selectedCharacteristics = ref<string[]>(props.initialCharacteristics);

watch(() => props.initialCharacteristics, (newVal) => {
  selectedCharacteristics.value = newVal;
});

onMounted(() => {
  emit('component-ready');
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
  if (index > -1) {
    selectedCharacteristics.value = selectedCharacteristics.value.filter(id => id !== characteristicId);
  } else {
    selectedCharacteristics.value = [...selectedCharacteristics.value, characteristicId];
  }
  emit('update:characteristics', selectedCharacteristics.value);
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
