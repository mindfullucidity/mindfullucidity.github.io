<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JournalEntryCard from '@/components/journal/sidebar/JournalEntryCard.vue';

const user = useSupabaseUser();

// Placeholder for recent entries
const recentEntries = ref([
  { id: '1', title: 'Dream about flying', date: '2025-08-04', description: 'I was flying over a vast ocean, feeling incredibly free.' },
  { id: '2', title: 'Nightmare in a dark forest', date: '2025-08-03', description: 'Lost in a dark forest, chased by shadows.' },
  { id: '3', title: 'Meeting a wise old man', date: '2025-08-02', description: 'A conversation with a wise old man who gave me cryptic advice.' },
]);

// Placeholder for AI insights
const aiInsights = ref({
  topThemes: ['Flying', 'Chasing', 'Guidance'],
  lucidityTrend: 'Stable',
  moodSnapshot: 'Mixed (Joy, Fear, Curiosity)',
  dreamTip: 'Pay attention to recurring symbols in your dreams. They often hold significant meaning.',
});

// Placeholder for journaling streak
const journalingStreak = ref(7); // Example streak

// Subscription status based on user's app_metadata
const isPlusSubscriber = computed(() => user.value?.app_metadata?.user_role === 'plus');
</script>

<template>
  <div class="container mx-auto p-4 text-dracula-foreground min-h-screen pt-16 overflow-y-auto">
    <h1 class="text-4xl font-bold mb-6 text-dracula-purple">Welcome back, Dreamer!</h1>

    <!-- Quick Journal Entry -->
    <Card class="mb-8 bg-dracula-background border-dracula-selection">
      <CardHeader>
        <CardTitle class="text-dracula-cyan">Start a New Dream</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="mb-4 text-dracula-comment">Ready to record your latest adventure?</p>
        <Button as-child class="bg-dracula-green hover:bg-dracula-green/80 text-dracula-background">
          <NuxtLink to="/journal/new">New Journal Entry</NuxtLink>
        </Button>
      </CardContent>
    </Card>

    <!-- Recent Entries Overview -->
    <Card class="mb-8 bg-dracula-background border-dracula-selection">
      <CardHeader>
        <CardTitle class="text-dracula-cyan">Your Recent Dreams</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="recentEntries.length > 0" class="space-y-4">
          <JournalEntryCard
            v-for="entry in recentEntries"
            :key="entry.id"
            :entry="entry"
            class="bg-dracula-current-line border-dracula-selection"
          />
        </div>
        <p v-else class="text-dracula-comment">No recent entries. Start your first dream journal today!</p>
      </CardContent>
    </Card>

    <!-- AI-Powered Insights Summary -->
    <Card class="mb-8 bg-dracula-background border-dracula-selection">
      <CardHeader>
        <CardTitle class="text-dracula-cyan">AI-Powered Insights</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <h3 class="font-semibold text-dracula-orange">Your Top Dream Themes:</h3>
          <p class="text-dracula-comment">{{ aiInsights.topThemes.join(', ') }}</p>
        </div>
        <div>
          <h3 class="font-semibold text-dracula-orange">Lucidity Level Trends:</h3>
          <p class="text-dracula-comment">{{ aiInsights.lucidityTrend }}</p>
        </div>
        <div>
          <h3 class="font-semibold text-dracula-orange">Mood Analysis Snapshot:</h3>
          <p class="text-dracula-comment">{{ aiInsights.moodSnapshot }}</p>
        </div>
        <div>
          <h3 class="font-semibold text-dracula-orange">Dream Tip of the Day:</h3>
          <p class="italic text-dracula-comment">"{{ aiInsights.dreamTip }}"</p>
        </div>
      </CardContent>
    </Card>

    <!-- Journaling Streak/Reminders -->
    <Card class="mb-8 bg-dracula-background border-dracula-selection">
      <CardHeader>
        <CardTitle class="text-dracula-cyan">Journaling Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-dracula-comment">You've been journaling for <span class="font-bold text-dracula-pink">{{ journalingStreak }}</span> consecutive days!</p>
        <p class="text-dracula-comment mt-2">Keep up the great work!</p>
      </CardContent>
    </Card>

    <!-- Subscription Status/Upgrade Prompt -->
    <Card v-if="!isPlusSubscriber" class="mb-8 bg-dracula-background border-dracula-selection">
      <CardHeader>
        <CardTitle class="text-dracula-cyan">Unlock More with MindfulLucidity Plus</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="mb-4 text-dracula-comment">Upgrade to Plus for advanced features, or use your own Google Gemini API key for full functionality!</p>
        <Button as-child class="bg-dracula-purple hover:bg-dracula-purple/80 text-dracula-background mr-2">
          <NuxtLink to="/settings/plus">Learn More</NuxtLink>
        </Button>
        <Button as-child variant="outline" class="border-dracula-purple text-dracula-purple hover:bg-dracula-purple/10">
          <NuxtLink to="/settings/ai">Use Your Own API Key</NuxtLink>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
/* Add any specific styles for the home page here */
</style>
