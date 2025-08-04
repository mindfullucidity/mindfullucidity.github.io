<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Moon, Sun, Cloud, Sparkles, Eye, Brain, AlertTriangle, RotateCcw } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LucidityLevel {
  level: number;
  label: string;
  icon: any;
  color: string;
}

interface Characteristic {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const props = defineProps({
  initialLucidityLevel: { type: Number, default: 0 },
  initialLucidityTrigger: { type: String, default: '' },
  initialMood: { type: Number as PropType<number | null>, default: 50 },
  initialCharacteristics: { type: Array as () => string[], default: () => [] },
});

const emit = defineEmits([
  'update:lucidityLevel',
  'update:lucidityTrigger',
  'update:mood',
  'update:characteristics',
]);

const selectedLucidity = ref<number>(props.initialLucidityLevel);
const lucidityTrigger = ref<string>(props.initialLucidityTrigger);
const mood = ref<number>(props.initialMood ?? 50);
const selectedCharacteristics = ref<string[]>(props.initialCharacteristics);
const isDragging = ref(false);

watch(() => props.initialLucidityLevel, (newVal) => {
  selectedLucidity.value = newVal;
});
watch(() => props.initialLucidityTrigger, (newVal) => {
  lucidityTrigger.value = newVal;
});
watch(() => props.initialMood, (newVal) => {
  mood.value = newVal === null ? 50 : newVal;
});
watch(() => props.initialCharacteristics, (newVal) => {
  selectedCharacteristics.value = newVal;
});

const lucidityLevels: LucidityLevel[] = [
  {
    level: 0,
    label: 'Not Lucid',
    icon: Moon,
    color: 'bg-[#44475A]/70', // Dracula currentLine (darker gray/purple)
  },
  {
    level: 1,
    label: 'Slightly Aware',
    icon: Cloud,
    color: 'bg-[#F1FA8C]/70', // Dracula yellow
  },
  {
    level: 2,
    label: 'Moderately Lucid',
    icon: Eye,
    color: 'bg-[#8BE9FD]/70', // Dracula cyan
  },
  {
    level: 3,
    label: 'Fully Lucid',
    icon: Sparkles,
    color: 'bg-[#BD93F9]/70', // Dracula purple
  }
];

const characteristics: Characteristic[] = [
  {
    id: 'recurrent',
    label: 'Recurrent',
    icon: RotateCcw,
    color: 'bg-[#50FA7B]/70' // Dracula green
  },
  {
    id: 'nightmare',
    label: 'Nightmare',
    icon: AlertTriangle,
    color: 'bg-[#FF5555]/70' // Dracula red
  },
  {
    id: 'sleep_paralysis',
    label: 'Sleep Paralysis',
    icon: Brain,
    color: 'bg-[#BD93F9]/70' // Dracula purple
  },
  {
    id: 'false_awakening',
    label: 'False Awakening',
    icon: Sun,
    color: 'bg-[#FFB86C]/70' // Dracula orange
  }
];

const handleLuciditySelect = (level: number) => {
  selectedLucidity.value = level;
  if (level === 0) {
    lucidityTrigger.value = '';
  }
  emit('update:lucidityLevel', selectedLucidity.value);
  emit('update:lucidityTrigger', lucidityTrigger.value);
};

const handleTriggerChange = (event: Event) => {
  lucidityTrigger.value = (event.target as HTMLInputElement).value;
  emit('update:lucidityTrigger', lucidityTrigger.value);
};

let moodSpectrumRect: DOMRect | null = null;

const handleMoodDrag = (event: MouseEvent) => {
  if (!moodSpectrumRect) {
    console.error('moodSpectrumRect is null in handleMoodDrag');
    return;
  }
  const x = event.clientX - moodSpectrumRect.left;
  const percentage = Math.max(0, Math.min(100, (x / moodSpectrumRect.width) * 100));
  mood.value = Math.round(percentage);
  emit('update:mood', mood.value);
};

const startDragging = (event: MouseEvent) => {
  isDragging.value = true;
  moodSpectrumRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
  handleMoodDrag(event); // Set initial position on mousedown
  window.addEventListener('mousemove', handleMoodDrag);
  window.addEventListener('mouseup', stopDragging);
};

const stopDragging = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', handleMoodDrag);
  window.removeEventListener('mouseup', stopDragging);
};

