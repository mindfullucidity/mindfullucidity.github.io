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

const getInstructions = () => {
  if (os.value === 'iOS') {
    return 'To install this app, tap the Share button (\u21E7) and then \'Add to Home Screen\'.';
  } else if (os.value === 'Android') {
    return 'To install this app, tap the menu icon (\u22EE) and then \'Add to Home Screen\'.';
  } else {
    return 'Please use your browser\'s \'Add to Home Screen\' or \'Install App\' feature.';
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
    v-if="os !== ''"
  >
    Install App
  </Button>

  <Dialog v-model:open="showInstallDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="flex items-center">
          <Lightbulb class="h-5 w-5 mr-2" /> How to Install
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
