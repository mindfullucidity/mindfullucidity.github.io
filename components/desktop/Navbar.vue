<script setup lang="ts">
import { Home, Book, Settings, LogOut, User, ChevronDown, ChevronUp, SunMoon, Crown } from 'lucide-vue-next'
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
const hoveredItem = ref<string | null>(null)
const isHoveringNavbar = ref(false)
const isDropdownOpen = ref(false)

watch(isDropdownOpen, (newVal) => {
  if (!newVal) {
    isHoveringNavbar.value = false;
    hoveredItem.value = null;
  }
});

const user = useSupabaseUser()
const supabase = useSupabaseClient()

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await navigateTo('/redirect?to=/&logout=true')
  } catch (error) {
    console.error('Error logging out:', error.message)
  }
}
</script>

<template>
  <div class="hidden md:block fixed top-0 left-0 z-50 w-full h-16 bg-black/50">
    <div class="flex justify-between items-center h-full mx-auto px-4 font-medium">
      <div class="flex items-center gap-x-4">
        <NuxtLink to="/" class="text-lg font-bold ml-5 inline-flex items-center justify-center gap-2">
          <SunMoon class="w-5 h-5 mb-1"/>
          MindfulLucidity
        </NuxtLink>
      </div>
      <div class="flex items-center gap-x-4">
        <div
          class="flex items-center gap-x-4"
          @mouseover="isHoveringNavbar = true"
          @mouseleave="if (!isDropdownOpen) { isHoveringNavbar = false; hoveredItem = null }"
        >
          <NuxtLink
            to="/home"
            class="inline-flex items-center justify-center px-3 py-1 rounded-lg"
            :class="{
              'bg-primary/30': hoveredItem === 'home' || (hoveredItem === null && !isHoveringNavbar && route.path === '/home'),
              'text-primary-selected': route.path === '/home'
            }"
            @mouseover="hoveredItem = 'home'"
          >
            <Home v-if="route.path === '/home'" class="w-5 h-5 mr-2" />
            <span class="text-sm">Home</span>
          </NuxtLink>
          <NuxtLink
            to="/journal"
            class="inline-flex items-center justify-center px-3 py-1 rounded-lg"
            :class="{
              'bg-primary/30': hoveredItem === 'journal' || (hoveredItem === null && !isHoveringNavbar && route.path.startsWith('/journal')),
              'text-primary-selected': route.path.startsWith('/journal')
            }"
            @mouseover="hoveredItem = 'journal'"
          >
            <Book v-if="route.path.startsWith('/journal')" class="w-5 h-5 mr-2" />
            <span class="text-sm">Journal</span>
          </NuxtLink>
          <NuxtLink
            v-if="!user"
            to="/plus"
            class="inline-flex items-center justify-center px-3 py-1 rounded-lg text-plus-gold"
            :class="{
              'bg-primary/30': hoveredItem === 'plus' || (hoveredItem === null && !isHoveringNavbar && route.path === '/plus'),
            }"
            @mouseover="hoveredItem = 'plus'"
          >
            <Crown class="w-5 h-5 mr-2 text-plus-gold" />
            <span class="text-sm">Plus</span>
          </NuxtLink>
        </div>
        <DropdownMenu v-if="user" v-model:open="isDropdownOpen">
          <DropdownMenuTrigger class="flex items-center gap-2 focus:outline-none hover:opacity-75 transition-opacity duration-200 ml-4">
            <Avatar class="w-8 h-8">
              <AvatarImage :src="user.user_metadata?.avatar_url || ''" />
              <AvatarFallback>
                <User class="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <ChevronDown v-if="!isDropdownOpen" class="w-4 h-4 transition-transform duration-200" />
            <ChevronUp v-else class="w-4 h-4 transition-transform duration-200" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem class="flex items-center gap-2 text-gray-100/50 hover:text-foreground" @click="navigateTo('/settings')">
              <Settings class="w-4 h-4 text-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem class="flex items-center gap-2 text-plus-gold/50 hover:text-plus-gold" @click="navigateTo('/settings/plus')">
              <Crown class="w-4 h-4 text-plus-gold" />
              Plus
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="flex items-center gap-2 text-red-500/50 hover:text-red-500" @click="logout">
              <LogOut class="w-4 h-4 text-red-500" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button v-else @click="navigateTo('/login')" class="ml-4">
          Login
        </Button>
      </div>
    </div>
  </div>
</template>
