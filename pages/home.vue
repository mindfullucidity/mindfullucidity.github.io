<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHome } from '@/composables/useHome';
import JournalEntryCardExpanded from '~/components/journal/misc/JournalEntryCardExpanded.vue';


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
  Sparkles
} from 'lucide-vue-next';

interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  date: string;
  lucidityLevel: number;
  characteristics: string[];
}

interface InsightCard {
  title: string;
  value: string;
  icon: any; // Using 'any' for now as LucideVueNext components are not directly typed as VueNode
  description: string;
}

const username = ref("Alex");
const journalEntries = ref<JournalEntry[]>([
  {
    id: "1",
    title: "Flying Over Mountains",
    content: "Had an incredible lucid dream where I was soaring over snow-capped mountains, feeling the wind rush past me. The details were so vivid, I could see every tree and rock below. It was an exhilarating experience, unlike anything I've felt before. I tried to control my flight, and with some effort, I managed to change direction and speed. The dream ended with me landing gently in a field of wildflowers.",
    date: "2024-01-15",
    lucidityLevel: 3,
    characteristics: ["recurrent"]
  },
  {
    id: "2",
    title: "Underwater Adventure",
    content: "Dreamed I could breathe underwater and explored a coral reef city. The colors were vibrant, and I saw fish of all shapes and sizes. There were ancient ruins covered in coral, and I felt a sense of wonder and peace. I even interacted with some friendly dolphins. The water was crystal clear, and the sunlight filtered through, creating beautiful patterns on the seabed. It was a truly magical place.",
    date: "2024-01-14",
    lucidityLevel: 2,
    characteristics: ["false_awakening"]
  },
  {
    id: "3",
    title: "Meeting My Future Self",
    content: "A profound dream where I had a conversation with an older version of myself. They gave me advice about my career and personal life. It felt incredibly real, and their words resonated deeply. I asked about future challenges and how to overcome them. The older me was calm and wise, offering guidance that felt both comforting and empowering. I woke up feeling inspired and with a clearer sense of direction.",
    date: "2024-01-13",
    lucidityLevel: 3,
    characteristics: ["sleep_paralysis"]
  },
  {
    id: "4",
    title: "Shapeshifting Animals",
    content: "Witnessed animals transforming into different creatures in a magical forest. A fox turned into an eagle, and a bear became a deer. It was a surreal and fascinating spectacle. The forest itself seemed alive, with glowing plants and singing trees. I felt a sense of awe and curiosity, observing these transformations without fear. The dream was full of vibrant energy and unexpected changes.",
    date: "2024-01-12",
    lucidityLevel: 1,
    characteristics: ["nightmare"]
  },
  {
    id: "5",
    content: "Just a regular dream with no title. I was walking through a familiar neighborhood, but everything felt slightly off. The houses were different colors, and the streets were wider. I tried to find my way home, but every turn led me to an unfamiliar place. It wasn't scary, just disorienting. I eventually woke up feeling a bit confused but otherwise fine. No specific events stood out, just a general sense of being lost.",
    date: "2024-01-11",
    lucidityLevel: 0,
    characteristics: []
  }
]);
const streakInfo = ref({
  streak_length: 0,
  last_entry_date: null,
  days_since_last_entry: null,
  has_logged_today: false,
});
const isSubscribed = ref(false); // Set to true to hide the upgrade card
const insights = ref({
  topThemes: ["Flying", "Water", "Animals", "Transformation"],
  lucidityTrend: 75,
  averageMood: "Positive",
  tipOfDay: "Try reality checks throughout the day to increase lucid dreaming frequency."
});

const { getDreamStreakInfo } = useHome();

onMounted(async () => {
  streakInfo.value = await getDreamStreakInfo();
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
  if (streakInfo.value.days_since_last_entry <= 1) {
    return 'text-destructive';
  } else {
    return 'text-primary';
  }
});

const streakMessage = computed(() => {
  if (streakInfo.value.days_since_last_entry <= 1) {
    return 'Keep the momentum going!';
  } else if (streakInfo.value.streak_length === 0) {
    return 'Start your dream streak today!';
  } else {
    return 'Log a journal today to keep streak';
  }
});
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    
    <div class="relative z-10 min-h-screen text-foreground p-6">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Welcome Section -->
        <div class="text-center space-y-4 pt-16">
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Entries -->
          <div class="lg:col-span-2">
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
                <ScrollArea class="h-96">
                  <div class="space-y-4 pr-4">
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
          <div class="space-y-6">
            <!-- Journaling Streak -->
            <Card class="bg-card border-border">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-foreground">
                  <Flame :class="streakTextColorClass" />
                  Dream Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="text-center space-y-3">
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
            <Card v-if="!isSubscribed" class="bg-card border-warning">
              <CardHeader class="pb-3">
                <CardTitle class="flex items-center gap-2 text-foreground">
                  <Crown class="h-5 w-5 text-warning" />
                  Upgrade to Plus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div class="space-y-3">
                  <p class="text-muted-foreground text-sm">
                    Unlock AI-powered insights and unlimited entries
                  </p>
                  <ul class="text-xs text-muted-foreground space-y-1">
                    <li>• Advanced dream analysis</li>
                    <li>• Pattern recognition</li>
                    <li>• Personalized tips</li>
                  </ul>
                  <Button
                    size="sm"
                    class="w-full bg-warning hover:bg-warning/80 text-primary-foreground"
                    as-child
                  >
                    <NuxtLink to="/plus">
                      Learn More
                    </NuxtLink>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- AI Insights Grid -->
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Brain class="h-6 w-6 text-primary" />
            AI-Powered Insights
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              v-for="(card, index) in insightCards"
              :key="index"
              class="bg-card border-border hover:border-white transition-colors"
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for the home page here */
</style>