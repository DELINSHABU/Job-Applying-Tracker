import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'lOGO.svg',
        'apple-touch-icon-180x180.png',
        'pwa-64x64.png',
        'robots.txt',
        'sitemap.xml',
      ],
      manifest: {
        name: 'Job Tracker - Track Your Applications',
        short_name: 'Job Tracker',
        description: 'Track and manage your job applications, interviews, and offers in one place',
        start_url: '/',
        display: 'standalone',
        background_color: '#080C18',
        theme_color: '#8B5CF6',
        orientation: 'portrait-primary',
        categories: ['productivity', 'utilities'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all built assets
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Runtime caching strategies
        runtimeCaching: [
          {
            // NetworkFirst for navigation requests (as per user's PWA guide)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // CacheFirst for Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // CacheFirst for Google Fonts webfonts
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // NetworkFirst for Firebase API requests
            urlPattern: /^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1 day
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Enable CSS minification
    cssMinify: true,
    // Use terser for better JS minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          
          // React core
          if (id.includes('/react-dom/') || id.match(/\/react\/(?!dom)/)) {
            return 'vendor-react';
          }
          // Scheduler (React dependency)
          if (id.includes('/scheduler/')) {
            return 'vendor-react';
          }
          // Firebase (largest dependency)
          if (id.includes('/firebase/') || id.includes('/@firebase/')) {
            return 'vendor-firebase';
          }
          // Animation libraries
          if (id.includes('/motion/') || id.includes('/framer-motion/')) {
            return 'vendor-animation';
          }
          // Radix UI components
          if (id.includes('/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Other UI dependencies
          if (id.includes('/lucide-react/') || id.includes('/sonner/')) {
            return 'vendor-ui';
          }
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 300,
  },
})
