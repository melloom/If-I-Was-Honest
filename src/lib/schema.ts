export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'If I Was Honest',
  url: 'https://thehonestproject.co',
  logo: 'https://thehonestproject.co/logo.png',
  description: 'A private-first journaling app for authentic self-reflection and mental wellness',
  sameAs: [
    'https://twitter.com/ifiiwashonest',
    'https://facebook.com/ifiiwashonest',
    'https://instagram.com/ifiiwashonest'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@ifiiwashonest.com'
  }
}

export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'If I Was Honest',
  url: 'https://thehonestproject.co',
  applicationCategory: 'HealthApplication',
  applicationSubCategory: 'Mental Wellness',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  },
  description: 'A private-first journaling app for authentic self-reflection, mental health tracking, and emotional wellness. Write honest thoughts, track mood patterns, and grow without judgment.'
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is If I Was Honest free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, If I Was Honest offers a free tier with core journaling features. Premium features are available for enhanced functionality.'
      }
    },
    {
      '@type': 'Question',
      name: 'How private are my journal entries?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your entries are completely private by default. Only you can see them unless you choose to publish them anonymously to the public feed. We use end-to-end encryption to protect your data.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I export my journal entries?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, you can export all your journal entries at any time in multiple formats including JSON, PDF, and plain text.'
      }
    },
    {
      '@type': 'Question',
      name: 'What makes If I Was Honest different from other journaling apps?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We focus on authentic self-reflection without social pressure. No likes, no comments, no metrics. Just honest writing, mood tracking, and optional anonymous sharing with a judgment-free community.'
      }
    }
  ]
}

export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'If I Was Honest',
  url: 'https://thehonestproject.co',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://thehonestproject.co/search?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
}

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
})
