import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { href: 'https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100..900;1,100..900&display=swap', rel: 'stylesheet' },

        {
          rel: 'icon',
          type: 'image/svg+xml', // Change this based on your file type (e.g., 'image/png')
          href: '/favicon.svg'  // Use the public path to your icon file
        }
      ]
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['shadcn-nuxt', '@nuxtjs/device', '@nuxtjs/supabase', 'vue-sonner/nuxt', '@vesp/nuxt-fontawesome', '@vite-pwa/nuxt'],
  fontawesome: {
    icons: {
      brands: ['github', 'patreon']
    }
  },
  supabase: {
    url: 'https://ghkcqaqojnuapfgwoqbj.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdoa2NxYXFvam51YXBmZ3dvcWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5MDQzMzYsImV4cCI6MjA2OTQ4MDMzNn0.yaSaOrJqxBZ_Ky7ZuyuykLBzksOTBS8YR6kXtnO7zWA',
    redirect: false,
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },

  vueSonner: {
    css: false // true by default to include css file
  },

  // Ensure text-plus-gold is always included in the CSS
  tailwindcss: {
    config: {
      safelist: [
        'text-plus-gold',
        'text-primary-selected',
        'bg-border-100',
      ],
    },
  },

  runtimeConfig: {
    public: {
      patreonClientId: process.env.PATREON_CLIENT_ID,
      patreonRedirectUri: process.env.PATREON_REDIRECT_URI,
    },
  },

  pwa: {
    manifest: {
      name: 'Mindful Lucidity',
      short_name: 'MindfulLucidity',
      description: 'A journal for lucid dreaming',
      theme_color: '#1a1a1a',
      background_color: '#1a1a1a',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      scope: '/',
      icons: [
        {
          src: 'pwa.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
      start_url: '/home',
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: process.env.NODE_ENV === 'development',
      suppressWarnings: process.env.NODE_ENV === 'development',
      navigateFallback: '/index.html',
      type: 'module',
    },
  },
})