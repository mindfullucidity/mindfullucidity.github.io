<template>
  <NuxtLayout name="default">
    <Title>Settings | MindfulLucidity</Title>
    <!-- Outer container that fills default.vue's main slot -->
    <div class="relative flex h-full">
      <!-- Desktop Sidebar -->
      <SettingsSidebar class="w-64 bg-transparent z-10 hidden lg:block h-full overflow-y-auto flex-shrink-0" />

      <!-- Main Content Area (flex column for TopBar, Mobile Sidebar, and Slot) -->
      <div class="flex flex-col flex-grow h-full">
        <!-- TopBar for all screens (flex-shrink-0) -->
        <div class="h-14 z-10 flex-shrink-0 hidden lg:block" >
          <div class="h-12 text-white flex items-center justify-center border-b">
          </div>
        </div>

        <!-- Mobile Sidebar for small screens (flex-shrink-0) -->
        <SettingsMobileSidebar class="h-10 z-10 lg:hidden flex-shrink-0" />

        <!-- Main Content Slot Area (flex-grow overflow-y-auto) -->
        <div class="flex-grow overflow-y-auto p-6">
          <div class="space-y-6 w-full max-w-4xl mx-auto">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import SettingsSidebar from '@/components/settings/Sidebar.vue';
import SettingsMobileSidebar from '@/components/settings/MobileSidebar.vue';
</script>
