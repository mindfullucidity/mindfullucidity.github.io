<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { NuxtLink } from '#components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Crown, Lightbulb } from 'lucide-vue-next';

const props = defineProps<{
  isSubscribed: boolean;
}>();
</script>

<template>
  <Card v-if="!props.isSubscribed" class="bg-card border-plus-gold grid-cols-1">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-plus-gold">
        <Crown class="h-5 w-5" />
        MindfulLucidity Plus
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        <p class="text-muted-foreground text-sm">
          Gain unlimited access to advanced AI analysis, and directly support the future of MindfulLucidity.
        </p>
        <div class="flex flex-col gap-2">
          <Button
            class="w-full"
            as-child
          >
            <NuxtLink to="/plus">
              Learn More
            </NuxtLink>
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="w-full"
            as-child
          >
            <NuxtLink to="/settings/ai">
              Use Your Own API Key
            </NuxtLink>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
  <Card v-else class="bg-card border-plus-gold hidden md:flex flex-col justify-between md:h-full relative">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-plus-gold">
        <Crown class="h-5 w-5" />
        MindfulLucidity Plus 
      </CardTitle>
      <CardDescription class="text-muted-foreground text-sm">
        Thank you for being a Plus Subscriber! You have full access to all MindfulLucidity Plus features.
      </CardDescription>
    </CardHeader>
    <CardContent class="flex-grow">
      <div class="space-y-3">
      </div>
    </CardContent>
    <CardFooter class="flex justify-between absolute bottom-0 left-0 right-0 p-6">
      <Button
        size="sm"
        class="w-full"
        as-child
      >
        <NuxtLink to="/settings/plus">
          Manage Subscription
        </NuxtLink>
      </Button>
    </CardFooter>
  </Card>
</template>

<style scoped>
/* Add any specific styles for the HomePlusCard here */
</style>