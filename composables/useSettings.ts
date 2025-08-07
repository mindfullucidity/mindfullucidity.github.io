import { ref, watch, onMounted, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser, useRoute, navigateTo } from '#imports'
import { toast } from 'vue-sonner'

export function useSettings() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const route = useRoute()
  const config = useRuntimeConfig()

  const displayName = ref('')
  const email = ref('')

  const isPatreonLinked = computed(() => !!user.value?.user_metadata?.patreon_id)

  watch(user, (newUser) => {
    if (newUser) {
      displayName.value = newUser.user_metadata?.full_name || newUser.email || ''
      email.value = newUser.email || ''
    }
  }, { immediate: true })

  onMounted(async () => {
    if (route.query.patreonLinked === 'true') {
      // This means we've just returned from Patreon OAuth
      // Force a session refresh to get updated user_metadata
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        toast.error('Failed to refresh session', {
          description: error.message,
        })
      } else {
        // Clean up the URL
        const url = new URL(window.location.href)
        url.searchParams.delete('patreonLinked')
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  })

  async function togglePatreonLink() {
    if (isPatreonLinked.value) {
      // Unlink Patreon
      try {
        const { error } = await supabase.auth.updateUser({
          data: {
            patreon_access_token: null,
            patreon_refresh_token: null,
            patreon_expires_at: null,
            patreon_id: null,
            patreon_email: null,
            patreon_name: null,
          },
        })
        if (error) throw error
        toast.success('Patreon unlinked!')
      } catch (error: any) {
        toast.error('Error unlinking Patreon', {
          description: error.message,
        })
      }
    } else {
      // Link Patreon
      const patreonClientId = config.public.patreonClientId
      const patreonRedirectUri = config.public.patreonRedirectUri
      const patreonScope = 'identity%5Bemail%5D+identity' // Request email and basic identity
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('You must be logged in to link Patreon.')
        return
      }
      const state = encodeURIComponent(JSON.stringify({ supabaseAccessToken: session.access_token, returnTo: window.location.href }))
      const patreonAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${patreonClientId}&redirect_uri=${encodeURIComponent(patreonRedirectUri)}&scope=${patreonScope}&state=${state}`
      window.location.href = patreonAuthUrl
    }
  }

  async function updateDisplayName() {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.value },
      })
      if (error) throw error
      toast.success('Display name updated!', {
        description: 'Your display name has been successfully updated.',
      })
    } catch (error: any) {
      toast.error('Error updating display name', {
        description: error.message,
      })
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      await navigateTo('/redirect?to=/&logout=true')
    } catch (error: any) {
      toast.error('Error logging out', {
        description: error.message,
      })
    }
  }

  async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    try {
      // Supabase does not directly expose a client-side function to delete a user's account for security reasons.
      // This typically needs to be handled on the backend (e.g., via a Supabase Edge Function or a custom API endpoint)
      // that has the appropriate service role key to call the Admin API.
      // For this example, we'll simulate it or provide a placeholder.
      // In a real application, you would call an Edge Function here.
      toast.error('Account deletion initiated', {
        description: 'Please contact support to complete account deletion. This feature is not yet implemented client-side.',
      })
      // Example of how you might call an Edge Function:
      // const { data, error } = await supabase.functions.invoke('delete-user-account', {
      //   body: { userId: user.value?.id },
      // });
      // if (error) throw error;
      // await navigateTo('/register'); // Redirect after successful deletion
    } catch (error: any) {
      toast.error('Error deleting account', {
        description: error.message,
      })
    }
  }

  return {
    displayName,
    email,
    isPatreonLinked,
    togglePatreonLink,
    updateDisplayName,
    logout,
    deleteAccount,
  }
}
