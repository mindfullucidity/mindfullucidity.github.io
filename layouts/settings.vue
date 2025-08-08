<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/utils'
import { User, Bot, Search, Bell, ChevronRight, Crown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar, SidebarProvider, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SidebarItem {
  id: string
  label: string
  icon: any // Using 'any' for the icon component type
  to: string
}

const sidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Profile', icon: User, to: '/settings' },
  { id: 'ai', label: 'AI', icon: Bot, to: '/settings/ai' },
  { id: 'plus', label: 'Plus', icon: Crown, to: '/settings/plus' },
]

const route = useRoute()
const activeSection = ref(route.path.split('/').pop() === 'settings' ? 'profile' : route.path.split('/').pop())

watch(() => route.path, (newPath) => {
  activeSection.value = newPath.split('/').pop() === 'settings' ? 'profile' : newPath.split('/').pop()
})
</script>

<template>
  <NuxtLayout name="default">
    <Title>Settings | MindfulLucidity</Title>
    <SidebarProvider>
      <div class="flex flex-col w-full">
        <!-- Tabs for small screens -->
        <div class="lg:hidden w-full flex justify-center mt-4">
          <Tabs v-model="activeSection" class="w-full px-4">
            <TabsList class="grid w-full grid-cols-3">
              <TabsTrigger v-for="item in sidebarItems" :key="item.id" :value="item.id" as-child>
                <NuxtLink :to="item.to" class="w-full">
                  <component :is="item.icon" class="h-4 w-4 mr-2" />
                  {{ item.label }}
                </NuxtLink>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <!-- Main Content Area (Sidebar + Slot) -->
        <div class="flex">
          <!-- Sidebar -->
          <div
            class="hidden lg:block w-64 border-r border-border"
          >
            <Sidebar
              class="mt-16"
              @mouseover="isHoveringNavbar = true"
              @mouseleave="isHoveringNavbar = false; hoveredItem = null"
            >
              <SidebarHeader class="border-b border-r border-border">
                <div class="flex h-8 items-center px-4">
                  <h1 class="text-lg font-semibold">Settings</h1>
                </div>
              </SidebarHeader>
              <SidebarContent class="p-6">
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem
                      v-for="item in sidebarItems"
                      :key="item.id"
                    >
                      <SidebarMenuButton
                        asChild
                        :is-active="activeSection === item.id"
                      >
                        <NuxtLink
                          :to="item.to"
                          class="w-full inline-flex items-center justify-between px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          :class="[
                            activeSection === item.id && item.id !== 'plus' ? 'text-primary' : '',
                            item.id === 'plus' ? '!text-plus-gold' : '',
                          ]"
                        >
                          <div class="flex items-center space-x-3">
                            <component :is="item.icon" class="h-4 w-4" />
                            <span>{{ item.label }}</span>
                          </div>
                          <div class="flex items-center space-x-2">
                            <ChevronRight class="h-3 w-3" />
                          </div>
                        </NuxtLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </div>

          <!-- Main Content Slot Area -->
          <div class="flex-grow">
            <div class="space-y-6 w-full max-w-4xl mx-auto p-6">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  </NuxtLayout>
</template>
