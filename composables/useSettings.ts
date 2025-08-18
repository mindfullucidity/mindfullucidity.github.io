import { ref, watch, onMounted, computed } from 'vue'
import { useSupabaseClient, useSupabaseUser, useRoute, navigateTo } from '#imports'
import { toast } from 'vue-sonner'

export function useSettings() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const route = useRoute()
  const config = useRuntimeConfig()

  const displayName = ref('')
  const originalDisplayName = ref('')
  const email = ref('')
  const gender = ref<'Male' | 'Female' | 'Other' | 'Prefer Not To Say' | 'Unknown'>('Unknown')
  const originalGender = ref<'Male' | 'Female' | 'Other' | 'Prefer Not To Say' | 'Unknown'>('Unknown')
  const isDeletingAccount = ref(false)

  const isPatreonLinked = computed(() => !!user.value?.user_metadata?.patreon_id)

  watch(user, (newUser) => {
    if (newUser) {
      displayName.value = newUser.user_metadata?.full_name || newUser.email || ''
      email.value = newUser.email || ''
      gender.value = newUser.user_metadata?.gender || 'Unknown'
      originalDisplayName.value = displayName.value
      originalGender.value = gender.value
    }
  }, { immediate: true })

  const hasChanges = computed(() => {
    return displayName.value !== originalDisplayName.value || gender.value !== originalGender.value
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
            patreon_status: null,
            patreon_currently_entitled_amount_cents: null,
            patreon_will_pay_amount_cents: null,
            patreon_next_charge_date: null,
            patreon_is_free_trial: null,
            patreon_is_gifted: null,
            patreon_last_charge_date: null,
            user_role: null,
          },
        })
        if (error) throw error
        // Force a session refresh to get updated user_metadata
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          toast.error('Failed to refresh session after unlinking Patreon', {
            description: refreshError.message,
          })
        } else {
          toast.success('Patreon unlinked!')
        }
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

  async function saveProfileChanges() {
    try {
      const updates: { full_name?: string; gender?: string | null } = {}
      let changesMade = false

      if (displayName.value !== originalDisplayName.value) {
        updates.full_name = displayName.value
        changesMade = true
      }

      if (gender.value !== originalGender.value) {
        updates.gender = gender.value === 'Unknown' ? null : gender.value
        changesMade = true
      }

      if (!changesMade) {
        toast.info('No changes to save.')
        return
      }

      const { error } = await supabase.auth.updateUser({
        data: updates,
      })
      if (error) throw error

      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        toast.error('Failed to refresh session after updating profile', {
          description: refreshError.message,
        })
      } else {
        toast.success('Profile updated!', {
          description: 'Your profile information has been successfully updated.',
        })
        originalDisplayName.value = displayName.value
        originalGender.value = gender.value
      }
    } catch (error: any) {
      toast.error('Error updating profile', {
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
    isDeletingAccount.value = true;
    try {
      const { data, error } = await supabase.functions.invoke('delete_user_account', {
        method: 'POST', // Edge Functions typically expect POST for actions
      });

      if (error) {
        console.error('Error invoking delete_user_account Edge Function:', error);
        throw new Error(error.message);
      }

      // Assuming the Edge Function returns a success message
      toast.success('Account deleted', {
        description: data.message || 'Your account and all associated data have been successfully deleted.',
      });

      // Redirect to home page after successful deletion
      await supabase.auth.signOut(); // Sign out the user from Supabase session
      await navigateTo('/'); 

    } catch (error: any) {
      toast.error('Error deleting account', {
        description: error.message,
      });
    } finally {
      isDeletingAccount.value = false;
    }
  }

  return {
    displayName,
    email,
    gender,
    originalDisplayName,
    originalGender,
    hasChanges,
    isPatreonLinked,
    togglePatreonLink,
    saveProfileChanges,
    logout,
    deleteAccount,
    isDeletingAccount,
  }
}
