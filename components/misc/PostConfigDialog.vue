<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { toast } from 'vue-sonner'

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const isOpen = ref(false)
const selectedGender = ref<'Male' | 'Female' | 'Other' | 'Prefer Not To Say' | null>(null)

watch(user, (newUser) => {
  if (newUser && !newUser.user_metadata?.postConfigured) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}, { immediate: true })

async function saveConfig() {
  try {
    const updates: { gender?: string | null; postConfigured: boolean } = {
      postConfigured: true,
    }

    if (selectedGender.value) {
      updates.gender = selectedGender.value
    }

    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) throw error

    const { error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError) {
      toast.error('Failed to refresh session after saving configuration', {
        description: refreshError.message,
      })
    } else {
      toast.success('Configuration saved!', {
        description: 'Your initial setup is complete.',
      })
      isOpen.value = false
    }
  } catch (error: any) {
    toast.error('Error saving configuration', {
      description: error.message,
    })
  }
}
</script>

<template>
  <Dialog :open="isOpen" :modal="true">
    <DialogContent class="sm:max-w-[425px] [&>button]:hidden">
      <DialogHeader>
        <DialogTitle>Welcome!</DialogTitle>
        <DialogDescription>
          Please provide some initial details to help us personalize your experience.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label for="gender">Gender</Label>
          <p class="text-sm text-muted-foreground mb-2">We collect gender information to improve AI dream analysis.</p>
          <Select v-model="selectedGender">
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Prefer Not To Say">Prefer Not To Say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button @click="saveConfig">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
