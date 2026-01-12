import { Metadata } from 'next'
import { AppHeader } from '@/components/AppHeader'
import AboutFooterCTADynamic from './AboutFooterCTADynamic'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About TheHonestProject | Anonymous Thoughts & Unsent Messages',
  description: 'TheHonestProject (If I Was Honest) - A safe space for anonymous confessions, unsent messages, and honest thoughts you never said. Write what you truly feel without judgment.',
  keywords: ['anonymous confessions', 'unsent messages', 'honest thoughts', 'private journal', 'mental health', 'anonymous thoughts', 'things i never said', 'confession app', 'honest feelings', 'emotional healing', 'therapy journal', 'anonymous writing', 'secret thoughts', 'unspoken words', 'mental wellness', 'self reflection'],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <AppHeader />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            About TheHonestProject
          </h1>
          <p className="text-lg md:text-xl mb-2" style={{ color: '#9a9a9a' }}>
            Also known as <span className="font-semibold" style={{ color: '#6a6a6a' }}>If I Was Honest</span>
          </p>
          <p className="text-xl md:text-2xl" style={{ color: '#6a6a6a' }}>
            A space for the thoughts you'd never say out loud
          </p>
        </div>

        <div className="space-y-12">
          {/* Mission Section */}
          <section className="bg-white rounded-2xl p-8 md:p-10 border" style={{ borderColor: '#e0e0e0' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
              Our Mission
            </h2>
            <div className="space-y-4" style={{ color: '#4a4a4a', lineHeight: '1.8', fontSize: '1.125rem' }}>
              <p>
                We all carry words we've never spoken. Thoughts too vulnerable to voice. Feelings too raw to share.
                Messages we wish we'd sent, apologies we never made, truths we keep buried deep inside.
              </p>
              <p>
                Whether it's fear of judgment, not wanting to hurt someone, or simply the weight of being truly seen—
                these unsaid words live within us, quietly shaping our lives and relationships.
              </p>
              <p>
                <strong>TheHonestProject</strong> (also known as <strong>If I Was Honest</strong>) is a space designed for these unspoken truths. A place where you can 
                write what you've always wanted to say but couldn't. Where honesty doesn't require courage, just words 
                on a screen. Where your deepest thoughts can exist safely, privately, until you decide they're ready 
                to be shared.
              </p>
              <p>
                This is more than journaling—it's emotional archaeology. Digging through layers of what we think we 
                should feel to find what we actually do. And when you're ready, your anonymous truth can help others 
                realize they're not alone in theirs.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section>
            <h2 className="text-3xl font-bold mb-8" style={{ color: '#1a1a1a' }}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e0e0e0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f9ff' }}>
                  <svg className="w-6 h-6" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Private by Default
                </h3>
                <p style={{ color: '#6a6a6a', lineHeight: '1.7' }}>
                  Your entries are yours alone. Encrypted and secure. Nobody can see them unless you choose to share.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e0e0e0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fef3c7' }}>
                  <svg className="w-6 h-6" style={{ color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Tag & Track
                </h3>
                <p style={{ color: '#6a6a6a', lineHeight: '1.7' }}>
                  Mark entries with moods and tags. Track your emotional journey and growth over time.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e0e0e0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                  <svg className="w-6 h-6" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Share Anonymously
                </h3>
                <p style={{ color: '#6a6a6a', lineHeight: '1.7' }}>
                  When ready, publish to the public feed. Completely anonymous—no username, just your words.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#e0e0e0' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fce7f3' }}>
                  <svg className="w-6 h-6" style={{ color: '#ec4899' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Read & Connect
                </h3>
                <p style={{ color: '#6a6a6a', lineHeight: '1.7' }}>
                  Browse others' honest thoughts. Find comfort knowing you're not alone in what you're feeling.
                </p>
              </div>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="bg-gradient-to-br rounded-2xl p-8 md:p-10" style={{ backgroundColor: '#fafafa', border: '2px solid #e0e0e0' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'No likes, no comments, no social pressure',
                'True anonymity when you share publicly',
                'Built for reflection, not performance',
                'Your data is yours—export anytime',
                'No ads, no data selling',
                'Open source & transparent'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span style={{ color: '#2a2a2a', fontSize: '1.0625rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Inspiration Section */}
          <section className="bg-white rounded-2xl p-8 md:p-10 border" style={{ borderColor: '#e0e0e0' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
              Inspired By
            </h2>
            <div className="space-y-4" style={{ color: '#4a4a4a', lineHeight: '1.8', fontSize: '1.0625rem' }}>
              <p>
                This project was inspired by{' '}
                <a 
                  href="https://theunsentproject.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline transition-opacity hover:opacity-70"
                  style={{ color: '#2c2c2c' }}
                >
                  The Unsent Project
                </a>
                {' '}by Rora Blue—a powerful art project where people submit unsent text messages to their first love, 
                each associated with a color. Their work beautifully captures the universal experience of words left unsaid.
              </p>
              <p>
                While The Unsent Project focuses on messages to first loves, <strong>TheHonestProject</strong> expands this concept 
                to include all the honest thoughts we carry—to ourselves, to others, to the world. Messages to parents we 
                never reconciled with. Apologies to friends we've lost. Truths we need to tell ourselves. Words we wish we 
                could say to who we used to be.
              </p>
              <p>
                We're deeply grateful to Rora Blue for pioneering this space of vulnerability and showing the world that 
                our unsent words matter. Their vision inspired us to create a broader canvas where every unspoken truth 
                can find a home.
              </p>
            </div>
          </section>

          {/* Creator Section */}
          <section className="bg-white rounded-2xl p-8 md:p-10 border" style={{ borderColor: '#e0e0e0' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
              Built By
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: '#f0f0f0', color: '#2a2a2a' }}>
                MP
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Melvin Peralta
                </h3>
                <p className="mb-4" style={{ color: '#6a6a6a', lineHeight: '1.7' }}>
                  Developer passionate about mental wellness and creating honest spaces for authentic self-reflection.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/melloom"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub Profile
                  </a>
                  <a
                    href="https://github.com/melloom/If-I-Was-Honest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: '#f5f5f5', color: '#2a2a2a', border: '1px solid #e0e0e0' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View Source Code
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Crisis Resources */}
          <section className="bg-red-50 rounded-2xl p-8 md:p-10 border-2" style={{ borderColor: '#fecaca' }}>
            <div className="flex items-start gap-4 mb-6">
              <svg className="w-8 h-8 flex-shrink-0" style={{ color: '#dc2626' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#991b1b' }}>
                  Important: Crisis Resources
                </h2>
                <p className="mb-6" style={{ color: '#7f1d1d', lineHeight: '1.7', fontSize: '1.0625rem' }}>
                  This platform is <strong>not a substitute</strong> for professional mental health care.
                  If you're experiencing a crisis, having thoughts of suicide, or need immediate support, please reach out to trained professionals immediately:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* US Crisis Lines */}
                  <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#fca5a5' }}>
                    <h3 className="font-bold text-lg mb-3" style={{ color: '#991b1b' }}>
                      United States
                    </h3>
                    <div className="space-y-3" style={{ color: '#7f1d1d', fontSize: '0.9375rem' }}>
                      <div>
                        <div className="font-semibold">988 Suicide & Crisis Lifeline</div>
                        <div>Call or text: <span className="font-bold">988</span></div>
                        <div className="text-sm opacity-75">24/7, free and confidential</div>
                      </div>
                      <div>
                        <div className="font-semibold">Crisis Text Line</div>
                        <div>Text <span className="font-bold">HOME</span> to <span className="font-bold">741741</span></div>
                        <div className="text-sm opacity-75">24/7 crisis support via text</div>
                      </div>
                      <div>
                        <div className="font-semibold">SAMHSA National Helpline</div>
                        <div>Call: <span className="font-bold">1-800-662-4357</span></div>
                        <div className="text-sm opacity-75">Treatment referral & information</div>
                      </div>
                    </div>
                  </div>

                  {/* Specialized Resources */}
                  <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#fca5a5' }}>
                    <h3 className="font-bold text-lg mb-3" style={{ color: '#991b1b' }}>
                      Specialized Support
                    </h3>
                    <div className="space-y-3" style={{ color: '#7f1d1d', fontSize: '0.9375rem' }}>
                      <div>
                        <div className="font-semibold">The Trevor Project (LGBTQ+ Youth)</div>
                        <div>Call: <span className="font-bold">1-866-488-7386</span></div>
                        <div>Text <span className="font-bold">START</span> to <span className="font-bold">678678</span></div>
                      </div>
                      <div>
                        <div className="font-semibold">Trans Lifeline</div>
                        <div>US: <span className="font-bold">1-877-565-8860</span></div>
                        <div>Canada: <span className="font-bold">1-877-330-6366</span></div>
                      </div>
                      <div>
                        <div className="font-semibold">Veterans Crisis Line</div>
                        <div>Call: <span className="font-bold">988</span> then press <span className="font-bold">1</span></div>
                        <div>Text: <span className="font-bold">838255</span></div>
                      </div>
                      <div>
                        <div className="font-semibold">RAINN (Sexual Assault)</div>
                        <div>Call: <span className="font-bold">1-800-656-4673</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* International Resources */}
                <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#fca5a5' }}>
                  <h3 className="font-bold text-lg mb-3" style={{ color: '#991b1b' }}>
                    International Resources
                  </h3>
                  <div className="space-y-2" style={{ color: '#7f1d1d', fontSize: '0.9375rem' }}>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-fit">Canada:</span>
                      <span>Call 1-833-456-4566 or text 45645</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-fit">UK:</span>
                      <span>Call 116 123 (Samaritans)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-fit">Australia:</span>
                      <span>Call 13 11 14 (Lifeline)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold min-w-fit">Worldwide:</span>
                      <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80 font-semibold">
                        FindAHelpline.com
                      </a>
                      <span>- Crisis lines in 30+ countries</span>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-sm" style={{ color: '#7f1d1d', lineHeight: '1.6' }}>
                  <strong>Remember:</strong> Seeking help is a sign of strength, not weakness. You matter, and your feelings are valid.
                  Professional support can make a real difference.
                </p>
              </div>
            </div>
          </section>

          {/* Footer CTA (client component, dynamically loaded) */}
          <AboutFooterCTADynamic />
        </div>
      </div>
    </div>
  )
}
