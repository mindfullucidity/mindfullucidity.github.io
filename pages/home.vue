<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSupabaseUser } from '#imports';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHome } from '@/composables/useHome';
import JournalEntryCardExpanded from '~/components/journal/misc/JournalEntryCardExpanded.vue';
import JournalEntryCardExpandedSkeleton from '~/components/journal/misc/JournalEntryCardExpandedSkeleton.vue';
import HomePlusCard from '~/components/misc/HomePlusCard.vue';
import HomeDreamStreak from '~/components/misc/HomeDreamStreak.vue';
import { Skeleton } from '@/components/ui/skeleton';


import {
  PlusCircle,
  BookOpen,
  TrendingUp,
  Heart,
  Lightbulb,
  Flame,
  Crown,
  Calendar,
  Moon,
  Brain,
  Sparkles,
  Bed
} from 'lucide-vue-next';

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  date: string;
  lucidityLevel: number;
  mood: number | null;
  characteristics: string[];
}

interface InsightCard {
  title: string;
  value: string;
  icon: any; // Using 'any' for now as LucideVueNext components are not directly typed as VueNode
  description: string;
}

const user = useSupabaseUser();
const username = computed(() => user.value?.user_metadata?.full_name || user.value?.email || "Dreamer");
const { streakInfo, journalEntries, getDreamStreakInfo, getRecentJournalEntries } = useHome();
const isLoadingEntries = ref(true);
const isLoadingStreakInfo = ref(true);

onMounted(async () => {
  try {
    isLoadingStreakInfo.value = true;
    await getDreamStreakInfo();
  } finally {
    isLoadingStreakInfo.value = false;
  }
  try {
    isLoadingEntries.value = true;
    await getRecentJournalEntries();
  } finally {
    isLoadingEntries.value = false;
  }
});

const isSubscribed = computed(() => user.value?.user_metadata?.user_role === 'plus');
const insights = ref({
  topThemes: ["Flying", "Water", "Animals", "Transformation"],
  lucidityTrend: 75,
  averageMood: "Positive",
  tipOfDay: "Try reality checks throughout the day to increase lucid dreaming frequency."
});

const insightCards = computed<InsightCard[]>(() => [
  {
    title: "Top Dream Themes",
    value: insights.value.topThemes.slice(0, 2).join(", "),
    icon: Brain,
    description: `${insights.value.topThemes.length} recurring themes identified`
  },
  {
    title: "Lucidity Trend",
    value: `${insights.value.lucidityTrend}%`,
    icon: TrendingUp,
    description: "Average lucidity this month"
  },
  {
    title: "Mood Analysis",
    value: insights.value.averageMood,
    icon: Heart,
    description: "Overall dream sentiment"
  },
  {
    title: "Dream Tip",
    value: "Reality Checks",
    icon: Lightbulb,
    description: insights.value.tipOfDay
  }
]);

const getMoodColor = (mood: string) => {
  const moodColors: Record<string, string> = {
    "Euphoric": "bg-primary/20 text-primary",
    "Curious": "bg-accent/20 text-accent",
    "Reflective": "bg-success/20 text-success",
    "Wonder": "bg-warning/20 text-warning",
    "Peaceful": "bg-info/20 text-info"
  };
  return moodColors[mood] || "bg-muted/20 text-muted-foreground";
};

const getLucidityColor = (level: number) => {
  if (level >= 8) return "text-success";
  if (level >= 6) return "text-warning";
  if (level >= 4) return "text-destructive";
  return "text-muted-foreground";
};

const streakTextColorClass = computed(() => {
  if (streakInfo.value.days_since_last_entry <= 1 && streakInfo.value.streak_length > 0) {
    return 'text-destructive';
  } else {
    return 'text-primary';
  }
});

const streakMessage = computed(() => {
  if (streakInfo.value.days_since_last_entry <= 1 && streakInfo.value.streak_length > 0) {
    return 'Keep the momentum going!';
  } else if (streakInfo.value.streak_length === 0) {
    return 'Start your dream streak today!';
  } else {
    return 'Log a journal today to keep streak';
  }
});

