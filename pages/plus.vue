<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Crown, Lightbulb, Sparkles, Handshake } from 'lucide-vue-next'
import { onMounted } from 'vue'

definePageMeta({
  layout: 'default',
})

onMounted(() => {
  window.scrollTo(0, 0);
});
</script>

<template>
  <Title>MindfulLucidity Plus</Title>
  <div class="min-h-screen flex flex-col items-center justify-center text-foreground relative">
    <div class="relative z-10 w-full">
      <!-- Hero Section -->
      <section class="w-full py-12 md:py-24 lg:py-32 text-center">
        <div class="container mx-auto px-4 md:px-6">
          <div class="flex flex-col items-center space-y-4">
            <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none flex items-center justify-center gap-2  text-plus-gold">
              <Crown class="w-7 h-7 md:h-14 md:w-14 mb-2" />
              MindfulLucidity Plus
            </h1>
            <p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Gain unlimited access to advanced AI analysis, exclusive features, and directly support the future of MindfulLucidity.
            </p>
            <div class="flex justify-center space-x-4">
              <Button as-child class="bg-black hover:bg-black/50 text-white">
            <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
              Support on Patreon
            </a>
          </Button>
              <Button as-child variant="outline">
                <NuxtLink to="/settings/ai">Use Your Own API Key</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div class="container mx-auto px-4 md:px-6">
          <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
            What You Get with Plus
          </h2>
          <div class="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-2">
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Sparkles class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Unlimited AI Analysis</h3>
              <p class="leading-7 text-muted-foreground">
                Dive deep into your dreams with no limits on AI interpretations (Jungian, Symbolic, and more). Get comprehensive insights every time.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Crown class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Exclusive Features</h3>
              <p class="leading-7 text-muted-foreground">
                Access new and experimental features before anyone else. Be at the forefront of dream exploration technology.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Handshake class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Priority Support</h3>
              <p class="leading-7 text-muted-foreground">
                Get faster responses and dedicated assistance for any questions or issues you encounter.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Lightbulb class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">No API Key Needed</h3>
              <p class="leading-7 text-muted-foreground">
                Enjoy full functionality without the need to provide your own API key. We handle everything for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Custom AI Model Section -->
      <section class="w-full py-12 md:py-24 lg:py-32">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12">
            Unlock Full Capabilities for Free
          </h2>
          <p class="mx-auto max-w-[700px] md:text-xl">
            Don't want to subscribe to Plus? No problem! You can still access all premium AI analysis features by using your own AI Model API key. This option gives you complete control and full functionality without any cost.
          </p>
          <div class="flex items-start justify-center space-x-2 text-sm text-muted-foreground mx-auto max-w-[700px] mt-2 mb-6">
            <Lightbulb class="h-4 w-4 flex-shrink-0" />
            <p>
              You can get a free <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-500 hover:underline">Google Gemini API key</a> to enable full access completely free!
            </p>
          </div>
          <Button as-child variant="outline">
            <NuxtLink to="/settings/ai">
              Use Your Own API Key
            </NuxtLink>
          </Button>
        </div>
      </section>

      <!-- Support Section -->
      <section class="w-full py-12 md:py-24 lg:py-32 bg-card">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-12">
            Your Support Fuels Our Innovation
          </h2>
          <p class="mx-auto max-w-[700px] md:text-xl mb-8">
            By supporting MindfulLucidity on Patreon, you're not just getting premium features; you're becoming a vital part of our journey. Your contributions enable us to develop new features, maintain our services, and continue providing a powerful tool for dream exploration.
          </p>
          <p class="mx-auto max-w-[700px] md:text-lg mb-8 text-muted-foreground">
            Patreon supporters get exclusive access to beta features, direct input on our development roadmap, and a deeper connection with the MindfulLucidity team. Every bit of support helps us bring more clarity and insight to the world of dreams.
          </p>
          <Button as-child class="bg-black hover:bg-black/50 text-white">
            <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
              Support on Patreon
            </a>
          </Button>
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