'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const BottomNavbar: React.FC = () => {
  const [hidden, setHidden] = useState(false)
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)
  const prevScrollY = useRef(0)

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
      setCartCount(cartItems.length)
    }

    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 50) {
        setHidden(false)
      } else if (currentScrollY > prevScrollY.current) {
        setHidden(true)
      } else if (currentScrollY < prevScrollY.current) {
        setHidden(false)
      }

      prevScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => pathname === path

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav
      className={`${hidden ? 'hidden' : ''}`}
      style={{
        /* .bottom-navbar from CSS */
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: hidden ? 'translateX(-50%) translateY(100%)' : 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        zIndex: 100,
        background: '#171717',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',

        padding: '4px 0 calc(4px + env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        transition: 'transform 0.3s ease'
      }}
      role="navigation"
    >
      <div style={{ display: 'contents' }}>
        {pathname === '/' ? (
          <button
            onClick={handleHomeClick}
            style={{
              /* .nav-item from CSS */
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 20px',
              color: isActive('/') ? 'rgb(0, 171, 107)' : '#b0b0b0',
              transition: 'color 0.2s',
              fontSize: '12px',
              fontWeight: '600',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 8.5V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V8.5L12 3Z" fill="currentColor" />
            </svg>
            <span>Home</span>
          </button>
        ) : (
          <Link
            href="/"
            style={{
              /* .nav-item from CSS */
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 20px',
              color: isActive('/') ? 'rgb(0, 171, 107)' : '#b0b0b0',
              transition: 'color 0.2s',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L4 8.5V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V8.5L12 3Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Home</span>
          </Link>
        )}

        <Link
          href="/categories"
          style={{
            /* .nav-item from CSS */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 20px',
            color: isActive('/categories') ? 'rgb(0, 171, 107)' : '#b0b0b0',
            transition: 'color 0.2s',
            fontSize: '12px',
            fontWeight: '500',
            textDecoration: 'none'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#e9e8e8" viewBox="0 0 256 256"><path d="M120,56v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40h48A16,16,0,0,1,120,56Zm80-16H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-96,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96,0H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z"></path></svg>
          <span>Categories</span>
        </Link>

        <Link
          href="/trends"
          style={{
            /* .nav-item from CSS */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 20px',
            color: isActive('/trends') ? 'rgb(0, 171, 107)' : '#b0b0b0',
            transition: 'color 0.2s',
            fontSize: '12px',
            fontWeight: '500',
            textDecoration: 'none'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10Z" fill="currentColor" />
            <path d="M9 13C9 13.7956 9.31607 14.5587 9.87868 15.1213C10.4413 15.6839 11.2044 16 12 16C12.7956 16 13.5587 15.6839 14.1213 15.1213C14.6839 14.5587 15 13.7956 15 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>Trends</span>
        </Link>

        <Link
          href="/cart"
          style={{
            /* .nav-item from CSS */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 20px',
            color: isActive('/cart') ? 'rgb(0, 171, 107)' : '#b0b0b0',
            transition: 'color 0.2s',
            fontSize: '12px',
            fontWeight: '500',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              /* .nav-item-icon-wrapper from CSS */
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-handbag-icon lucide-handbag"><path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z"/><path d="M8 11V6a4 4 0 0 1 8 0v5"/></svg>


            {cartCount > 0 && (
              <span
                style={{
                  /* .cart-badge from CSS */
                  position: 'absolute',
                  top: '-2px',
                  right: '0',
                  background: '#1a1a1a',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600',
                  lineHeight: 1,
                  border: '2px solid white'
                }}
              >
                {cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </Link>
      </div>
    </nav>
  )
}

export default BottomNavbar

