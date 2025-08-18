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
import { useNuxtApp } from '#app'
import InstallPWAButton from '~/components/misc/InstallPWAButton.vue'

const route = useRoute()

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { $pwa } = useNuxtApp()

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
  <div class="fixed bottom-0 left-0 z-50 w-full h-16 bg-black/90">
    <div class="flex h-full w-full justify-evenly items-center px-4 font-medium">
      <NuxtLink
        to="/journal"
        class="inline-flex flex-col items-center justify-center px-5"
        :class="{
          'text-primary-selected': route.path.startsWith('/journal'),
        }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/30': route.path.startsWith('/journal') }">
          <Book class="w-5 h-5" />
        </div>
        <span class="text-sm">Journal</span>
      </NuxtLink>
      <NuxtLink
        to="/home"
        class="inline-flex flex-col items-center justify-center px-5"
        :class="{
          'text-primary-selected': route.path === '/home',
        }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/30': route.path === '/home' }">
          <Home class="w-5 h-5" />
        </div>
        <span class="text-sm">Home</span>
      </NuxtLink>
      <NuxtLink
        to="/settings"
        class="inline-flex flex-col items-center justify-center px-5"
        :class="{
          'text-primary-selected': route.path.startsWith('/settings'),
        }"
      >
        <div class="px-3 py-1 rounded-lg" :class="{ 'bg-primary/30': route.path.startsWith('/settings') }">
          <Settings class="w-5 h-5" />
        </div>
        <span class="text-sm">Settings</span>
      </NuxtLink>
    </div>
  </div>
</template>
