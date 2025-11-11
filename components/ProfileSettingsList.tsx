'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface ProfileSettingsListProps {
  onLogout: (() => void) | null
}

const ProfileSettingsList: React.FC<ProfileSettingsListProps> = ({ onLogout }) => {
  const router = useRouter()

  const settingsItems = [
    {
      label: 'Manage Account',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      onClick: () => router.push('/manage-account')
    },
    {
      label: 'Addresses',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      onClick: () => router.push('/manage-addresses')
    },
    {
      label: 'Cart',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 6H21" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      onClick: () => router.push('/cart')
    },
    {
      label: 'Terms & Conditions',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      onClick: () => router.push('/terms-conditions')
    },
    {
      label: 'Privacy Policy',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      onClick: () => router.push('/privacy-policy')
    },
    {
      label: 'Log Out',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      ),
      onClick: onLogout,
      isLogout: true
    }
  ]

  return (
    <div className="profile-settings-list">
      {settingsItems
        .filter(item => !item.isLogout || onLogout)
        .map((item, index) => (
          <button
            key={index}
            className={`profile-settings-item ${item.isLogout ? 'profile-settings-item-logout' : ''}`}
            onClick={item.onClick || undefined}
          >
            <div className="profile-settings-item-left">
              {item.icon}
              <span>{item.label}</span>
            </div>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
    </div>
  )
}

export default ProfileSettingsList

