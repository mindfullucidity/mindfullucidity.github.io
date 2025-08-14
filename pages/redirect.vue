<script setup lang="ts">
console.log('Redirect Page: Script Setup Running');
definePageMeta({
  layout: false,
});

import { useSupabaseUser } from '#imports'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHome } from '~/composables/useHome';

const route = useRoute()
const user = useSupabaseUser()
const router = useRouter()
const { clearCache } = useHome()

const redirectTo = computed(() => route.query.to?.toString() || '/home')
const hasCodeArg = computed(() => typeof route.query.code !== 'undefined')
const isLogoutRedirect = computed(() => route.query.logout === 'true')

const supabase = useSupabaseClient()
const isLoading = ref(true)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()

  if (hasCodeArg.value) {
    // If 'code' argument is present, wait for session to exist (login flow)
    if (session?.user) {
      localStorage.setItem('isAuthenticated', 'true')
      router.replace(redirectTo.value)
    } else {
      // If no session after code, it might be an error or not fully processed yet
      // We can add a timeout or retry mechanism here if needed, or redirect to login
      router.replace('/login')
    }
  } else if (isLogoutRedirect.value) {
    // If 'logout=true' argument is present, wait for session to be null (logout flow)
    if (!session?.user) {
      localStorage.removeItem('isAuthenticated')
      clearCache()
      router.replace(redirectTo.value)
    } else {
      // If session still exists after logout, something went wrong
      router.replace('/home') // Or a more appropriate error page
    }
  } else {
    // Default behavior if no specific arguments are given
    // This might be for cases where the redirect page is visited directly without specific intent
    router.replace(redirectTo.value)
  }
  isLoading.value = false
})

</script>

<template>
  <div class="flex items-center justify-center min-h-screen text-foreground">
    <Card class="w-[350px]">
      <CardHeader>
        <CardTitle>Redirecting<span class="animated-ellipsis"></span></CardTitle>
        <CardDescription>Please wait while we redirect you.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This page will automatically redirect you to the correct destination.</p>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.animated-ellipsis::after {
  content: '.';
  animation: ellipsis-dot 1.5s infinite;
}

@keyframes ellipsis-dot {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: '.'; }
}
</style>
