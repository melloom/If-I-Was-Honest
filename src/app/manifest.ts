import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'If I Was Honest - Private Journaling & Mental Wellness',
    short_name: 'If I Was Honest',
    description: 'A private-first journaling app for authentic self-reflection and mental wellness',
    start_url: '/feed',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#ffffff',
    theme_color: '#2c2c2c',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['health', 'lifestyle', 'productivity'],
    screenshots: [
      {
        src: '/screenshot-desktop.png',
        sizes: '540x720',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    shortcuts: [
      {
        name: 'New Entry',
        url: '/dashboard?action=new',
        description: 'Create a new journal entry',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
  }
}
