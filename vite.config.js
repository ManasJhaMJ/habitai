// Import dotenv and Vite plugins
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Load .env variables
dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Solo Learner',
        short_name: 'SoloLearner',
        description: 'AI-powered habit tracking system',
        theme_color: '#0e0e1a',
        background_color: '#0e0e1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon-96x96.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon-96x96.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'favicon-96x96.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  define: {
    'process.env': process.env
  }
});