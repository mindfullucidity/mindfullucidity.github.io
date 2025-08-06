<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'vue-sonner'
import { LogOut, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'settings',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()


const displayName = ref('')
const email = ref('')

watch(user, (newUser) => {
  if (newUser) {
    displayName.value = newUser.user_metadata?.full_name || newUser.email || ''
    email.value = newUser.email || ''
  }
}, { immediate: true })

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
</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Profile Settings</h2>
      <p class="text-muted-foreground mt-2">
        Manage your public profile information and account settings.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="displayName">Display Name</Label>
            <Input
              id="displayName"
              v-model="displayName"
              placeholder="Your display name"
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              disabled
              placeholder="Your email address"
            />
            <p class="text-sm text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
          <div class="flex justify-end">
            <Button @click="updateDisplayName">Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            Account Management
          </CardTitle>
          <CardDescription>
            Manage your account actions.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label>Logout</Label>
              <p class="text-sm text-muted-foreground">
                Log out from your account.
              </p>
            </div>
            <Button variant="outline" @click="logout">
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <Label class="text-red-500">Delete Account</Label>
              <p class="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive" @click="deleteAccount">
              <Trash2 class="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
