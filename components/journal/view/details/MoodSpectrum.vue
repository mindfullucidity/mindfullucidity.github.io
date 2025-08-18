<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  initialMood: { type: Number as PropType<number | null>, default: 50 },
});

const emit = defineEmits([
  'update:mood',
]);

const mood = ref<number>(props.initialMood ?? 50);
const isDragging = ref(false);

watch(() => props.initialMood, (newVal) => {
  mood.value = newVal === null ? 50 : newVal;
});

let moodSpectrumRect: DOMRect | null = null;

const handleMoodDrag = (event: MouseEvent | TouchEvent) => {
  if (!moodSpectrumRect) {
    console.error('moodSpectrumRect is null in handleMoodDrag');
    return;
  }
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const x = clientX - moodSpectrumRect.left;
  const percentage = Math.max(0, Math.min(100, (x / moodSpectrumRect.width) * 100));
  mood.value = Math.round(percentage);
  emit('update:mood', mood.value);
};

const startDragging = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  moodSpectrumRect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
  handleMoodDrag(event); // Set initial position on mousedown or touchstart

  if ('touches' in event) {
    window.addEventListener('touchmove', handleMoodDrag);
    window.addEventListener('touchend', stopDragging);
  } else {
    window.addEventListener('mousemove', handleMoodDrag);
    window.addEventListener('mouseup', stopDragging);
  }
};

const stopDragging = (event: MouseEvent | TouchEvent) => {
  isDragging.value = false;
  if ('touches' in event) {
    window.removeEventListener('touchmove', handleMoodDrag);
    window.removeEventListener('touchend', stopDragging);
  } else {
    window.removeEventListener('mousemove', handleMoodDrag);
    window.removeEventListener('mouseup', stopDragging);
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
  <div class="space-y-4">
    <div class="space-y-0">
      <h3 class="text-lg font-semibold text-foreground">Mood Spectrum</h3>
      <p class="text-muted-foreground">How did the dream make you feel overall?</p>
    </div>
    <div class="relative">
      <div
        class="w-full h-12 rounded-full cursor-pointer relative overflow-hidden"
        :style="{
          background: `linear-gradient(to right,
            hsl(330, 80%, 40%) -5%,
            hsl(160, 70%, 50%) 50%,
            hsl(260, 90%, 70%) 105%
          )`
        }"
        @mousedown="startDragging"
        @touchstart.prevent="startDragging"
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
</template>
