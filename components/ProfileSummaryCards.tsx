'use client'

import React from 'react'

interface ProfileSummaryCardsProps {
  orderCount: number
  knotCash: number
}

const ProfileSummaryCards: React.FC<ProfileSummaryCardsProps> = ({ orderCount, knotCash }) => {
  return (
    <div className="profile-summary-cards">
      <div className="profile-summary-card">
        <div className="profile-summary-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div className="profile-summary-text">Order Count</div>
        <div className="profile-summary-value">{orderCount}</div>
      </div>
      
      <div className="profile-summary-card">
        <div className="profile-summary-icon">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
        <div className="profile-summary-text">Inkhub cash</div>
        <div className="profile-summary-value">₹{knotCash}</div>
      </div>
    </div>
  )
}

export default ProfileSummaryCards

