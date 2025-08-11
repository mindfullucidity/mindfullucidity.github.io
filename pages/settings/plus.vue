<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Crown, ExternalLink } from 'lucide-vue-next'
import { Lightbulb } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'settings',
})

const user = useSupabaseUser()

const isPlusSubscriber = computed(() => user.value?.user_metadata?.user_role === 'plus')
const currentPrice = ref('$5/month') // This would come from your user's subscription data
const renewalDate = ref('August 5, 2026') // This would come from your user's subscription data

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
            <Crown class="h-5 w-5 text-plus-gold" />
            MindfulLucidity Plus
          </CardTitle>
          <CardDescription>
            Unlock full functionality and enhance your dream journaling experience with MindfulLucidity Plus.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p>
            MindfulLucidity Plus is our way of saying thank you to our dedicated supporters on Patreon. By becoming a patreon, you gain access to all premium features, ensuring you have the best possible experience while directly contributing to the growth and development of MindfulLucidity.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button as-child class="bg-black hover:bg-black/50 text-white">
              <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
                <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
                Support on Patreon
              </a>
            </Button>
            <Button as-child variant="default">
              <NuxtLink to="/plus">Learn More</NuxtLink>
            </Button>
          </div>
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
            <Crown class="h-5 w-5 text-plus-gold" />
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
            <Card class="p-4 bg-transparent">
              <CardHeader class="gap-0 p-0">
                <CardTitle class="text-sm text-muted-foreground font-normal">Current Plan</CardTitle>
                <CardDescription class="text-lg font-bold text-white">
                  {{ currentPrice }}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card class="p-4 bg-transparent">
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
