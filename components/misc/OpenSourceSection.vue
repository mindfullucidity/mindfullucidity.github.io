<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
</script>

<template>
  <section class="w-full py-12 md:py-24 lg:py-32">
    <div class="container mx-auto px-4 md:px-6 text-center">
      <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
        Open Source & Community Driven
      </h2>
      <p class="mx-auto max-w-[800px] md:text-xl mb-4 text-muted-foreground">
        We are an open community dedicated to making spiritual awakening tools accessible to all. We welcome pull requests and encourage you to run MindfulLucidity locally for complete autonomy over your data and experience.
      </p>
      <div class="flex justify-center gap-6 flex-wrap mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <a href="https://docs.github.com/en/pages" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center">
                <img src="/opensource/github_pages.png" alt="GitHub Logo" class="h-8 w-8" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>GitHub Pages</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <a href="https://nuxt.com/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center">
                <img src="/opensource/nuxt.png" alt="Nuxt.js Logo" class="h-8 w-8" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Nuxt.js</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center">
                <img src="/opensource/tailwindcss.svg" alt="Tailwind CSS Logo" class="h-8 w-8" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tailwind CSS</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center">
                <img src="/opensource/supabase.png" alt="Supabase Logo" class="h-8 w-8" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>Supabase</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div class="flex justify-center gap-6 flex-wrap mb-4">
        <Button variant="outline">
          <a href="https://github.com/mindfullucidity/mindfullucidity.github.io" target="_blank" rel="noopener noreferrer">
            <font-awesome :icon="['fab', 'github']" class="h-5 w-5 mr-2" />
            GitHub
          </a>
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Add any specific styles here if needed */
</style>