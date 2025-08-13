<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSlots } from 'vue'

const props = defineProps<{
  activeSection: string
}>()

const slots = useSlots()
const sidebarItems = slots.default ? slots.default().filter(vnode => vnode.type.__name === 'SidebarItem') : []

const getSidebarItemId = (vnode: any) => {
  return vnode.props?.id
}
</script>

<template>
  <!-- Mobile Sidebar -->
  <div class="lg:hidden w-full flex justify-center">
    <Tabs :model-value="activeSection" class="w-full px-4">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger v-for="(item, index) in sidebarItems" :key="index" :value="getSidebarItemId(item)" as-child>
          <component :is="item" :active-section="activeSection" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>

  <!-- Desktop Sidebar -->
  <div class="hidden lg:block flex-grow">
    <div class="p-6">
      <div>
        <div class="flex flex-col gap-y-2">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>