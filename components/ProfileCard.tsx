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
    <div className="profile-card relative w-full h-[240px] rounded-xl overflow-hidden bg-gradient-to-r from-[#979797] to-[#656565] shadow-lg p-4 text-white">
      {/* Gradient overlay for the soft light effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#3b3b3b]/60 to-transparent pointer-events-none"></div>

      {/* Card content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="text-3xl font-semibold tracking-wider">XXXXXX{phoneNumber.slice(-4)}</div>
          <div className="text-sm text-white-300">Lvl {currentLevel.toString().padStart(2, '0')}</div>
        </div>

        <div className="mt-auto">
          <div className="text-sm mb-1 text-white-300">Level Progress</div>

          <div className="flex justify-between text-xs text-white-400 mb-1">
            <span>₹{Math.floor(totalSpent)}</span>
            <span>₹{nextLevel * levelThreshold}</span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6a6a6a] to-[#b0b0b0]"
              style={{ width: `${progressToNextLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard

