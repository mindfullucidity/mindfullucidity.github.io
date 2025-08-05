<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '@/lib/utils'
import { User, Bot, Search, Bell, ChevronRight, Zap } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SidebarItem {
  id: string
  label: string
  icon: any // Using 'any' for the icon component type
  to: string
}

const sidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Profile', icon: User, to: '/settings' },
  { id: 'ai', label: 'AI', icon: Bot, to: '/settings/ai' },
  { id: 'plus', label: 'Plus', icon: Zap, to: '/settings/plus' },
]

const route = useRoute()
const activeSection = ref(route.path.split('/').pop() === 'settings' ? 'profile' : route.path.split('/').pop())

const isHoveringNavbar = ref(false)
const hoveredItem = ref<string | null>(null)

watch(() => route.path, (newPath) => {
  activeSection.value = newPath.split('/').pop() === 'settings' ? 'profile' : newPath.split('/').pop()
})

const getTextColorClass = (item: SidebarItem) => {
  if (item.id === 'plus') {
    return 'text-plus-gold';
  } else {
    return activeSection.value === item.id ? 'text-primary' : 'text-foreground';
  }
};
</script>

<template>
  <NuxtLayout name="default">
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <div class="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex h-16 items-center px-6">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span class="text-primary-foreground font-semibold text-sm">ML</span>
              </div>
              <div>
                <h1 class="text-lg font-semibold">Settings</h1>
              </div>
            </div>
          </div>
          <div class="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Search class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
        <!-- Sidebar -->
        <div
          class="w-64 border-r border-border min-h-full overflow-y-auto"
          @mouseover="isHoveringNavbar = true"
          @mouseleave="isHoveringNavbar = false; hoveredItem = null"
        >
          <div class="p-6">
            <nav class="space-y-1">
              <NuxtLink
                v-for="item in sidebarItems"
                :key="item.id"
                :to="item.to"
                class="w-full inline-flex items-center justify-between px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                :class="[
                  {
                    'bg-primary/10': hoveredItem === item.id || (hoveredItem === null && activeSection === item.id),
                  },
                  item.id === 'plus' ? 'text-plus-gold' : getTextColorClass(item)
                ]"
                @mouseover="hoveredItem = item.id"
                @mouseleave="hoveredItem = null"
              >
                <div class="flex items-center space-x-3">
                  <component :is="item.icon" class="h-4 w-4" />
                  <span>{{ item.label }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <ChevronRight class="h-3 w-3" />
                </div>
              </NuxtLink>
            </nav>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 h-full overflow-y-auto">
          <div class="max-w-4xl mx-auto p-6">
            <div class="space-y-6">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
