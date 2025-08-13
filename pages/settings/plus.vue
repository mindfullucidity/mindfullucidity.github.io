<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Crown, ExternalLink } from 'lucide-vue-next'
import { Lightbulb } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useSettings } from '@/composables/useSettings' // Import useSettings

definePageMeta({
  layout: 'settings',
})

const user = useSupabaseUser()
const { isPatreonLinked, togglePatreonLink } = useSettings() // Destructure from useSettings

const isPlusSubscriber = computed(() => user.value?.user_metadata?.user_role === 'plus')
const currentPrice = computed(() => {
  const amountCents = user.value?.user_metadata?.patreon_currently_entitled_amount_cents;
  if (amountCents === undefined || amountCents === null) return 'N/A';

  const amountDollars = (amountCents / 100).toFixed(2);
  let prefix = '';
  if (user.value?.user_metadata?.patreon_is_free_trial) {
    prefix = 'Free Trial - ';
  } else if (user.value?.user_metadata?.patreon_is_gifted) {
    prefix = 'Gifted - ';
  }
  return `${prefix}${amountDollars}/month`;
});

const renewalDate = computed(() => {
  const lastChargeDate = user.value?.user_metadata?.patreon_last_charge_date;
  if (!lastChargeDate) return 'N/A';

  const date = new Date(lastChargeDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
});

// New computed property to check if user is a Patreon member but not recognized as plus
const showRelinkMessage = computed(() => {
  return isPatreonLinked.value && user.value?.user_metadata?.user_role !== 'plus';
});

function handleManagePayment() {
  window.open('https://www.patreon.com/settings/memberships/MindfulLucidity', '_blank')
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
      <!-- Patreon Linking Section -->
      <Card v-if="!isPatreonLinked">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5" />
            Patreon Account
          </CardTitle>
          <CardDescription>
            {{ isPatreonLinked ? 'Your Patreon account is currently linked.' : 'Link your Patreon account to unlock MindfulLucidity Plus features.' }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-if="showRelinkMessage" class="bg-yellow-900/20 text-yellow-400 p-3 rounded-md text-sm flex items-center gap-2">
            <Lightbulb class="h-4 w-4 flex-shrink-0" />
            <p>
              If you are a Patreon supporter and your account is linked, but you're not recognized as a Plus member, please relink your account to refresh your status.
            </p>
          </div>
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Patreon Status:</Label>
              <p class="text-sm text-muted-foreground">
                {{ isPatreonLinked ? 'Linked' : 'Not Linked' }}
              </p>
            </div>
            <Button :variant="isPatreonLinked ? 'destructive' : 'outline'" @click="togglePatreonLink">
              {{ isPatreonLinked ? 'Unlink' : 'Link' }}
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <Button as-child class="bg-plus-gold/80 text-black hover:bg-plus-gold">
              <a href="https://patreon.com/MindfulLucidity" target="_blank" rel="noopener noreferrer">
                <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5 mr-2" />
                Support on Patreon
              </a>
            </Button>
            <Button as-child class="bg-plus-gold/80 text-black hover:bg-plus-gold">
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
            MindfulLucidity Plus
          </CardTitle>
          <CardDescription>
            Thank you for being a MindfulLucidity Plus member! You have full access to all premium features.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <p>
            Your membership is active. You can manage your membership below.
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
              Manage Membership
              <ExternalLink class="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