definePageMeta({                                                                                                              
  layout: 'default',
  middleware: ['auth'],
});
</script>

<template>
  <Title>Home | MindfulLucidity</Title>
  <div class="relative min-h-screen overflow-hidden">
    
    <div class="relative z-10 min-h-screen text-foreground px-6 py-2 sm:py-4">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Welcome Section -->
        <div class="text-center space-y-4 pt-4 lg:pt-16">
          <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text">
            Welcome back, {{ username }}!
          </h1>
          <p class="text-muted-foreground text-sm md:text-lg">
            Ready to explore your dream world today?
          </p>
        </div>

        <!-- Quick Journal Entry - Most Prominent -->
        <Card class="bg-gradient-to-r from-primary/20 to-accent/20 border-border shadow-2xl">
          <CardContent class="p2 sm:p-8 text-center">
            <div class="space-y-1 sm:space-y-4">
              <div class="flex justify-center">
                <div class="p-4 bg-primary/20 rounded-full">
                  <PlusCircle class="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
                </div>
              </div>
              <h2 class="text-lg sm:text-2xl font-bold text-foreground">
                Log Your Dream
              </h2>
              <p class="text-muted-foreground max-w-md mx-auto text-sm sm:text-base mb-2 sm:mb-4">
                Capture the details while they're fresh in your memory
              </p>
              <Button
                size="lg"
                class="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold px-8 py-3"
                as-child
              >
                <NuxtLink to="/journal/new">
                  <Moon class="mr-2 h-5 w-5" />
                  Create New Entry
                </NuxtLink>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 md:gap-8">
          <!-- Recent Entries -->
          <div class="md:col-span-1 lg:col-span-2">
            <div class="md:hidden  mb-6 md:mb-0">
              <HomeDreamStreak :is-loading-streak-info="isLoadingStreakInfo" :streak-info="streakInfo" />
            </div>
            <Card class="bg-card border-border">
              <CardHeader>
                <CardTitle class="flex items-center gap-2 text-foreground">
                  <BookOpen class="h-5 w-5 text-primary" />
                  Recent Dream Entries
                </CardTitle>
                <CardDescription class="text-muted-foreground">
                  Your latest dream journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea class="lg:h-96">
                  <div v-if="isLoadingEntries" class="space-y-4 pr-4">
                    <JournalEntryCardExpandedSkeleton v-for="i in 5" :key="i" />
                  </div>
                  <div v-else-if="journalEntries.length === 0">
                    <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Bed class="h-8 w-8 mb-2" />
                      <p>No recent entries yet. Start by creating a new one!</p>
                    </div>
                  </div>
                  <div v-else class="space-y-4 pr-4">
                    <JournalEntryCardExpanded
                      v-for="entry in journalEntries"
                      :key="entry.id"
                      :entry="entry"
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <!-- Right Sidebar -->
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-6">
            <!-- Journaling Streak -->
              <HomeDreamStreak :is-loading-streak-info="isLoadingStreakInfo" :streak-info="streakInfo" class="hidden md:flex"/>

            <!-- Subscription Status -->
            <HomePlusCard :is-subscribed="isSubscribed" class="hidden md:flex" />
          </div>
        </div>

        <!-- AI Insights Grid TODO-->
        <!-- <div>
          <h2 class="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Brain class="h-6 w-6 text-primary" />
            AI-Powered Insights
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              v-for="(card, index) in insightCards"
              :key="index"
              class="bg-card border-border hover:border-gray-500/50 transition-colors"
            >
              <CardContent class="p-4">
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="p-2 bg-background rounded-lg">
                      <component :is="card.icon" class="h-5 w-5" :class="getLucidityColor(insights.lucidityTrend)" />
                    </div>
                  </div>
                  <div>
                    <h3 class="font-semibold text-foreground text-sm">
                      {{ card.title }}
                    </h3>
                    <p class="text-lg font-bold text-primary mt-1">
                      {{ card.value }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {{ card.description }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div> -->
        <div class="md:hidden">
          <HomePlusCard :is-subscribed="isSubscribed" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for the home page here */
</style>