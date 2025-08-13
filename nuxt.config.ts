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
      ],
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
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
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
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
    registerType: 'autoUpdate',
    manifest: {
      name: 'MindfulLucidity',
      short_name: 'MindfulLucidity',
      description: 'A journal for lucid dreaming',
      theme_color: '#000000',
      background_color: '#000000',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      scope: '/',
      "icons": [
        {
          "src": "/pwa-64x64.png",
          "sizes": "64x64",
          "type": "image/png"
        },
        {
          "src": "/pwa-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/pwa-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        },
        {
          "src": "/maskable-icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        }
      ],
      start_url: '/home',
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: 'module',
    },
    workbox: {
      navigateFallback: '/home',
      navigateFallbackAllowlist: [
        /^\/home(\/.*)?$/,
        /^\/journal(\/.*)?$/,
      ],
      navigateFallbackDenylist: [
        /^\/$/,
        /^\/login$/,
        /^\/register$/,
        /^\/plus$/,
        /^\/redirect(\?.*)?$/,
        /^\/documents(\?.*)?$/,
        /^\/settings(\?.*)?$/,
        /^\/support(\?.*)?$/,
      ],
    },
  },
})