import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thehonestproject.co'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/auth/signout/',
          '/auth/error/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
