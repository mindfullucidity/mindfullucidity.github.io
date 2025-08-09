import { defineNuxtPlugin, useNuxtApp } from '#app'
import { onMounted } from 'vue'

export default defineNuxtPlugin(() => {
  onMounted(() => {
    const nuxtApp = useNuxtApp()
    // Ensure $pwa is available and isPWAInstalled is a reactive property
    if (nuxtApp.$pwa && nuxtApp.$pwa.isPWAInstalled) {
      // Check if serviceWorker is supported by the browser
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
              console.error('Service Worker registration failed:', error);
            });
        });
      }
    }
  })
})