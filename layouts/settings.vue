<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { User, Bot, Crown } from 'lucide-vue-next'
import { SidebarPage, SidebarTitle, SidebarItems, SidebarItem, SidebarMain, type SidebarItemType } from '@/components/sidebar'

const sidebarItems: SidebarItemType[] = [
  { id: 'profile', label: 'Account', icon: User, to: '/settings' },
  { id: 'ai', label: 'AI', icon: Bot, to: '/settings/ai' },
  { id: 'plus', label: 'Plus', icon: Crown, to: '/settings/plus', staticColor: 'text-plus-gold' },
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
    <SidebarPage>
      <template #title>
        <SidebarTitle>Settings</SidebarTitle>
      </template>
      <template #items>
        <SidebarItems :active-section="activeSection" :items="sidebarItems">
          <SidebarItem
            v-for="item in sidebarItems"
            :key="item.id"
            :id="item.id"
            :to="item.to"
            :icon="item.icon"
            :static-color="item.staticColor"
            :active-section="activeSection"
          >
            {{ item.label }}
          </SidebarItem>
        </SidebarItems>
      </template>
      <template #main>
        <SidebarMain>
          <slot />
          <footer class="w-full mt-auto lg:hidden">
            <div class="container mx-auto px-4 md:px-6 flex items-center justify-between text-sm text-muted-foreground">
              <p>&copy; 2025 Mindful Lucidity.</p>
              <NuxtLink to="/support/contact_us" class="hover:underline flex items-center gap-1">
                Support
              </NuxtLink>
            </div>
          </footer>
        </SidebarMain>
      </template>
    </SidebarPage>
  </NuxtLayout>
</template>