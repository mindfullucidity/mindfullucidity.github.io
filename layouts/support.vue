<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { Mail, Bug } from 'lucide-vue-next' // Assuming these icons are suitable
import { SidebarPage, SidebarTitle, SidebarItems, SidebarItem, SidebarMain, type SidebarItemType } from '@/components/sidebar'

const sidebarItems: SidebarItemType[] = [
  { id: 'contact-us', label: 'Contact Us', icon: Mail, to: '/support/contact_us' },
  { id: 'report-bug', label: 'Report Bug', icon: Bug, to: '/support/report_bug' },
]

const route = useRoute()
const activeSection = ref('') // Initialize with empty string

watch(() => route.path, (newPath) => {
  const pathSegment = newPath.split('/').pop()
  if (pathSegment === 'contact_us') {
    activeSection.value = 'contact-us'
  } else if (pathSegment === 'report_bug') {
    activeSection.value = 'report-bug'
  } else {
    // Fallback for other cases if any
    activeSection.value = pathSegment || ''
  }
}, { immediate: true }) // Run immediately on component mount
</script>

<template>
  <NuxtLayout name="default">
    <Title>Support | MindfulLucidity</Title>
    <SidebarPage>
      <template #title>
        <SidebarTitle>Support</SidebarTitle>
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
        </SidebarMain>
      </template>
    </SidebarPage>
  </NuxtLayout>
</template>
