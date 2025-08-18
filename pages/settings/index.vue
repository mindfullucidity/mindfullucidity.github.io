<script setup lang="ts">
import { useSettings } from '@/composables/useSettings'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { LogOut, Trash2, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'settings',
})

const { displayName, email, gender, originalDisplayName, originalGender, hasChanges, isPatreonLinked, togglePatreonLink, saveProfileChanges, logout, deleteAccount, isDeletingAccount } = useSettings()
</script>

<template>
  <div>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Account Settings</h2>
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
          <div class="space-y-2">
            <Label for="gender">Gender</Label>
            <Select v-model="gender">
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
          <div class="flex justify-end">
            <Button @click="saveProfileChanges" :disabled="!hasChanges">Save changes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            Linked Accounts
          </CardTitle>
          <CardDescription>
            Manage your linked third-party accounts.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5 flex items-center gap-2">
              <font-awesome :icon="['fab', 'patreon']" class="h-5 w-5" />
              <Label>Patreon</Label>
            </div>
            <Button :variant="isPatreonLinked ? 'destructive' : 'outline'" @click="togglePatreonLink">
              {{ isPatreonLinked ? 'Unlink' : 'Link' }}
            </Button>
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
            <div class="space-y-0.5 mb-4 sm:mb-0">
              <Label class="text-red-500">Delete Account</Label>
              <p class="text-sm text-muted-foreground">
                Delete your account.
              </p>
            </div>
            <Dialog>
              <DialogTrigger as-child>
                <Button variant="destructive">
                  <Trash2 class="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <div v-if="isDeletingAccount" class="flex w-full justify-center items-center text-destructive">
                    <Loader2 class="h-6 w-6 mr-2 animate-spin" />
                    Deleting Account...
                  </div>
                  <div v-else class="flex w-full justify-center gap-4">
                    <DialogClose as-child>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" @click="deleteAccount">
                      Delete Account
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>