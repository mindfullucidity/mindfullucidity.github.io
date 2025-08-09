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
  FileText
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

const isSubscribed = computed(() => user.value?.app_metadata?.user_role === 'plus');
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
</script>

<template>
  <Title>Home | MindfulLucidity</Title>
  <ClientOnly>
  <div class="relative min-h-screen overflow-hidden">
    
    <div class="relative z-10 min-h-screen text-foreground p-6">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Welcome Section -->
        <div class="text-center space-y-4 pt-4 lg:pt-16">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text">
            Welcome back, {{ username }}!
          </h1>
          <p class="text-muted-foreground text-lg">
            Ready to explore your dream world today?
          </p>
        </div>

        <!-- Quick Journal Entry - Most Prominent -->
        <Card class="bg-gradient-to-r from-primary/20 to-accent/20 border-border shadow-2xl">
          <CardContent class="p-8 text-center">
            <div class="space-y-4">
              <div class="flex justify-center">
                <div class="p-4 bg-primary/20 rounded-full">
                  <PlusCircle class="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 class="text-2xl font-bold text-foreground">
                Log Your Dream
              </h2>
              <p class="text-muted-foreground max-w-md mx-auto">
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

        <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Entries -->
          <div class="sm:col-span-1 lg:col-span-2">
            <Card class="bg-card border-border h-full">
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
                      <FileText class="h-8 w-8 mb-2" />
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <!-- Journaling Streak -->
            <Card class="bg-card border-border">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-foreground">
                  <Flame class="text-destructive" />
                  Dream Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div v-if="isLoadingStreakInfo" class="text-center space-y-3">
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
                    {{ streakInfo.streak_length }} Day{{ streakInfo.streak_length === 1 ? '' : 's' }}
                  </div>
                  <p class="text-muted-foreground text-sm">
                    {{ streakMessage }}
                  </p>
                  <Progress
                    :model-value="(streakInfo.streak_length % 30) * (100/30)"
                    class="h-2 bg-background"
                  />
                  <p class="text-xs text-muted-foreground">
                    {{ 30 - (streakInfo.streak_length % 30) }} days to next milestone
                  </p>
                </div>
              </CardContent>
            </Card>

            <!-- Subscription Status -->
            <Card v-if="!isSubscribed" class="bg-card border-plus-gold grid-cols-1">
              <CardHeader>
                <CardTitle class="flex items-center gap-2 text-plus-gold">
                  <Crown class="h-5 w-5" />
                  MindfulLucidity Plus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <p class="text-muted-foreground text-sm">
                    Gain unlimited access to advanced AI analysis, exclusive features, and directly support the future of MindfulLucidity.
                  </p>
                  <!-- <div class="flex items-start space-x-2 text-sm text-muted-foreground">
                    <Lightbulb class="h-4 w-4 flex-shrink-0 mt-1" />
                    <p>
                      You can get a free <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-500 hover:underline">Google Gemini API key</a> to enable full access completely free, by enabling Custom AI Model in <NuxtLink to="/settings/ai" class="text-blue-500 hover:underline">Settings</NuxtLink>!
                    </p>
                  </div> -->
                  <div class="flex flex-col gap-2">
                    <Button
                      class="w-full"
                      as-child
                    >
                      <NuxtLink to="/plus">
                        Learn More
                      </NuxtLink>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      class="w-full"
                      as-child
                    >
                      <NuxtLink to="/settings/ai">
                        Use Your Own API Key
                      </NuxtLink>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card v-else class="bg-card border-plus-gold sm:flex flex-col justify-between hidden">
              <CardHeader>
                <CardTitle class="flex items-center gap-2 text-plus-gold">
                  <Crown class="h-5 w-5" />
                  MindfulLucidity Plus 
                </CardTitle>
                <CardDescription class="text-muted-foreground text-sm">
                  Thank you for being a Plus Subscriber! You have full access to all MindfulLucidity Plus features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  size="sm"
                  class="w-full"
                  as-child
                >
                  <NuxtLink to="/settings/plus">
                    Manage Subscription
                  </NuxtLink>
                </Button>
              </CardFooter>
            </Card>
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
      </div>
    </div>
  </div>
</ClientOnly>
</template>

<style scoped>
/* Add any specific styles for the home page here */
</style>