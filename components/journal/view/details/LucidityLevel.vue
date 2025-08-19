<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Moon, Sun, Cloud, Eye } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface LucidityLevel {
  level: number;
  label: string;
  icon: any;
  color: string;
}

const props = defineProps({
  initialLucidityLevel: { type: Number, default: 0 },
  initialLucidityTrigger: { type: String, default: '' },
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:lucidityLevel',
  'update:lucidityTrigger',
  'component-ready',
]);

const selectedLucidity = ref<number>(props.initialLucidityLevel);
const lucidityTrigger = ref<string>(props.initialLucidityTrigger);

watch(() => props.initialLucidityLevel, (newVal) => {
  selectedLucidity.value = newVal;
});
watch(() => props.initialLucidityTrigger, (newVal) => {
  lucidityTrigger.value = newVal;
});

onMounted(() => {
  emit('component-ready');
});

const lucidityLevels: LucidityLevel[] = [
  {
    level: 0,
    label: 'Not Lucid',
    icon: Moon,
    color: 'bg-[#44475A]/40', // Dracula currentLine (darker gray/purple)
  },
  {
    level: 1,
    label: 'Slightly Aware',
    icon: Cloud,
    color: 'bg-[#F1FA8C]/40', // Dracula yellow
  },
  {
    level: 2,
    label: 'Moderately Lucid',
    icon: Eye,
    color: 'bg-[#8BE9FD]/40', // Dracula cyan
  },
  {
    level: 3,
    label: 'Fully Lucid',
    icon: Sun,
    color: 'bg-[#BD93F9]/40', // Dracula purple
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

const selectedLucidityDetails = computed(() => {
  return lucidityLevels.find(level => level.level === selectedLucidity.value);
});
</script>

<template>
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
          <span class="text-xs mt-1 font-medium hidden sm:block">{{ level.label }}</span>
        </div>
      </div>
    </div>
    <div class="text-center text-sm font-medium text-foreground sm:hidden" v-if="selectedLucidityDetails">
      {{ selectedLucidityDetails.label }}
    </div>

    <div v-if="selectedLucidity > 0" class="pt-4">
      <label class="block text-sm font-medium text-foreground mb-2">
        What triggered your lucidity?
      </label>
      <div v-if="isEnhancingDetails" class="space-y-2">
        <Skeleton class="h-5 w-full" />
        <Skeleton class="h-5 w-full" />
        <Skeleton class="h-5 w-4/5" />
      </div>
      <Textarea
        v-else
        :model-value="lucidityTrigger"
        @input="handleTriggerChange"
        placeholder="e.g., reality check, unusual dream sign..."
        class="w-full bg-card"
      />
    </div>
  </div>
</template>
