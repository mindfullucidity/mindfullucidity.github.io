<template>
  <Title>Register | MindfulLucidity</Title>
  <div class="flex items-center justify-center min-h-screen bg-background ">
    <div class="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-xl shadow-black/50">
      <h2 class="text-2xl font-bold text-center text-foreground">Register</h2>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="displayName" class="block text-sm font-medium text-muted-foreground">Display Name</label>
          <Input id="displayName" v-model="displayName" type="text" required class="mt-1 block w-full" />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-muted-foreground">Email</label>
          <Input id="email" v-model="email" type="email" required class="mt-1 block w-full" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-muted-foreground">Password</label>
          <Input id="password" v-model="password" type="password" required class="mt-1 block w-full" />
        </div>
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-muted-foreground">Confirm Password</label>
          <Input id="confirmPassword" v-model="confirmPassword" type="password" required class="mt-1 block w-full" />
        </div>
        <Button type="submit" class="w-full">Register</Button>
      </form>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="px-2 text-muted-foreground bg-transparent">Or Continue With</span>
      </div>
      <GoogleButton type="Register" :on-click="signInWithGoogle" />
      <p class="text-center text-sm text-muted-foreground">
        Already have an account? <NuxtLink to="/login" class="text-primary hover:underline">Login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

import { ref } from 'vue'
import { useRouter } from 'vue-router'


import { Button } from '~/components/ui/button'
import GoogleButton from '~/components/GoogleButton.vue'

const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const supabase = useSupabaseClient()
const router = useRouter()

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match!');
    return;
  }
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: displayName.value,
        },
      },
    })
    if (error) throw error
    alert('Registration successful! Please check your email to confirm your account.')
    router.push('/')
  } catch (error: any) {
    alert(error.message)
  }
}

const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
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