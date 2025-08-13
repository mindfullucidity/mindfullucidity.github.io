<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { FileText, Shield } from 'lucide-vue-next' // Assuming these icons are suitable
import { SidebarPage, SidebarTitle, SidebarItems, SidebarItem, SidebarMain, type SidebarItemType } from '@/components/sidebar'

const sidebarItems: SidebarItemType[] = [
  { id: 'terms', label: 'Terms of Service', icon: FileText, to: '/documents/terms-of-service' },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield, to: '/documents/privacy-policy' },
]

const route = useRoute()
const activeSection = ref('') // Initialize with empty string

watch(() => route.path, (newPath) => {
  const pathSegment = newPath.split('/').pop()
  if (pathSegment === 'terms-of-service') {
    activeSection.value = 'terms'
  } else if (pathSegment === 'privacy-policy') {
    activeSection.value = 'privacy'
  } else {
    // Fallback for other cases if any
    activeSection.value = pathSegment || ''
  }
}, { immediate: true }) // Run immediately on component mount
</script>

<template>
  <NuxtLayout name="default">
    <Title>Documents | MindfulLucidity</Title>
    <SidebarPage>
      <template #title>
        <SidebarTitle>Documents</SidebarTitle>
      </template>
      <template #items>
        <SidebarItems :active-section="activeSection">
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
