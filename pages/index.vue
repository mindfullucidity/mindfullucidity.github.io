<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Timer, Crown, ZoomIn, Lightbulb } from 'lucide-vue-next'
import { onMounted } from 'vue'
import InstallPWAButton from '~/components/misc/InstallPWAButton.vue'


definePageMeta({
  layout: 'default',
})

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <Title>MindfulLucidity</Title>
  <div class="min-h-screen flex flex-col items-center justify-center text-foreground relative sm:mt-20">
    
    <div class="relative z-10 w-full">
    <!-- Hero Section -->
    <section class="w-full py-12 md:py-24 lg:py-32 text-center">
      <div class="container mx-auto px-4 md:px-6">
        <div class="flex flex-col items-center space-y-4">
          <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Unlock the Secrets of Your Dreams with AI-Powered Journaling
          </h1>
          <p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            MindfulLucidity helps you explore your subconscious through intuitive dream journaling and advanced AI analysis.
          </p>
          <div class="flex justify-center gap-4 flex-wrap">
            <InstallPWAButton />
            <Button as-child>
              <NuxtLink to="/register">Get Started</NuxtLink>
            </Button>
            <Button as-child variant="outline">
              <a href="https://github.com/mindfullucidity/mindfullucidity.github.io" target="_blank" rel="noopener noreferrer">
                <font-awesome :icon="['fab', 'github']" class="h-5 w-5 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Showcase -->
    <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div class="container mx-auto px-4 md:px-6">
        <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
          Key Features
        </h2>
        <div class="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3">
          <div class="rounded-lg bg-card p-5 border">
            <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
              <Timer class="size-6" />
            </span>
            <h3 class="mb-2 text-xl font-medium">Intuitive Dream Journaling</h3>
            <p class="leading-7 text-muted-foreground">
              Easily record your dreams with a user-friendly interface. Capture every detail of your dreams, from vivid imagery to subtle emotions, with our streamlined entry system.
            </p>
          </div>
          <div class="rounded-lg bg-card p-5 border">
            <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
              <Crown class="size-6" />
            </span>
            <h3 class="mb-2 text-xl font-medium">Advanced AI Analysis</h3>
            <p class="leading-7 text-muted-foreground">
              Gain deeper insights with AI-powered interpretations (Jungian, Symbolic, and more). Our intelligent AI helps you uncover hidden meanings and patterns in your dreams, offering unique perspectives.
            </p>
          </div>
          <div class="rounded-lg bg-card p-5 border">
            <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
              <ZoomIn class="size-6" />
            </span>
            <h3 class="mb-2 text-xl font-medium">Personal Insights & Self-Reflection</h3>
            <p class="leading-7 text-muted-foreground">
              Track your progress and reflect on your subconscious journey. Monitor lucidity levels, mood trends, and recurring themes to better understand yourself.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="w-full py-12 md:py-24 lg:py-32">
      <div class="container mx-auto px-4 md:px-6">
        <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
          How It Works
        </h2>
        <div class="flex flex-col md:flex-row items-center justify-center relative">
          <div class="flex flex-col items-center text-center space-y-4 md:w-1/3 relative z-10">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              1
            </div>
            <h3 class="text-xl font-semibold">Record Your Dream</h3>
            <p class="text-muted-foreground">Quickly jot down your dream details as soon as you wake up.</p>
          </div>
          <div class="hidden md:block absolute top-1/4 left-1/3 w-1/6 h-0.5 bg-primary -translate-x-1/2 z-0"></div>
          <div class="flex flex-col items-center text-center space-y-4 md:w-1/3 relative z-10">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              2
            </div>
            <h3 class="text-xl font-semibold">Get AI Analysis</h3>
            <p class="text-muted-foreground">Receive instant, in-depth analysis tailored to your dream.</p>
          </div>
          <div class="hidden md:block absolute top-1/4 left-2/3 w-1/6 h-0.5 bg-primary -translate-x-1/2 z-0"></div>
          <div class="flex flex-col items-center text-center space-y-4 md:w-1/3 relative z-10">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
              3
            </div>
            <h3 class="text-xl font-semibold">Gain Self-Awareness</h3>
            <p class="text-muted-foreground">Use insights to understand your inner world and personal growth.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- MindfulLucidity Plus Overview -->
    <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div class="container mx-auto px-4 md:px-6 text-center">
        <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-plus-gold flex items-center justify-center gap-2">
          <Crown class="h-10 w-10 text-plus-gold" />
          MindfulLucidity Plus
        </h2>
        <p class="mx-auto max-w-[700px] md:text-xl mb-8">
          MindfulLucidity Plus offers enhanced features and directly supports our development. You can still unlock full functionality for free by using your own API key with our Custom AI Model feature!
        </p>
        <p class="mx-auto max-w-[700px] md:text-lg mb-8 text-muted-foreground">
          Join our community on Patreon to get exclusive access to new features, behind-the-scenes content, and directly contribute to the future of MindfulLucidity. Your support helps us continue to innovate and provide the best dream journaling experience.
        </p>
        <div class="flex justify-center space-x-4">
          <Button as-child>
            <NuxtLink to="/plus">Learn More</NuxtLink>
          </Button>
          <Button as-child class="bg-black hover:bg-black/50 text-white">
            <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
              Support on Patreon
            </a>
          </Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="w-full py-6">
      <div class="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>&copy; 2025 Mindful Lucidity. All rights reserved.</p>
        <nav class="flex gap-4 sm:gap-6 mt-4 md:mt-0">
          <NuxtLink to="#" class="hover:underline">Privacy Policy</NuxtLink>
          <NuxtLink to="#" class="hover:underline">Terms of Service</NuxtLink>
        </nav>
      </div>
    </footer>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>