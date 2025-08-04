<script setup lang="ts">
import { ref, computed } from 'vue';
import { Moon, Sun, Cloud, Sparkles, Eye, Brain, AlertTriangle, RotateCcw } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LucidityLevel {
  level: number;
  label: string;
  icon: any; // Using 'any' for now, will refine if needed
  color: string;
}

interface Characteristic {
  id: string;
  label: string;
  icon: any; // Using 'any' for now, will refine if needed
  color: string;
}

const selectedLucidity = ref<number>(0);
const lucidityTrigger = ref<string>('');
const moodValue = ref<number>(50);
const selectedCharacteristics = ref<string[]>([]);
const isDragging = ref(false);

const lucidityLevels: LucidityLevel[] = [
  {
    level: 0,
    label: 'Not Lucid',
    icon: Moon,
    color: 'bg-slate-600/70',
  },
  {
    level: 1,
    label: 'Slightly Aware',
    icon: Cloud,
    color: 'bg-blue-500/70',
  },
  {
    level: 2,
    label: 'Moderately Lucid',
    icon: Eye,
    color: 'bg-purple-500/70',
  },
  {
    level: 3,
    label: 'Fully Lucid',
    icon: Sparkles,
    color: 'bg-yellow-500/70',
  }
];

const characteristics: Characteristic[] = [
  {
    id: 'recurrent',
    label: 'Recurrent',
    icon: RotateCcw,
    color: 'bg-green-500/70'
  },
  {
    id: 'nightmare',
    label: 'Nightmare',
    icon: AlertTriangle,
    color: 'bg-red-500/70'
  },
  {
    id: 'sleep_paralysis',
    label: 'Sleep Paralysis',
    icon: Brain,
    color: 'bg-indigo-500/70'
  },
  {
    id: 'false_awakening',
    label: 'False Awakening',
    icon: Sun,
    color: 'bg-orange-500/70'
  }
];

const handleLuciditySelect = (level: number) => {
  selectedLucidity.value = level;
  if (level === 0) {
    lucidityTrigger.value = '';
  }
};

const handleTriggerChange = (event: Event) => {
  lucidityTrigger.value = (event.target as HTMLInputElement).value;
};

let moodSpectrumRect: DOMRect | null = null;

const handleMoodDrag = (event: MouseEvent) => {
  if (!moodSpectrumRect) return;
  const x = event.clientX - moodSpectrumRect.left;
  const percentage = Math.max(0, Math.min(100, (x / moodSpectrumRect.width) * 100));
  moodValue.value = percentage;
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
    selectedCharacteristics.value.splice(index, 1);
  } else {
    selectedCharacteristics.value.push(characteristicId);
  }
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
      <div class="space-y-0.5">
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
      <div class="space-y-0.5">
        <h3 class="text-lg font-semibold text-foreground">Mood Spectrum</h3>
        <p class="text-muted-foreground">How did the dream make you feel overall?</p>
      </div>
      <div class="relative">
        <div
          class="h-12 rounded-full cursor-pointer relative overflow-hidden border border-border"
          :style="{
            background: `linear-gradient(to right,
              hsl(330, 50%, 30%) 0%,
              hsl(160, 60%, 45%) 50%,
              hsl(260, 80%, 60%) 100%
            )`
          }"
          @mousedown="startDragging"
        >
          <div
            class="absolute top-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg cursor-grab active:cursor-grabbing select-none"
            :style="{
              left: `${moodValue}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: getMoodColor(moodValue)
            }"
          >
            {{ getMoodEmoji(moodValue) }}
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
      <div class="space-y-0.5">
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


