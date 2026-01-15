import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | TheHonestProject - Access Your Private Journal',
  description: 'Sign in to TheHonestProject to access your private journal entries, track your mental health journey, and continue your self-reflection practice.',
  keywords: [
    'journal login',
    'sign in',
    'access journal',
    'private journal login',
    'mental health app login',
    'thehonestproject login'
  ],
  openGraph: {
    title: 'Sign In - TheHonestProject',
    description: 'Access your private journal and continue your self-reflection journey.',
    url: 'https://thehonestproject.co/auth/signin',
    type: 'website'
  },
  alternates: {
    canonical: 'https://thehonestproject.co/auth/signin'
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true
    }
  }
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
