import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | TheHonestProject - User Agreement',
  description: 'Legal terms and conditions for using TheHonestProject anonymous journaling platform. Understand your rights and responsibilities.',
  keywords: [
    'terms of service',
    'user agreement',
    'terms and conditions',
    'legal terms',
    'usage policy',
    'platform rules',
    'user rights',
    'community guidelines'
  ],
  openGraph: {
    title: 'Terms & Conditions - TheHonestProject',
    description: 'Legal terms and conditions for using TheHonestProject.',
    url: 'https://thehonestproject.co/terms',
    type: 'website'
  },
  alternates: {
    canonical: 'https://thehonestproject.co/terms'
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

export default function TermsPage() {
  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#fafafa' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: '#1a1a1a' }}>
          Terms and Conditions
        </h1>

        <div className="prose prose-lg space-y-6" style={{ color: '#4a4a4a' }}>
          <p className="text-sm" style={{ color: '#8a8a8a' }}>
            Last Updated: January 11, 2026
          </p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using If I Was Honest ("the Service", "Platform", "we", "us", or "our"),
              you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any
              part of these terms, you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years of age to use this Service. If you are under 18, you must
              have parental or guardian consent. By using the Service, you represent and warrant that
              you meet these age requirements and have the legal capacity to enter into these Terms.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              3. Description of Service
            </h2>
            <p>
              If I Was Honest is a journaling and anonymous sharing platform that allows users to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Create private journal entries for personal reflection</li>
              <li>Share posts anonymously to a public feed</li>
              <li>Express emotions through mood tagging</li>
              <li>Connect with others through shared experiences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              4. User Accounts
            </h2>
            <p>
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or
              engage in fraudulent, abusive, or illegal activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              5. User Content and Ownership
            </h2>
            <p>
              <strong>5.1 Your Content:</strong> You retain all ownership rights to content you create and post
              on the Service ("User Content"). By posting content, you grant us a worldwide, non-exclusive,
              royalty-free, sublicensable license to use, reproduce, adapt, publish, translate, and distribute
              your User Content in connection with operating and improving the Service.
            </p>
            <p className="mt-4">
              <strong>5.2 Public Posts:</strong> When you share a post anonymously to the public feed:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You can delete it within 24 hours of posting</li>
              <li>After 24 hours, the post becomes permanent and part of the community</li>
              <li>You have a lifetime limit of 50 public post deletions (within the 24-hour window)</li>
              <li>Posts remain anonymous - your identity is not revealed</li>
              <li>Deleted posts are removed from public view but may be retained for legal compliance</li>
            </ul>
            <p className="mt-4">
              <strong>5.3 Private Journal Entries:</strong> Private journal entries remain private and can
              be deleted at any time without restriction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              6. Prohibited Conduct
            </h2>
            <p>
              You agree NOT to use the Service to post, transmit, or otherwise make available any content that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
              <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary rights</li>
              <li>Contains viruses, malware, or any harmful computer code</li>
              <li>Impersonates any person or entity or misrepresents your affiliation with anyone</li>
              <li>Constitutes spam, chain letters, or unauthorized advertising</li>
              <li>Contains child sexual abuse material (CSAM) or sexualizes minors in any way</li>
              <li>Directly encourages or incites violence, self-harm, or illegal activity</li>
              <li>Violates the privacy or publicity rights of others</li>
              <li>Involves the sale of illegal goods, services, or substances</li>
            </ul>
            <p className="mt-4">
              You also agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use automated systems (bots, scrapers) without our prior written consent</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Remove any copyright, trademark, or proprietary notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              7. Content Moderation
            </h2>
            <p>
              While we encourage honest expression, we reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Review, monitor, and remove any User Content that violates these Terms</li>
              <li>Suspend or terminate accounts that repeatedly violate our policies</li>
              <li>Cooperate with law enforcement investigations</li>
              <li>Implement automated systems to detect prohibited content</li>
            </ul>
            <p className="mt-4">
              We are not obligated to monitor User Content but reserve the right to do so.
              We do not pre-screen content and are not responsible for content posted by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              8. Content Warning and User Discretion
            </h2>
            <p>
              This Service allows uncensored, honest sharing of thoughts and feelings. You may encounter
              content discussing:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Mental health struggles, depression, anxiety</li>
              <li>Trauma, abuse, or difficult life experiences</li>
              <li>Substance use or addiction</li>
              <li>Grief, loss, or existential topics</li>
              <li>Other sensitive or potentially triggering subjects</li>
            </ul>
            <p className="mt-4">
              <strong>You use this Service at your own risk.</strong> We are not responsible for emotional
              distress or harm resulting from content you encounter. If you are in crisis, please seek
              professional help immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              9. Not Medical or Therapeutic Services
            </h2>
            <p>
              <strong>IMPORTANT:</strong> This Service is NOT a substitute for professional mental health
              care, therapy, counseling, or medical advice. The Service does not provide medical or
              therapeutic services. User Content is not reviewed by licensed professionals.
            </p>
            <p className="mt-4">
              <strong>Crisis Resources:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>988 Suicide & Crisis Lifeline (US):</strong> Call or text 988</li>
              <li><strong>Crisis Text Line:</strong> Text "HOME" to 741741</li>
              <li><strong>International:</strong> Visit <a href="https://findahelpline.com" target="_blank" rel="nofollow noopener noreferrer" className="underline text-blue-600">findahelpline.com</a></li>
            </ul>
            <p className="mt-4">
              If you or someone you know is in immediate danger, call emergency services (911 in the US).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              10. Privacy and Data
            </h2>
            <p>
              Your privacy is important to us. Our collection, use, and protection of your personal
              information is governed by our Privacy Policy, which is incorporated into these Terms by
              reference. By using the Service, you consent to our data practices as described in the
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              11. Account Deletion and Data Retention
            </h2>
            <p>
              <strong>11.1 Grace Period:</strong> When you request account deletion, you have a 24-hour
              grace period to cancel the deletion. After 24 hours, deletion becomes permanent.
            </p>
            <p className="mt-4">
              <strong>11.2 What Gets Deleted:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your private journal entries</li>
              <li>Your personal information (email, name)</li>
              <li>Your authentication account</li>
            </ul>
            <p className="mt-4">
              <strong>11.3 What Remains:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your public posts remain in the database (anonymized)</li>
              <li>Your user ID is replaced with "[deleted]"</li>
              <li>Post content, moods, and tags remain to preserve community value</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              12. Intellectual Property
            </h2>
            <p>
              The Service, including its original content, features, and functionality, is owned by
              If I Was Honest and is protected by international copyright, trademark, patent, trade
              secret, and other intellectual property laws.
            </p>
            <p className="mt-4">
              You may not copy, modify, distribute, sell, or lease any part of our Service or software,
              nor may you reverse engineer or attempt to extract source code, unless expressly permitted
              by law or with our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              13. Third-Party Links and Services
            </h2>
            <p>
              The Service may contain links to third-party websites or services that are not owned or
              controlled by us. We have no control over, and assume no responsibility for, the content,
              privacy policies, or practices of any third-party sites or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              14. Disclaimers and Warranties
            </h2>
            <p className="font-semibold">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Uninterrupted, secure, or error-free operation</li>
            </ul>
            <p className="mt-4">
              We do not warrant that the Service will meet your requirements, that defects will be
              corrected, or that the Service is free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              15. Limitation of Liability
            </h2>
            <p className="font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL IF I WAS HONEST,
              ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, use, or goodwill</li>
              <li>Service interruptions or data loss</li>
              <li>Cost of substitute goods or services</li>
              <li>Emotional distress or psychological harm</li>
            </ul>
            <p className="mt-4">
              WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL
              THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-4">
              IN JURISDICTIONS THAT DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY, OUR
              LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              16. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless If I Was Honest and its officers,
              directors, employees, contractors, agents, licensors, and suppliers from and against
              any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable
              attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another person or entity</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              17. Dispute Resolution and Arbitration
            </h2>
            <p>
              <strong>17.1 Informal Resolution:</strong> Before filing a claim, you agree to contact us
              at contact@mellowsites.com to attempt to resolve the dispute informally.
            </p>
            <p className="mt-4">
              <strong>17.2 Binding Arbitration:</strong> If informal resolution fails, any dispute arising
              from these Terms or the Service shall be resolved through binding arbitration, except that
              either party may bring suit in court for injunctive or equitable relief.
            </p>
            <p className="mt-4">
              <strong>17.3 Class Action Waiver:</strong> You agree to resolve disputes individually.
              You waive any right to participate in class actions or class arbitrations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              18. Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State
              of Delaware, United States, without regard to its conflict of law provisions. Any legal
              action or proceeding arising under these Terms shall be brought exclusively in the courts
              located in Delaware, and you irrevocably consent to personal jurisdiction and venue there.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              19. Termination
            </h2>
            <p>
              <strong>19.1 By You:</strong> You may terminate your account at any time through account
              settings or by contacting us at contact@mellowsites.com.
            </p>
            <p className="mt-4">
              <strong>19.2 By Us:</strong> We may terminate or suspend your access immediately, without
              prior notice or liability, for any reason, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>At our sole discretion</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the Service will immediately cease. Provisions that by
              their nature should survive termination shall survive, including ownership, warranty
              disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              20. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time at our sole discretion.
              If a revision is material, we will provide at least 30 days' notice before new terms take
              effect via:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email notification to your registered email address</li>
              <li>Prominent notice on the Service</li>
            </ul>
            <p className="mt-4">
              Your continued use of the Service after changes become effective constitutes acceptance
              of the revised Terms. If you do not agree to the new terms, you must stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              21. Severability
            </h2>
            <p>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the
              validity, legality, and enforceability of the remaining provisions shall not be affected
              or impaired.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              22. Entire Agreement
            </h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and If I Was Honest regarding the Service and supersede all prior agreements and
              understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={{ color: '#2a2a2a' }}>
              23. Contact Information
            </h2>
            <p>
              For questions, concerns, or notices regarding these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
              <p><strong>Email:</strong> contact@mellowsites.com</p>
              <p className="mt-2"><strong>Service Name:</strong> If I Was Honest</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t" style={{ borderColor: '#e0e0e0' }}>
            <p className="text-sm font-semibold" style={{ color: '#2a2a2a' }}>
              Acknowledgment
            </p>
            <p className="text-sm mt-2" style={{ color: '#6a6a6a' }}>
              BY USING IF I WAS HONEST, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE
              TO BE BOUND BY THESE TERMS AND CONDITIONS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT
              USE THE SERVICE.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
