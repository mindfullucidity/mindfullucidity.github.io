<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '~/components/ui/button'

const deferredPrompt = ref<any>(null)
const showButton = ref(false)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showButton.value = true
  })

  window.addEventListener('appinstalled', () => {
    showButton.value = false
  })
})

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
    showButton.value = false
  }
}
</script>

<template>
  <Button v-if="showButton" @click="installPWA">
    Install App
  </Button>
</template>
