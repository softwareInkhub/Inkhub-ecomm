'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function TermsConditionsPage() {
  const router = useRouter()

  return (
    <div className="terms-page">
      <header className="terms-header">
        <button className="back-btn" onClick={() => router.push('/profile')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="terms-title">Terms & Conditions</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="terms-main">
        <div className="terms-content">
          <section className="terms-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Inkhub. By accessing and using our services, you agree to be bound by these 
              Terms and Conditions. Please read them carefully before using our platform.
            </p>
          </section>

          <section className="terms-section">
            <h2>2. Use of Service</h2>
            <p>
              You must be at least 18 years old to use our services. By using Inkhub, you represent 
              that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>3. Account Registration</h2>
            <p>
              To place orders, you must create an account with accurate information. You are responsible 
              for maintaining the confidentiality of your account credentials and for all activities that 
              occur under your account.
            </p>
          </section>

          <section className="terms-section">
            <h2>4. Orders and Payments</h2>
            <p>
              All orders are subject to product availability. We reserve the right to refuse or cancel 
              any order at our discretion. Prices are subject to change without notice. Payment must be 
              made in full before delivery.
            </p>
          </section>

          <section className="terms-section">
            <h2>5. Delivery</h2>
            <p>
              We strive to deliver within 60 minutes, but delivery times may vary based on location and 
              circumstances beyond our control. We are not liable for delays in delivery.
            </p>
          </section>

          <section className="terms-section">
            <h2>6. Returns and Refunds</h2>
            <p>
              Returns are accepted within 7 days of delivery for defective or damaged products. Refunds 
              will be processed within 5-7 business days after approval.
            </p>
          </section>

          <section className="terms-section">
            <h2>7. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on Inkhub belong to us. You may not 
              use, copy, or distribute any content without our prior written permission.
            </p>
          </section>

          <section className="terms-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              Inkhub shall not be liable for any indirect, incidental, or consequential damages arising 
              from the use of our services. Our total liability shall not exceed the amount paid for the order.
            </p>
          </section>

          <section className="terms-section">
            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of our services after 
              changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="terms-section">
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@Inkhub.com or 
              call +91 98765 43210.
            </p>
          </section>

          <div className="terms-last-updated">
            Last updated: November 6, 2025
          </div>
        </div>
      </main>
    </div>
  )
}
