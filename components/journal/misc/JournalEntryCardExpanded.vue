<script setup lang="ts">
import { computed } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { Calendar, RotateCcw, Ghost, Bed, Sun, EyeOff } from 'lucide-vue-next';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { navigateTo } from '#app';

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  date: string;
  lucidityLevel: number;
  mood: number | null;
  characteristics: string[];
}

const props = defineProps<{
  entry: JournalEntry;
}>();

const displayTitle = computed(() => {
  return props.entry.title || formattedDate.value;
});

const isLargeScreen = useMediaQuery('(min-width: 768px)');
const isSmallScreen = useMediaQuery('(max-width: 640px)');

const truncatedContent = computed(() => {
  let maxLength = isLargeScreen.value ? 300 : 150;
  maxLength = isSmallScreen.value ? 75 : maxLength;
  if (props.entry.content.length > maxLength) {
    return props.entry.content.substring(0, maxLength) + '...';
  }
  return props.entry.content;
});

const formattedDate = computed(() => {
  return formatDate(props.entry.date);
});

// Characteristics data from JournalEntryViewDetails.vue
const characteristicsData = [
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

const activeCharacteristics = computed(() => {
  return props.entry.characteristics.map(charId => {
    return characteristicsData.find(char => char.id === charId);
  }).filter(Boolean); // Filter out undefined in case of unknown charId
});

const getMoodEmoji = computed(() => {
  const value = props.entry.mood === null ? 50 : props.entry.mood;
  if (value < 20) return '😞';
  if (value < 40) return '😐';
  if (value < 60) return '😄';
  if (value < 80) return '😊';
  return '🤩';
});

const goToJournalEntry = () => {
  navigateTo(`/journal/${props.entry.id}`);
};
</script>

<template>
  <Card class="w-full bg-transparent border-border hover:bg-card hover:border-gray-500/50 transition-colors cursor-pointer mb-4" @click="goToJournalEntry">
    <CardHeader class="flex flex-row items-center justify-between md:pb-2">
      <CardTitle class="text-xs md:text-lg lg:text-2xl font-bold">
        {{ displayTitle }}
      </CardTitle>
      <div v-if="entry.title" class="flex items-center text-muted-foreground text-xs md:text-sm">
        <Calendar class="w-4 h-4 mr-1 md:mb-1" />
        <span class="whitespace-nowrap">{{ formattedDate }}</span>
      </div>
    </CardHeader>
    <CardContent>
      <p class="text-muted-foreground md:mb-4  text-xs  md:text-md">
        {{ truncatedContent }}
      </p>
      <div class="flex justify-between items-end">
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="char in activeCharacteristics"
            :key="char.id"
            :class="char.color"
            class="text-white"
          >
            <component :is="char.icon" class="w-3 h-3 mr-1" />
            {{ char.label }}
          </Badge>
        </div>
        <div class="flex items-center text-xs md:text-sm font-semibold text-foreground">
          <Sun class="w-4 h-4 mr-1" />
          <span>{{ entry.lucidityLevel }}/3</span>
          <span class="ml-4">{{ getMoodEmoji }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
