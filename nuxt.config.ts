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

  modules: ['shadcn-nuxt', '@nuxtjs/device', '@nuxtjs/supabase', 'vue-sonner/nuxt', '@vesp/nuxt-fontawesome'],
  fontawesome: {
    icons: {
      brands: ['github']
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
      ],
    },
  },
})