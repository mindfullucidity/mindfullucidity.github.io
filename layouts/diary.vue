<script setup>
import { Sidebar } from '@/components/diary/sidebar'
  
const route = useRoute();
</script>

<template>
    <NuxtLayout name="default">
      <Title>Journal | MindfulLucidity</Title>
      <div class="relative flex h-full">
        <div
          :class="[
            'relative z-10 border-r overflow-y-auto lg:w-[22rem] min-w-[22rem]',
            route.path === '/journal' ? 'block w-full' : 'hidden',
            'lg:block',
          ]"
        >
          <Sidebar />
        </div>
        <div
          :class="[
            'relative z-10 flex-grow overflow-y-auto',
            route.path === '/journal' ? 'hidden' : 'block',
            'lg:block',
          ]"
        >
          <NuxtPage />
        </div>
      </div>
    </NuxtLayout>
  </template>
  