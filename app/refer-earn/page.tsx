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
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ffffff" viewBox="0 0 256 256"><path d="M184,64H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H184a8,8,0,0,0,8-8V72A8,8,0,0,0,184,64Zm-8,144H48V80H176ZM224,40V184a8,8,0,0,1-16,0V48H72a8,8,0,0,1,0-16H216A8,8,0,0,1,224,40Z"></path></svg>
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
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"></path></svg>
              </div>
              <div className="refer-step-connector"></div>
              <div className="refer-step-text">
                <p>Share the referral code/link with your friends.</p>
              </div>
            </div>

            <div className="refer-step-item">
              <div className="refer-step-icon refer-step-icon-yellow">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M254.3,107.91,228.78,56.85a16,16,0,0,0-21.47-7.15L182.44,62.13,130.05,48.27a8.14,8.14,0,0,0-4.1,0L73.56,62.13,48.69,49.7a16,16,0,0,0-21.47,7.15L1.7,107.9a16,16,0,0,0,7.15,21.47l27,13.51,55.49,39.63a8.06,8.06,0,0,0,2.71,1.25l64,16a8,8,0,0,0,7.6-2.1l40-40,15.08-15.08,26.42-13.21a16,16,0,0,0,7.15-21.46Zm-54.89,33.37L165,113.72a8,8,0,0,0-10.68.61C136.51,132.27,116.66,130,104,122L147.24,80h31.81l27.21,54.41Zm-41.87,41.86L99.42,168.61l-49.2-35.14,28-56L128,64.28l9.8,2.59-45,43.68-.08.09a16,16,0,0,0,2.72,24.81c20.56,13.13,45.37,11,64.91-5L188,152.66Zm-25.72,34.8a8,8,0,0,1-7.75,6.06,8.13,8.13,0,0,1-1.95-.24L80.41,213.33a7.89,7.89,0,0,1-2.71-1.25L51.35,193.26a8,8,0,0,1,9.3-13l25.11,17.94L126,208.24A8,8,0,0,1,131.82,217.94Z"></path></svg>
              </div>
              <div className="refer-step-connector"></div>
              <div className="refer-step-text">
                <p>You and your friend both get ₹250 when your friend places their first order using your referral code.</p>
              </div>
            </div>

            <div className="refer-step-item">
              <div className="refer-step-icon refer-step-icon-green">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm38.32,72H176a8,8,0,0,1,0,16h-8.19A44.06,44.06,0,0,1,124,152H111.32l53.59,41.69a8,8,0,1,1-9.82,12.62l-72-56A8,8,0,0,1,88,136h36a28,28,0,0,0,27.71-24H88a8,8,0,0,1,0-16h61.29A28,28,0,0,0,124,80H88a8,8,0,0,1,0-16h88a8,8,0,0,1,0,16H157.92A43.87,43.87,0,0,1,166.32,96Z"></path></svg>
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
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm0,128H56a8,8,0,0,1-8-8V78.63A23.84,23.84,0,0,0,56,80H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,132Z"></path></svg>
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

