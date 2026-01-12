import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up Free - Start Journaling Today',
  description: 'Create your free account and start your mental wellness journey. Join thousands using If I Was Honest for private journaling, emotional growth, and authentic self-reflection.',
  keywords: [
    'create journal account',
    'sign up free',
    'free journaling app',
    'start journaling',
    'mental health signup',
    'free mental wellness app',
    'register journal account'
  ],
  openGraph: {
    title: 'Sign Up Free - Start Your Journaling Journey',
    description: 'Create your free account and begin authentic self-reflection today.',
    url: 'https://ifiiwashonest.com/auth/signup',
    type: 'website'
  }
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
