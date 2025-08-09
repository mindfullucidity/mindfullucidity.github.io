<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from '@/lib/utils'
import { User, Bot, ChevronRight, Crown } from 'lucide-vue-next'
import { useRoute } from '#imports';

interface SidebarItem {
  id: string
  label: string
  icon: any // Using 'any' for the icon component type
  to: string
}

const sidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Account', icon: User, to: '/settings' },
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
  <div
    class="hidden lg:block w-64 border-r"
  >
      <div class="border-b border-border  h-12">
        <div class="flex items-center px-4 h-full">
          <h1 class="text-lg font-semibold">Settings</h1>
        </div>
      </div>
      <div class="p-6">
        <div>
          <div>
            <div
              v-for="item in sidebarItems"
              :key="item.id"
            >
              <NuxtLink
                :to="item.to"
                class="w-full inline-flex items-center justify-between px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                :class="[
                  activeSection === item.id && item.id !== 'plus' ? 'text-primary' : '',
                  item.id === 'plus' ? '!text-plus-gold' : '',
                  activeSection === item.id ? 'bg-muted' : 'hover:bg-muted',
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
            </div>
          </div>
        </div>
      </div>
  </div>
</template>