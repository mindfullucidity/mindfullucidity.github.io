<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '~/components/ui/dialog'
import { Lightbulb } from 'lucide-vue-next'

const deferredPrompt = ref<any>(null)
const showInstallDialog = ref(false)
const os = ref('')

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  })

  window.addEventListener('appinstalled', () => {
    // Hide the button if the app is already installed
    deferredPrompt.value = null
  })

  detectOS()
})

const detectOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  if (/android/i.test(userAgent)) {
    os.value = 'Android'
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    os.value = 'iOS'
  } else {
    os.value = 'Desktop'
  }
}

const installPWA = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation')
    } else {
      console.log('User dismissed the PWA installation')
    }
    deferredPrompt.value = null
  } else {
    showInstallDialog.value = true
  }
}

const getInstructions = () => {
  switch (os.value) {
    case 'Android':
      return `Tap the \'Menu\' icon (usually 3 dots) in your browser, then select \'Add to Home screen\'.`
    case 'iOS':
      return `Tap the \'Share\' icon (a square with an arrow pointing up) in your browser, then scroll down and select \'Add to Home Screen\'.`
    case 'Desktop':
      return `Look for an \'Install\' icon in your browser's address bar (often a computer with a down arrow) or a \'Menu\' option to \'Install app\'.`
    default:
      return `Please use your browser's \'Add to Home Screen\' or \'Install app\' option.`
  }
}
</script>

<template>
  <Button class="bg-gradient-to-r from-[#a78bfa]/50 to-[#60a5fa]/50 hover:from-[#a78bfa] hover:to-[#60a5fa]" @click="installPWA" v-if="os !== ''">
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