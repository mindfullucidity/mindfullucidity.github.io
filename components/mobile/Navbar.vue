<script setup lang="ts">
import { Home, Book, Settings, LogOut, User, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const route = useRoute()

const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await navigateTo('/login')
  } catch (error) {
    console.error('Error logging out:', error.message)
  }
}
</script>

<template>
  <div class="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
    <div class="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
      <NuxtLink
        to="/home"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path === '/home' }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path === '/home' }">
          <Home class="w-5 h-5" />
        </div>
        <span class="text-sm">Home</span>
      </NuxtLink>
      <NuxtLink
        to="/journal"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path.startsWith('/journal') }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path.startsWith('/journal') }">
          <Book class="w-5 h-5" />
        </div>
        <span class="text-sm">Journal</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
        :class="{ 'text-primary': route.path.startsWith('/settings') }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/10': route.path.startsWith('/settings') }">
          <Settings class="w-5 h-5" />
        </div>
        <span class="text-sm">Settings</span>
      </NuxtLink>

      <DropdownMenu v-if="user" v-model:open="isDropdownOpen">
        <DropdownMenuTrigger class="inline-flex flex-col items-center justify-center px-5 focus:outline-none hover:opacity-75 transition-opacity duration-200">
          <Avatar class="w-8 h-8">
            <AvatarImage :src="user.user_metadata?.avatar_url || ''" />
            <AvatarFallback>
              <User class="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <span class="text-sm">Profile <ChevronDown v-if="!isDropdownOpen" class="w-3 h-3 inline-block transition-transform duration-200" /><ChevronUp v-else class="w-3 h-3 inline-block transition-transform duration-200" /></span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="flex items-center gap-2" @click="navigateTo('/settings')">
            <Settings class="w-4 h-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="flex items-center gap-2 text-red-500" @click="logout">
            <LogOut class="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
