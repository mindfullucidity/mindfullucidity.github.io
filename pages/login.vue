<template>
  <Title>Login | MindfulLucidity</Title>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div v-if="isLoading" class="flex items-center justify-center w-full h-full">
      <div class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
    <div v-else class="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border">
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

import { ref, onMounted, computed, onUnmounted, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'


import { Button } from '~/components/ui/button'
import GoogleButton from '~/components/GoogleButton.vue'

const email = ref('')
const password = ref('')
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const isLoading = ref(true); // Initially true for loading state
const user = useSupabaseUser(); // Get the Supabase user

const redirectToPath = computed(() => {
  let path = route.query.to?.toString() || '/home';
  const hash = route.hash;

  // Append the hash if it exists and the path doesn't already contain one
  if (hash && !path.includes('#')) {
    path += hash;
  }
  return path;
});

let authListener: any; // To store the subscription

onMounted(() => {
  isLoading.value = true;
  let authResolved = false;
  let minTimePassed = false;

  const resolveLoading = async () => {
    if (authResolved && minTimePassed) {
      if (user.value) {
        // If user exists, initiate navigation and wait for it
        await navigateTo(redirectToPath.value);
        setTimeout(async () => {
          isLoading.value = false;
        }, 2000);
      }
      else{
        isLoading.value = false;
      }
    }
  };

  // Minimum display time for the spinner
  setTimeout(async () => {
    minTimePassed = true;
    await resolveLoading();
  }, 300); // 300ms minimum display time

  // Listen for auth state changes
  authListener = supabase.auth.onAuthStateChange((event, session) => {
    authResolved = true;
    if (session?.user) {
      user.value = session.user; // Ensure user ref is updated
    } else {
      user.value = null; // Explicitly set to null if no user
    }
    resolveLoading();
  });

  // Immediate check for already resolved auth state
  if (user.value !== undefined) {
    authResolved = true;
    resolveLoading();
  }
});

onUnmounted(() => {
  // Clean up the listener when the component is unmounted
  if (authListener) {
    authListener.data.subscription?.unsubscribe();
  }
});

const handleLogin = async () => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    localStorage.setItem('isAuthenticated', 'true')
    navigateTo(`/redirect?to=${redirectToPath.value}`)
  } catch (error: any) {
    toast.error(error.message)
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
    toast.error(error.message)
  }
}
</script>

<style scoped>
/* Add any specific styles for this page here */
</style>