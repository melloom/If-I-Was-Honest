import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], preload: false, display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'If I Was Honest | Anonymous Thoughts You Never Sent',
    template: '%s | If I Was Honest'
  },
  description: 'If I Was Honest is a collection of anonymous, unsent thoughts and confessions. Write honestly, publish anonymously, and read what others never said.',
  keywords: [
    'journaling app',
    'private journal',
    'mental health',
    'self-reflection',
    'emotional wellness',
    'anonymous journaling',
    'mental wellness app',
    'daily journal',
    'mood tracker',
    'personal growth',
    'therapy journal',
    'mindfulness',
    'self-care',
    'emotional health',
    'private diary',
    'authentic writing',
    'mental health journal',
    'reflection app',
    'wellness tracker'
  ],
  authors: [{ name: 'If I Was Honest Team' }],
  creator: 'If I Was Honest',
  publisher: 'If I Was Honest',
  metadataBase: new URL('https://thehonestproject.co'),
  alternates: {
    canonical: '/'
  },
  appleWebApp: {
    capable: true,
    // Use solid status bar so the notch area is filled, not translucent
    statusBarStyle: 'black',
    title: 'If I Was Honest',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thehonestproject.co',
    title: 'If I Was Honest | Anonymous Thoughts You Never Sent',
    description: 'A private-first journaling space for the things you never said.',
    siteName: 'If I Was Honest',
    images: [{
      url: 'https://thehonestproject.co/opengraph-image',
      width: 1200,
      height: 630,
      alt: 'If I Was Honest - Anonymous Thoughts You Never Sent'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'If I Was Honest | Anonymous Thoughts You Never Sent',
    description: 'A private-first journaling space for the things you never said.',
    images: ['https://thehonestproject.co/opengraph-image'],
    creator: '@ifiiwashonest'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{
        colorScheme: 'light',
        backgroundColor: '#FAF8F3',
        minHeight: '100%',
      }}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#FAF8F3" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="If I Was Honest" />
        
        {/* Favicon Links - Ensures Google picks up the icon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* Schema.org structured data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'If I Was Honest',
              applicationCategory: 'HealthApplication',
              description: 'If I Was Honest is a collection of anonymous, unsent thoughts and confessions. Write honestly, publish anonymously, and read what others never said.',
              url: 'https://thehonestproject.co',
              image: 'https://thehonestproject.co/android-chrome-512x512.png',
              logo: 'https://thehonestproject.co/android-chrome-512x512.png',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150'
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD'
              }
            })
          }}
        />
      </head>
      <body 
        className={inter.className} 
        suppressHydrationWarning
        style={{
          paddingTop: 'max(0px, env(safe-area-inset-top))',
          paddingLeft: 'max(0px, env(safe-area-inset-left))',
          paddingRight: 'max(0px, env(safe-area-inset-right))',
          paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
          backgroundColor: '#FAF8F3',
          minHeight: '100vh',
          color: '#1A1A1A',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
