'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavbar from '@/components/BottomNavbar'
import ProfileHeader from '@/components/ProfileHeader'
import ProfileCard from '@/components/ProfileCard'
import ProfileSummaryCards from '@/components/ProfileSummaryCards'
import ProfileActionGrid from '@/components/ProfileActionGrid'
import ProfileSettingsList from '@/components/ProfileSettingsList'
import LoginModal from '@/components/LoginModal'
import ContactModal from '@/components/ContactModal'

export default function ProfilePage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [totalSpent, setTotalSpent] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [knotCash, setKnotCash] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
      setIsAuthenticated(authenticated)
      
      if (authenticated) {
        const phone = localStorage.getItem('bagichaPhoneNumber') || ''
        // Format phone number to show last 4 digits with X's for privacy
        if (phone && phone.length === 10) {
          setPhoneNumber(`XXXXXX${phone.slice(-4)}`)
        } else {
          setPhoneNumber('XXXXXX8553')
        }
        
        // Get order count and total spent from localStorage (or default to 0)
        const orders = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
        setOrderCount(orders.length)
        const total = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0)
        setTotalSpent(total)
        
        // Get knot cash (or default to 0)
        const cash = localStorage.getItem('bagichaKnotCash') || '0'
        setKnotCash(parseFloat(cash))
      }
    }

    checkAuth()
    
    window.addEventListener('authChanged', checkAuth)
    window.addEventListener('focus', checkAuth)
    
    return () => {
      window.removeEventListener('authChanged', checkAuth)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.setItem('Inkhubuthenticated', 'false')
    localStorage.removeItem('bagichaPhoneNumber')
    window.dispatchEvent(new Event('authChanged'))
    setShowLogoutModal(false)
    router.push('/')
  }

  const handleLoginClick = () => {
    setShowLoginModal(true)
  }

  return (
    <div className="profile-page">
      <ProfileHeader />
      
      <main className="profile-main">
        {isAuthenticated ? (
          <>
            <ProfileCard phoneNumber={phoneNumber} totalSpent={totalSpent} />
            <ProfileSummaryCards orderCount={orderCount} knotCash={knotCash} />
            <ProfileActionGrid onHelpClick={() => setShowContactModal(true)} />
            <ProfileSettingsList onLogout={handleLogout} />
          </>
        ) : (
          <>
            {/* Logged Out State */}
            <div className="profile-login-prompt" onClick={handleLoginClick}>
              <h2 className="profile-login-title">Tap here to Sign up/Login</h2>
              <p className="profile-login-subtitle">
                Login for a personalized experience, exclusive discounts, Inkhub cash rebates and more!
              </p>
            </div>
            
            <ProfileActionGrid onHelpClick={() => setShowContactModal(true)} />
            <ProfileSettingsList onLogout={null} />
          </>
        )}
      </main>
      
      <BottomNavbar />
      
      <LoginModal 
        show={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => router.push('/otp')}
      />
      
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {showLogoutModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-handle"></div>
            <h3 className="confirm-modal-title">Logging out?</h3>
            <p className="confirm-modal-message">Thanks for stopping by, see you again soon!</p>
            <div className="confirm-modal-buttons">
              <button className="confirm-modal-btn delete" onClick={confirmLogout}>
                Log out
              </button>
              <button className="confirm-modal-btn cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
