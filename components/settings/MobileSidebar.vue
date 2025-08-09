<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from '@/lib/utils'
import { User, Bot, Crown } from 'lucide-vue-next'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  <div class="lg:hidden w-full flex justify-center">
    <Tabs v-model="activeSection" class="w-full px-4">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger v-for="item in sidebarItems" :key="item.id" :value="item.id" as-child>
          <NuxtLink :to="item.to" class="w-full min-w-0 text-center">
            <component :is="item.icon" class="h-4 w-4 mr-2" />
            {{ item.label }}
          </NuxtLink>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
</template>