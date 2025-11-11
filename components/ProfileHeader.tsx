'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const ProfileHeader = () => {
  const router = useRouter()

  return (
    <header className="profile-header">
      <div className="profile-header-content">
        <button className="back-btn" onClick={() => router.push('/')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="profile-header-title">Profile</h1>
        <div style={{ width: '24px' }}></div>
      </div>
    </header>
  )
}

export default ProfileHeader

