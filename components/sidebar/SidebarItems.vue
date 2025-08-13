<script setup lang="ts">
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NuxtLink } from '#components'
import { computed, ref } from 'vue'
import type { SidebarItemType } from './types'
import { useRouter } from '#imports'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  activeSection: string,
  items: SidebarItemType[]
}>()

const router = useRouter()

const gridColsClass = computed(() => {
  if (props.items.length === 2) {
    return 'grid-cols-2'
  } else if (props.items.length === 3) {
    return 'grid-cols-3'
  } else {
    return 'grid-cols-3'
  }
})

const activeItem = computed(() => {
  return props.items.find(item => item.id === props.activeSection)
})

const handleSelectChange = (value: string) => {
  const selectedItem = props.items.find(item => item.id === value)
  if (selectedItem) {
    router.push(selectedItem.to)
  }
}
</script>

<template>
  <!-- Mobile Sidebar -->
  <div class="lg:hidden w-full flex justify-center">
    <template v-if="props.items.length <= 3">
      <Tabs :model-value="activeSection" class="w-full px-4">
        <TabsList class="grid w-full" :class="gridColsClass">
          <TabsTrigger v-for="item in props.items" :key="item.id" :value="item.id" as-child>
            <NuxtLink
              :to="item.to"
              class="w-full min-w-0 text-center"
              :class="[
                activeSection === item.id && !item.staticColor ? 'text-primary' : '',
                item.staticColor ? `!${item.staticColor}` : '',
                activeSection === item.id ? 'bg-muted' : 'hover:bg-muted',
              ]"
            >
              <component :is="item.icon" class="h-4 w-4 mr-3" />
              {{ item.label }}
            </NuxtLink>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </template>
    <template v-else>
      <Select :model-value="activeSection" @update:model-value="handleSelectChange" class="px-4">
        <SelectTrigger class="w-full justify-between mx-4 bg-card">
          <div class="flex items-center">
            <component
              :is="activeItem?.icon"
              class="h-4 w-4 mr-3"
              v-if="activeItem?.icon"
              :class="[
                activeItem?.staticColor ? `!${activeItem.staticColor}` : (activeSection === activeItem?.id ? 'text-primary' : 'text-white'),
              ]"
            />
            <SelectValue
              :placeholder="activeItem?.label || 'Select Item'"
              :class="[
                activeItem?.staticColor ? `!${activeItem.staticColor}` : (activeSection === activeItem?.id ? 'text-primary' : 'text-white'),
              ]"
            />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="item in props.items"
            :key="item.id"
            :value="item.id"
            :class="[
              item.staticColor ? `!${item.staticColor}` : (activeSection === item.id ? 'text-primary' : 'text-white'),
            ]"
          >
            <div class="flex items-center">
              <component
                :is="item.icon"
                class="h-4 w-4 mr-3"
                :class="[
                  item.staticColor ? `!${item.staticColor}` : (activeSection === item.id ? 'text-primary' : 'text-white'),
                ]"
              />
              <span
                :class="[
                  item.staticColor ? `!${item.staticColor}` : (activeSection === item.id ? 'text-primary' : 'text-white'),
                ]"
              >
                {{ item.label }}
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
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
