'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <button className="back-btn" onClick={() => router.push('/profile')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="privacy-title">Privacy Policy</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="privacy-main">
        <div className="privacy-content">
          <section className="privacy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect personal information including your name, phone number, email address, and 
              delivery addresses when you register and use our services. We also collect order history 
              and payment information.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to process orders, provide customer support, send order updates, 
              improve our services, and communicate promotional offers with your consent.
            </p>
          </section>

          <section className="privacy-section">
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with delivery partners and 
              payment processors solely for fulfilling orders. We may also disclose information when 
              required by law.
            </p>
          </section>

          <section className="privacy-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, 
              no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className="privacy-section">
            <h2>5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance user experience, analyze usage patterns, 
              and remember your preferences. You can control cookie settings through your browser.
            </p>
          </section>

          <section className="privacy-section">
            <h2>6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. You can also 
              opt-out of promotional communications. Contact us to exercise these rights.
            </p>
          </section>

          <section className="privacy-section">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide services and comply 
              with legal obligations. Order history may be retained for record-keeping purposes.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the 
              privacy practices of these external sites. Please review their privacy policies.
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for children under 18. We do not knowingly collect personal 
              information from children. If you believe we have collected such data, please contact us.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes via email or app notification. Continued use indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, contact us at privacy@Inkhub.com or 
              +91 98765 43210. We will respond to your inquiries within 48 hours.
            </p>
          </section>

          <div className="privacy-last-updated">
            Last updated: November 6, 2025
          </div>
        </div>
      </main>
    </div>
  )
}
