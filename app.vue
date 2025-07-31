<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const user = useSupabaseUser()
const router = useRouter()

// This watcher will run immediately and whenever the user's state changes.
watch(user, (currentUser, previousUser) => {
  // This check is crucial. It prevents the watcher from running on initial load
  // before the user's state is definitively known.
  if (previousUser === undefined && currentUser === null) {
    return
  }

  if (currentUser) {
    // If user is logged in, redirect them away from login/register pages.
    if (router.currentRoute.value.path === '/login' || router.currentRoute.value.path === '/register') {
      router.push('/home')
    }
  } else {
    // If user is logged out, redirect to login unless they are on a public page.
    const unprotectedRoutes = ['/', '/login', '/register']
    if (!unprotectedRoutes.includes(router.currentRoute.value.path)) {
      router.push('/login')
    }
  }
}, { immediate: true })
</script>

<template>
  <!-- The v-if ensures that we don't render the page until the user state is known -->
  <!-- This prevents the flicker or redirect to the login page -->
  <div v-if="user !== undefined">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>
