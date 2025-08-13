<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Crown, Lightbulb, Sparkles, Handshake, Unlock, Code } from 'lucide-vue-next'
import AppFooter from '~/components/misc/AppFooter.vue'
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
      <section class="w-full py-12 md:py-20 lg:py-26 text-center">
        <div class="container mx-auto px-4 md:px-6">
          <div class="flex flex-col items-center space-y-4">
            <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none flex items-center justify-center gap-2  text-plus-gold">
              <Crown class="w-7 h-7 md:h-14 md:w-14 mb-2" />
              MindfulLucidity Plus
            </h1>
            <p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Support the MindfulLucidity community and development. Gain full unlimited access, or unlock full capability for free by using your own AI API Key.
            </p>
            <div class="flex justify-center gap-4 flex-wrap">
              <Button as-child class="bg-plus-gold/80 text-black hover:bg-plus-gold">
            <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
              Support on Patreon
            </a>
          </Button>
              <Button as-child class="bg-black hover:bg-black/50 text-white">
            <NuxtLink to="/settings/plus">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
              Link Patreon Account
            </NuxtLink>
          </Button>
              <Button as-child variant="outline">
                <NuxtLink to="/settings/ai">Use Your Own API Key</NuxtLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <!-- What Your Membership Does Section -->
      <section class="w-full py-12 md:py-20 lg:py-26 bg-card">
        <div class="container mx-auto px-4 md:px-6">
          <h2 class="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
            What Your Membership Does
          </h2>
          <div class="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-2">
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Sparkles class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Unlimited AI Analysis</h3>
              <p class="leading-7 text-muted-foreground">
                Gain full access to advanced AI analysis without limits. Explore Jungian, Symbolic, and other interpretations to deepen your understanding of your dreams.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Unlock class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">No API Key Needed</h3>
              <p class="leading-7 text-muted-foreground">
                Enjoy the convenience of full functionality without needing to provide your own AI API key. We cover the costs, making it easier for you to dive into dream analysis.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Handshake class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Support the Community</h3>
              <p class="leading-7 text-muted-foreground">
                Your membership helps us keep MindfulLucidity accessible to everyone, fostering a vibrant community of dream explorers and spiritual seekers.
              </p>
            </div>
            <div class="rounded-lg bg-card p-5 border">
              <span class="mb-4 flex size-12 items-center justify-center rounded-full bg-primary">
                <Code class="size-6" />
              </span>
              <h3 class="mb-2 text-xl font-medium">Support Development</h3>
              <p class="leading-7 text-muted-foreground">
                Your contributions directly fund ongoing development, allowing us to build new features, improve existing ones, and ensure the long-term sustainability of MindfulLucidity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Unlock Full Capabilities for Free Section -->
      <section class="w-full py-12 md:py-20 lg:py-26">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
            Unlock Full Capabilities for Free
          </h2>
          <p class="mx-auto max-w-[700px] md:text-xl  text-muted-foreground">
            You can unlock all of MindfulLucidity's powerful AI analysis features completely free by using your own AI API key. This option provides you with full control and functionality without any subscription.
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

      <!-- Become a Member Section -->
      <section class="w-full py-12 md:py-20 lg:py-26 bg-card">
        <div class="container mx-auto px-4 md:px-6 text-center">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none flex items-center justify-center gap-2  text-plus-gold mb-4">
            <Crown class="w-6 h-6 md:h-12 md:w-12 mb-2" />
            Become a Member
          </h2>
          <p class="mx-auto max-w-[700px] md:text-xl mb-8  text-muted-foreground">
            We are incredibly grateful for your generosity. By becoming a member on Patreon, you are directly supporting the MindfulLucidity community and its ongoing development. Your contributions enable us to maintain and improve the platform, ensuring it remains a valuable resource for everyone on their spiritual journey.
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
      <AppFooter />
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>