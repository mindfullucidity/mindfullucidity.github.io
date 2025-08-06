<template>
  <Title>Login | MindfulLucidity</Title>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border">
      <h2 class="text-2xl font-bold text-center text-foreground">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-muted-foreground">Email</label>
          <Input id="email" v-model="email" type="email" required class="mt-1 block w-full" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-muted-foreground">Password</label>
          <Input id="password" v-model="password" type="password" required class="mt-1 block w-full" />
        </div>
        <Button type="submit" class="w-full">Login</Button>
      </form>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="px-2 text-muted-foreground bg-transparent">Or Continue With</span>
      </div>
      <GoogleButton type="Log In" :on-click="signInWithGoogle" />
      <p class="text-center text-sm text-muted-foreground">
        Don't have an account? <NuxtLink :to="{ path: '/register', query: { to: redirectToPath } }" class="text-primary hover:underline">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'


import { Button } from '~/components/ui/button'
import GoogleButton from '~/components/GoogleButton.vue'

const email = ref('')
const password = ref('')
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const redirectToPath = computed(() => route.query.to?.toString() || '/home');

const handleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    navigateTo(`/redirect?to=${redirectToPath.value}`)
  } catch (error: any) {
    alert(error.message)
  }
}

const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/redirect?to=${redirectToPath.value}`,
      },
    })
    if (error) throw error
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<style scoped>
/* Add any specific styles for this page here */
</style>