const handleCharacteristicToggle = (characteristicId: string) => {
  const index = selectedCharacteristics.value.indexOf(characteristicId);
  if (index > -1) {
    selectedCharacteristics.value = selectedCharacteristics.value.filter(id => id !== characteristicId);
  } else {
    selectedCharacteristics.value = [...selectedCharacteristics.value, characteristicId];
  }
  emit('update:characteristics', selectedCharacteristics.value);
};

const getMoodColor = computed(() => (value: number) => {
  let h, s, l;
  if (value <= 50) {
    const progress = value / 50;
    h = 330 + (-170) * progress;
    s = 50 + (10) * progress;
    l = 30 + (15) * progress;
  } else {
    const progress = (value - 50) / 50;
    h = 160 + (100) * progress;
    s = 60 + (20) * progress;
    l = 45 + (15) * progress;
  }
  return `hsl(${h}, ${s}%, ${l}%)`;
});

const getMoodEmoji = computed(() => (value: number) => {
  if (value < 20) return '😞';
  if (value < 40) return '😐';
  if (value < 60) return '😄';
  if (value < 80) return '😊';
  return '🤩';
});
</script>

<template>
  <div class="w-full mx-auto space-y-8">
    <!-- Lucidity Level -->
    <div class="space-y-4">
      <div class="space-y-0">
        <h3 class="text-lg font-semibold text-foreground">Lucidity Level</h3>
        <p class="text-muted-foreground">How aware were you that you were dreaming?</p>
      </div>
      <div class="flex justify-between gap-4">
        <div
          v-for="level in lucidityLevels"
          :key="level.level"
          class="relative flex-1 cursor-pointer"
          @click="handleLuciditySelect(level.level)"
        >
          <div
            :class="[
              'w-full h-20 rounded-xl flex flex-col items-center justify-center',
              'transition-all duration-300 border-2',
              selectedLucidity === level.level
                ? `${level.color} border-white shadow-lg text-white`
                : 'bg-card border-border hover:bg-muted'
            ]"
          >
            <component :is="level.icon" class="w-6 h-6" />
            <span class="text-xs mt-1 font-medium">{{ level.label }}</span>
          </div>
        </div>
      </div>

      <div v-if="selectedLucidity > 0" class="pt-4">
        <label class="block text-sm font-medium text-foreground mb-2">
          What triggered your lucidity?
        </label>
        <Input
          :model-value="lucidityTrigger"
          @input="handleTriggerChange"
          placeholder="e.g., reality check, unusual dream sign..."
          class="w-full"
        />
      </div>
    </div>

    <!-- Mood Spectrum -->
    <div class="space-y-4">
      <div class="space-y-0">
        <h3 class="text-lg font-semibold text-foreground">Mood Spectrum</h3>
        <p class="text-muted-foreground">How did the dream make you feel overall?</p>
      </div>
      <div class="relative">
        <div
          class="h-12 rounded-full cursor-pointer relative overflow-hidden border border-border"
          :style="{
            background: `linear-gradient(to right,
              hsl(330, 80%, 40%) 0%,
              hsl(160, 70%, 50%) 50%,
              hsl(260, 90%, 70%) 100%
            )`
          }"
          @mousedown="startDragging"
        >
          <div
            class="absolute top-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg cursor-grab active:cursor-grabbing select-none"
            :style="{
              left: `${mood}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: getMoodColor(mood)
            }"
          >
            {{ getMoodEmoji(mood) }}
          </div>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Negative</span>
          <span>Neutral</span>
          <span>Positive</span>
        </div>
      </div>
    </div>

    <!-- Characteristics -->
    <div class="space-y-4">
      <div class="space-y-0">
        <h3 class="text-lg font-semibold text-foreground">Characteristics</h3>
        <p class="text-muted-foreground">Select any special qualities your dream had</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
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
  </div>
</template>


