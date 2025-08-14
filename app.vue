<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
import AuroraBorealis from '@/components/AuroraBorealis.vue';
import { onMounted } from 'vue';

const user = useSupabaseUser()
const router = useRouter()
const { refreshUser } = useAuth();

onMounted(() => {
  refreshUser();
});
</script>

<template>
  <NuxtPwaManifest />
  <svg width="0" height="0" style="position: absolute;">
    <defs>
      <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#a78bfa" />
        <stop offset="100%" stop-color="#60a5fa" />
      </linearGradient>
    </defs>
  </svg>
  <AuroraBorealis class="fixed inset-0 z-0" />
  <div class="relative z-10">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>
