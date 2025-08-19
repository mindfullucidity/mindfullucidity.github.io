<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Timer, Crown, ZoomIn, Lightbulb } from 'lucide-vue-next'
import { onMounted } from 'vue'
import InstallPWAButton from '~/components/misc/InstallPWAButton.vue'
import AppFooter from '~/components/misc/AppFooter.vue'
import HowItWorks from '~/components/misc/HowItWorks.vue'
import OpenSourceSection from '~/components/misc/OpenSourceSection.vue'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const runtimeConfig = useRuntimeConfig();
const patreonClientId = runtimeConfig.public.patreonClientId;
const patreonRedirectUri = runtimeConfig.public.patreonRedirectUri;

const { $pwa } = useNuxtApp();

definePageMeta({
  layout: 'default',
})

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <Title>MindfulLucidity</Title>
  <div class="min-h-screen flex flex-col items-center justify-center text-foreground relative sm:mt-10">
    <div class="relative z-10 w-full">

      <!-- Hero Section -->
      <section class="w-full py-20 md:py-40 lg:py-60 text-center">
        <div class="container mx-auto px-4 md:px-6">
          <div class="flex flex-col items-center space-y-4">
            <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Awaken Your Inner Universe
            </h1>
            <p class="mx-auto max_w-[700px] text-muted-foreground md:text-xl">
              Deepen your self-understanding through profound interactions with your dreams.
            </p>
            <div class="flex justify-center gap-4 flex-wrap">
              <template v-if="!$pwa?.isPWAInstalled">
                <InstallPWAButton />
                <Button>
                  <NuxtLink to="/register">Get Started</NuxtLink>
                </Button>
              </template>
              
            </div>
          </div>
        </div>
      </section>


      <!-- How it works -->
      <HowItWorks class=" bg-card" />

      <!-- Features -->
      <section class="w-full py-12 md:py-24 lg:py-32">
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
                Easily record and organize your dream experiences with a user-friendly interface designed to capture every detail, from vivid imagery to subtle emotions.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Lightbulb class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Advanced AI Dream Analysis</h3>
              <p class="leading-7 text-muted-foreground">
                Gain profound insights into your dreams with our cutting-edge AI, offering interpretations that delve into symbolism, psychological implications, and connections to your waking life.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Crown class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Custom AI Model Integration</h3>
              <p class="leading-7 text-muted-foreground">
                Unlock full access to all AI features by integrating your own AI API key, giving you complete control and autonomy over your data and analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Mission Statement -->
      <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Our Mission
          </h2>
          <p class="mx-auto max-w-[800px] text-muted-foreground md:text-xl">
            To foster spiritual awakening by helping individuals gain insight into their unconscious mind and its patterns, supported by powerful analysis. Our platform empowers users to practice lucid dreaming, offering a direct connection to the unconscious during sleep for accelerated personal integration and realization.
          </p>
        </div>
      </section>

      <!-- Open Source -->
      <OpenSourceSection />

      <!-- MindfulLucidity Plus -->
      <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4 text-plus-gold flex items-center justify-center gap-2">
            <Crown class="h-10 w-10 text-plus-gold" />
            MindfulLucidity Plus
          </h2>
          <p class="mx-auto max-w-[700px] md:text-xl mb-8">
            Become a member for just $5/month to help support others on their spiritual journey and contribute to the ongoing development of MindfulLucidity. Your contributions directly fund new features and help us maintain the ability to grant full access to all users, regardless of their membership status.
          </p>
          <div class="flex justify-center space-x-4">
            <Button as-child class="bg-black hover:bg-card">
              <NuxtLink to="/plus">Learn More</NuxtLink>
            </Button>
            <Button as-child class="bg-plus-gold/80 text-black hover:bg-plus-gold">
              <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
                <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
                Support on Patreon
              </a>
            </Button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>