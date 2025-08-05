<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Zap, ExternalLink } from 'lucide-vue-next'
import { Lightbulb } from 'lucide-vue-next'

definePageMeta({
  layout: 'settings',
})

const isPlusSubscriber = ref(true) // This would come from your user's subscription status
const currentPrice = ref('$5/month') // This would come from your user's subscription data
const renewalDate = ref('August 5, 2026') // This would come from your user's subscription data

function handleUnsubscribe() {
  // Logic to handle unsubscription
  console.log('Unsubscribe clicked')
  isPlusSubscriber.value = false // For demonstration
}

function handleManagePayment() {
  // Logic to redirect to payment management portal
  console.log('Manage Payment clicked')
  window.open('https://example.com/manage-payment', '_blank') // Replace with actual payment portal URL
}
</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">MindfulLucidity Plus</h2>
      <p class="text-muted-foreground mt-2">
        Unlock full functionality and enhance your dream journaling experience.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="space-y-6">
      <Card v-if="!isPlusSubscriber">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-plus-gold">
            <Zap class="h-5 w-5 text-plus-gold" />
            Go Plus
          </CardTitle>
          <CardDescription>
            Unlock full functionality and enhance your dream journaling experience with MindfulLucidity Plus.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p>
            You may experience the full capabilities without Plus, through the use of your own API keys with our Custom AI Model feature. Plus users do not need to add their own API keys, as they get full access regardless. Plus is mostly for people who want to support this project.
          </p>
          <Button>Upgrade to Plus ($5/month)</Button>
          <div class="flex items-start space-x-2 text-sm text-muted-foreground">
            <Lightbulb class="h-4 w-4 flex-shrink-0 mt-1" />
            <p>
              You can get a free <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-500 hover:underline">Google Gemini API key</a> to enable full access completely free, by enabling Custom AI Model in <NuxtLink to="/settings/ai" class="text-blue-500 hover:underline">Settings</NuxtLink>!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card v-else>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-plus-gold">
            <Zap class="h-5 w-5 text-plus-gold" />
            MindfulLucidity Plus Subscriber
          </CardTitle>
          <CardDescription>
            Thank you for being a MindfulLucidity Plus subscriber! You have full access to all premium features.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p>
            Your subscription is active. You can manage your subscription or unsubscribe below.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card class="p-4">
              <CardHeader class="gap-0 p-0">
                <CardTitle class="text-sm text-muted-foreground font-normal">Current Plan</CardTitle>
                <CardDescription class="text-lg font-bold text-white">
                  {{ currentPrice }}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card class="p-4">
              <CardHeader class="gap-0 p-0">
                <CardTitle class="text-sm text-muted-foreground font-normal">Renew at</CardTitle>
                <CardDescription class="text-lg font-bold text-white">
                  {{ renewalDate }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" @click="handleUnsubscribe">Unsubscribe</Button>
            <Button variant="outline" @click="handleManagePayment">
              Manage Payment
              <ExternalLink class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
