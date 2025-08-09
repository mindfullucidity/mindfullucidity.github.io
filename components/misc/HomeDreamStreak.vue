<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame } from 'lucide-vue-next';

const props = defineProps<{
  isLoadingStreakInfo: boolean;
  streakInfo: { streak_length: number; days_since_last_entry: number };
}>();

const streakTextColorClass = computed(() => {
  if (props.streakInfo.days_since_last_entry <= 1 && props.streakInfo.streak_length > 0) {
    return 'text-destructive';
  } else {
    return 'text-primary';
  }
});

const streakMessage = computed(() => {
  if (props.streakInfo.days_since_last_entry <= 1 && props.streakInfo.streak_length > 0) {
    return 'Keep the momentum going!';
  } else if (props.streakInfo.streak_length === 0) {
    return 'Start your dream streak today!';
  } else {
    return 'Log a journal today to keep streak';
  }
});
</script>

<template>
  <Card class="bg-card border-border">
    <CardHeader class="pb-3">
      <CardTitle class="flex items-center gap-2 text-foreground">
        <Flame class="text-destructive" />
        Dream Streak
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="props.isLoadingStreakInfo" class="text-center space-y-3">
        <Skeleton class="h-8 w-32 mx-auto" />
        <Skeleton class="h-4 w-48 mx-auto" />
        <Progress
          :model-value="0"
          class="h-2 bg-background"
        />
        <Skeleton class="h-3 w-40 mx-auto" />
      </div>
      <div v-else class="text-center space-y-3">
        <div :class="streakTextColorClass" class="text-3xl font-bold">
          {{ props.streakInfo.streak_length }} Day{{ props.streakInfo.streak_length === 1 ? '' : 's' }}
        </div>
        <p class="text-muted-foreground text-sm">
          {{ streakMessage }}
        </p>
        <Progress
          :model-value="(props.streakInfo.streak_length % 30) * (100/30)"
          class="h-2 bg-background"
        />
        <p class="text-xs text-muted-foreground">
          {{ 30 - (props.streakInfo.streak_length % 30) }} days to next milestone
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
/* Add any specific styles for the HomeDreamStreak here */
</style>
