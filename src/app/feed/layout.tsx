import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anonymous Feed - Read Honest Thoughts',
  description: 'Read anonymous journal entries from real people sharing their honest thoughts. A judgment-free space to see you\'re not alone in your feelings. No likes, no comments, just raw authenticity.',
  keywords: [
    'anonymous thoughts',
    'honest confessions',
    'mental health stories',
    'anonymous journal',
    'real emotions',
    'authentic sharing',
    'mental health community',
    'judgment-free space',
    'emotional support'
  ],
  openGraph: {
    title: 'Anonymous Feed - Read Honest Thoughts From Real People',
    description: 'A judgment-free space where people share their honest thoughts anonymously. See you\'re not alone.',
    url: 'https://ifiiwashonest.com/feed',
    type: 'website'
  }
}

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
