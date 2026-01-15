import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | TheHonestProject - Your Data Protection',
  description: 'Learn how TheHonestProject protects your privacy and secures your journal entries. We prioritize privacy-first journaling with strong encryption, anonymity, and no data sharing.',
  keywords: [
    'privacy policy',
    'data protection',
    'journal privacy',
    'secure journaling',
    'anonymous privacy',
    'GDPR compliance',
    'data security',
    'private journal app',
    'encrypted journaling',
    'user privacy rights'
  ],
  openGraph: {
    title: 'Privacy Policy - TheHonestProject',
    description: 'Privacy-first anonymous journaling. Learn how we keep your thoughts secure.',
    url: 'https://thehonestproject.co/privacy',
    type: 'website'
  },
  alternates: {
    canonical: 'https://thehonestproject.co/privacy'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#1a1a1a' }}>
          Privacy Policy
        </h1>

        <div className="prose prose-lg space-y-6" style={{ color: '#4a4a4a' }}>
          <p className="text-sm" style={{ color: '#8a8a8a' }}>
            Last Updated: January 10, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              1. Introduction
            </h2>
            <p>
              "If I Was Honest" ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#3a3a3a' }}>
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address and password (hashed)</li>
              <li><strong>Journal Entries:</strong> Content you write, including text, tags, and metadata</li>
              <li><strong>Profile Information:</strong> Any optional profile details you choose to add</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3" style={{ color: '#3a3a3a' }}>
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address (anonymized)</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Authenticate your account and prevent fraud</li>
              <li>Send important service updates and security alerts</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Respond to your support requests</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-4 font-semibold">
              We DO NOT:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Sell your personal information to third parties</li>
              <li>Share your private journal entries with anyone without your explicit consent</li>
              <li>Use your content for advertising purposes</li>
              <li>Share your data with data brokers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              4. Data Security
            </h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
              <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with high cost factors</li>
              <li><strong>Access Controls:</strong> Strict internal access controls limit who can view data</li>
              <li><strong>Regular Audits:</strong> We conduct regular security audits and updates</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission or storage is 100% secure. While we strive to protect your information,
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              5. Anonymous Sharing
            </h2>
            <p>
              When you choose to publish an entry anonymously to the public feed:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The content becomes publicly visible but is not linked to your account</li>
              <li>No personally identifiable information is included</li>
              <li>You cannot edit or delete published entries (to maintain anonymity)</li>
              <li>We strip metadata that could identify you</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              6. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your private entries are permanently deleted within 30 days</li>
              <li>Your account information is permanently deleted within 30 days</li>
              <li>Anonymous published entries remain public (as they cannot be linked back to you)</li>
              <li>Backup copies are purged within 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of all data we have about you</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data</li>
              <li><strong>Export:</strong> Download your journal entries in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from non-essential communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, email us at contact@mellowsites.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              8. Third-Party Services
            </h2>
            <p>
              We use limited third-party services to operate the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Database Hosting:</strong> Firebase Firestore for data storage</li>
              <li><strong>Hosting:</strong> Netlify for application hosting</li>
            </ul>
            <p className="mt-4">
              These providers are contractually obligated to protect your data and may only use it to provide
              services to us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              9. Cookies
            </h2>
            <p>
              We use essential cookies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Provide security features</li>
            </ul>
            <p className="mt-4">
              We do NOT use tracking cookies or third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              10. Children's Privacy
            </h2>
            <p>
              The Service is not intended for users under 18 years of age. We do not knowingly collect information
              from children. If we discover that we have collected information from someone under 18, we will
              delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              11. International Users
            </h2>
            <p>
              Your information may be transferred to and processed in the United States. By using the Service,
              you consent to this transfer and processing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              12. Legal Disclosure
            </h2>
            <p>
              We may disclose your information if required by law or in good faith belief that such action is necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Comply with legal obligations or court orders</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or abuse</li>
              <li>Respond to emergencies involving danger of death or serious physical injury</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              13. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes via
              email or through the Service. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              14. Contact Us
            </h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:<br />
              <strong>Email:</strong> contact@mellowsites.com
            </p>
          </section>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#e0e0e0' }}>
            <p className="text-sm" style={{ color: '#8a8a8a' }}>
              By using "If I Was Honest," you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
