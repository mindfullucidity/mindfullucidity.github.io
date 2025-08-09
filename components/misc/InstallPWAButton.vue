<script setup lang="ts">
import { useNuxtApp } from '#app';
import { ref, computed, onMounted } from 'vue';
import { Download, Lightbulb } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

const { $pwa } = useNuxtApp();

const showInstallDialog = ref(false);
const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});

const os = computed(() => {
  if (!isClient.value) return '';
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'iOS';
  }

  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone';
  }

  if (/mac/i.test(userAgent)) {
    return 'iOS'; // For Safari on macOS
  }

  return '';
});

const browser = computed(() => {
  if (!isClient.value) return '';

  // Try to use userAgentData for more reliable Chromium detection
  if (navigator.userAgentData) {
    const brands = navigator.userAgentData.brands;
    if (brands.some(brand => brand.brand === 'Chromium')) {
      return 'Chromium';
    }
    // If it's a Chromium-based browser but not explicitly 'Chromium' brand (e.g., Google Chrome, Edge)
    if (brands.some(brand => brand.brand.includes('Chrome')) || brands.some(brand => brand.brand.includes('Edge'))) {
      return 'Chromium';
    }
  }

  // Fallback to userAgent string for other browsers or if userAgentData is not available
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes('firefox')) {
    return 'Firefox';
  }
  // General Chromium-based detection for older browsers or non-userAgentData supporting ones
  if (userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('firefox') && !userAgent.includes('safari')) {
    return 'Chromium';
  }

  return '';
});

const getInstructions = () => {
  if (os.value === 'iOS') {
    return 'To install this app, tap the Share button (⇧) and then \'Add to Home Screen\'.';
  } else if (os.value === 'Android') {
    return "To install this app, tap the menu icon (⋮) and then 'Add to Home Screen'.";
  } else if (browser.value === 'Firefox') {
    return 'On Firefox, direct installation is not supported. You can continue to use the app in your browser, or install it on your mobile device (iOS/Android) for a dedicated experience.';
  } else if (browser.value === 'Chromium') {
    return 'On Chromium-based browsers (like Chrome, Edge, Brave), look for an "Install App" option in your browser\'s menu (often a plus icon in the address bar or under the three-dot menu). You can also install it on your mobile device (iOS/Android) for a dedicated experience.';
  } else {
    return 'Direct installation may not be supported on this browser. You can continue to use the app on the web, or install it on your mobile device (iOS/Android) for a dedicated experience.';
  }
};

const handleInstallClick = () => {
  if ($pwa?.showInstallPrompt) {
    $pwa.install();
  } else {
    showInstallDialog.value = true;
  }
};
</script>

<template>
  <Button
    class="bg-gradient-to-r from-[#a78bfa]/50 to-[#60a5fa]/50 hover:from-[#a78bfa] hover:to-[#60a5fa]"
    @click="handleInstallClick"
    v-if="isClient"
  >
    Install App
  </Button>

  <Dialog v-model:open="showInstallDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center">
          How to Install
        </DialogTitle>
        <DialogDescription>
          {{ getInstructions() }}
        </DialogDescription>
      </DialogHeader>
      <DialogClose as-child>
        <Button type="button">
          Got it!
        </Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
</template>
