<script setup lang="ts">
</script>

<template>
  <div class="relative flex h-full">
    <!-- Desktop Sidebar Container -->
    <div class="w-64 bg-transparent z-10 hidden lg:flex flex-col h-full overflow-y-auto flex-shrink-0 border-r">
      <slot name="title" />
      <slot name="items" />
    </div>

    <!-- Main Content Area (flex column for TopBar, Mobile Sidebar, and Slot) -->
    <div class="flex flex-col flex-grow h-full">
      <!-- TopBar for desktop screens -->
      <div class="h-14 z-10 flex-shrink-0 hidden lg:block">
        <div class="h-12 text-white flex items-center justify-center border-b">
        </div>
      </div>

      <!-- Mobile Sidebar for small screens -->
      <div class="h-10 z-10 lg:hidden flex-shrink-0">
        <slot name="items" />
      </div>

      <!-- Main Content Slot Area -->
      <slot name="main" />
    </div>
  </div>
</template>