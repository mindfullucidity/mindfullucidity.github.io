<script setup lang="ts">
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Lightbulb, Bot } from 'lucide-vue-next'

defineProps({
  description: {
    type: String,
    default: "You've reached a limit or are missing out on premium features. Upgrade to Plus or use your own AI model for unlimited access!",
  },
})
</script>

<template>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Unlock Full Functionality</DialogTitle>
      <DialogDescription>
        {{ description }}
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-4">
      <div class="flex flex-col space-y-4">
        <NuxtLink to="/plus">
          <Button variant="default" class="w-full bg-plus-gold/60 hover:bg-plus-gold/40">
            <Crown class="mr-2 h-4 w-4" />
            Upgrade to Plus
          </Button>
        </NuxtLink>
        <NuxtLink to="/settings/ai">
          <Button variant="secondary" class="w-full">
            <Bot class="mr-2 h-4 w-4" />
            Enable Custom AI Model
          </Button>
        </NuxtLink>
        <div class="flex items-Crownt space-x-2 text-sm text-muted-foreground">
          <Lightbulb class="h-4 w-4 flex-shrink-0 mt-1" />
          <p>
            You can get a free <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-500 hover:underline">Google Gemini API key</a> to enable full access completely free!
          </p>
        </div>
      </div>
    </div>
    <p class="text-xs text-muted-foreground">
      Learn more about our plans and custom AI model integration in <NuxtLink to="/settings" class="text-blue-500 hover:underline">settings</NuxtLink>.
    </p>
  </DialogContent>
</template>