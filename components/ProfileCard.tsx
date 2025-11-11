'use client'

import React from 'react'

interface ProfileCardProps {
  phoneNumber: string
  totalSpent: number
}

const ProfileCard: React.FC<ProfileCardProps> = ({ phoneNumber, totalSpent }) => {
  const levelThreshold = 10000
  const currentLevel = Math.floor(totalSpent / levelThreshold)
  const nextLevel = currentLevel + 1
  const progressToNextLevel = (totalSpent % levelThreshold) / levelThreshold * 100

  return (
    <div className="profile-card">
      <div className="profile-user-info">
        <div className="profile-phone">+91 {phoneNumber}</div>
        <div className="profile-level">Lvl {currentLevel.toString().padStart(2, '0')}</div>
      </div>
      
      <div className="profile-progress-section">
        <div className="profile-progress-info">
          <span className="profile-progress-label">₹{Math.floor(totalSpent)} Total spent</span>
          <span className="profile-progress-label">₹{nextLevel * levelThreshold} Lvl {nextLevel.toString().padStart(2, '0')}</span>
        </div>
        <div className="profile-progress-bar">
          <div 
            className="profile-progress-fill" 
            style={{ width: `${progressToNextLevel}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard

