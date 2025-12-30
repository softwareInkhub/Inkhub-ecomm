'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReferEarnPage() {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const referralCode = 'INK250'
  const totalEarned = 0

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareLink = () => {
    const message = `Join Inkhub and get amazing tattoos! Use my referral code ${referralCode} to get ₹250 off on your first order. Download now: https://Inkhub.app`
    
    if (navigator.share) {
      navigator.share({
        title: 'Inkhub Referral',
        text: message,
        url: 'https://Inkhub.app'
      }).catch(() => {
        // Fallback to WhatsApp if share fails
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
      })
    } else {
      // Fallback to WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  return (
    <div className="refer-page-v2">
      <header className="refer-header-v2">
        <button className="back-btn" onClick={() => router.push('/profile')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="refer-title-v2">Refer & Earn</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="refer-main-v2">
        {/* Referral Banner */}
        <div data-section-id="invite" className="refer-banner">
          <div className="refer-banner-bg">
            <div className="refer-starburst"></div>
          </div>
          <div className="refer-banner-content">
            <div className="refer-banner-text">
              <h2 className="refer-banner-title">
                REFER & 
                <svg className="refer-star-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9"/>
                </svg>
                EARN ₹250
              </h2>
              <p className="refer-banner-subtitle">FOR EVERY SUCCESSFUL REFERRAL TO A FRIEND</p>
            </div>
            <div className="refer-banner-illustration">
              <div className="refer-wallet">💰</div>
            </div>
          </div>
          <div className="refer-banner-footer">
            <div className="refer-code-display">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{referralCode}</span>
            </div>
            <button className="refer-share-btn" onClick={handleShareLink}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="19" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round"/>
              </svg>
              Share Link
            </button>
          </div>
        </div>

        {/* How it Works */}
        <div className="refer-how-card">
          <h3 className="refer-section-title">How it works</h3>
          <div className="refer-steps-container">
            <div className="refer-step-item">
              <div className="refer-step-icon refer-step-icon-blue">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="refer-step-connector"></div>
              <div className="refer-step-text">
                <p>Share the referral code/link with your friends.</p>
              </div>
            </div>

            <div className="refer-step-item">
              <div className="refer-step-icon refer-step-icon-yellow">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 8v6M23 11h-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="refer-step-connector"></div>
              <div className="refer-step-text">
                <p>You and your friend both get ₹250 when your friend places their first order using your referral code.</p>
              </div>
            </div>

            <div className="refer-step-item">
              <div className="refer-step-icon refer-step-icon-green">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="refer-step-text">
                <p>Earn ₹2500 for the first 10 successful referrals.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div data-section-id="rewards" className="refer-summary-card">
          <h3 className="refer-section-title">Summary</h3>
          <div className="refer-summary-item">
            <div className="refer-summary-label">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Total Earned</span>
            </div>
            <span className="refer-summary-value">₹{totalEarned}</span>
          </div>
        </div>

        {/* Your Referrals */}
        <div className="refer-referrals-card">
          <h3 className="refer-section-title">Your Referrals</h3>
          <p className="refer-referrals-empty">
            You have not referred anyone yet, start referring now to earn rewards
          </p>
          
          <div className="refer-code-row">
            <span className="refer-code-label">Share Referral Code</span>
            <div className="refer-code-copy">
              <span className="refer-code-value">{referralCode}</span>
              <button className="refer-copy-icon" onClick={handleCopyCode}>
                {copied ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="refer-share-link-btn" onClick={handleShareLink}>
            Share Referral Link
          </button>
        </div>
      </main>
    </div>
  )
}

