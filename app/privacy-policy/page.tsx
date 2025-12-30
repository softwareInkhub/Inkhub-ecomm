'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PrivacyPolicyData {
  title?: string
  content?: string
  lastUpdated?: string
}

export default function PrivacyPolicyPage() {
  const router = useRouter()
  const [privacyData, setPrivacyData] = useState<PrivacyPolicyData>({
    title: 'Privacy Policy',
    content: '',
    lastUpdated: 'November 6, 2025'
  })

  // Load privacy policy from config.json
  useEffect(() => {
    const loadPrivacyPolicy = async () => {
      try {
        const response = await fetch('/api/config/privacyPolicy')
        if (response.ok) {
          const data = await response.json()
          if (data && data.content) {
            setPrivacyData({
              title: data.title || 'Privacy Policy',
              content: data.content || '',
              lastUpdated: data.lastUpdated || 'November 6, 2025'
            })
          } else {
            console.warn('Privacy policy data is empty or missing content')
            // Set default content if API returns empty data
            setPrivacyData({
              title: 'Privacy Policy',
              content: 'Privacy policy content is not available at this time.',
              lastUpdated: 'November 6, 2025'
            })
          }
        } else {
          console.error('Failed to fetch privacy policy:', response.status, response.statusText)
          // Set default content on error
          setPrivacyData({
            title: 'Privacy Policy',
            content: 'Privacy policy content is not available at this time. Please try again later.',
            lastUpdated: 'November 6, 2025'
          })
        }
      } catch (error) {
        console.error('Error loading privacy policy:', error)
        // Set default content on error
        setPrivacyData({
          title: 'Privacy Policy',
          content: 'Privacy policy content is not available at this time. Please try again later.',
          lastUpdated: 'November 6, 2025'
        })
      }
    }

    loadPrivacyPolicy()
  }, [])

  // Listen for admin preview updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { sectionId, data } = event.detail
      
      // Handle privacy-policy updates - only update state, let React handle rendering
      if (sectionId === 'privacy-policy' || sectionId === 'privacyPolicy') {
        const updated: Partial<PrivacyPolicyData> = {}
        
        if (data.title !== undefined) {
          updated.title = data.title
        }
        
        if (data.content !== undefined) {
          updated.content = data.content
        }
        
        if (data.lastUpdated !== undefined) {
          updated.lastUpdated = data.lastUpdated
        }
        
        if (Object.keys(updated).length > 0) {
          setPrivacyData(prev => ({ ...prev, ...updated }))
        }
      }
    }

    // Listen for custom events from AdminPreviewHighlighter
    window.addEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)

    return () => {
      window.removeEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)
    }
  }, [])

  // Convert markdown content to HTML
  const renderContent = (content: string) => {
    if (!content) return null

    // Remove leading single # heading if present (main title)
    let processedContent = content.replace(/^#\s+.*?\n\n?/gm, '')
    
    // Split content by sections (## headings)
    const sections = processedContent.split(/^##\s+/gm).filter(s => s.trim())
    
    if (sections.length === 0) {
      // If no sections found, render as plain text
      return (
        <div className="privacy-content-text">
          {content.split('\n\n').map((para, index) => (
            para.trim() && (
              <p key={index} dangerouslySetInnerHTML={{ 
                __html: para
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br>')
              }} />
            )
          ))}
        </div>
      )
    }
    
    return (
      <>
        {sections.map((section, index) => {
          const lines = section.split('\n').filter(l => l.trim())
          const heading = lines[0]?.trim()
          const restOfContent = lines.slice(1).join('\n')
          
          // Split into paragraphs (double newlines)
          const paragraphs = restOfContent.split(/\n\n+/).filter(p => p.trim())
          
          // Use heading as key if available, otherwise use index
          const sectionKey = heading || `section-${index}`
          
          return (
            <section key={sectionKey} className="privacy-section">
              {heading && <h2>{heading}</h2>}
              {paragraphs.length > 0 ? (
                paragraphs.map((para, pIndex) => {
                  const paraKey = `${sectionKey}-para-${pIndex}`
                  return (
                    <p key={paraKey} dangerouslySetInnerHTML={{ 
                      __html: para
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/\n/g, '<br>')
                    }} />
                  )
                })
              ) : (
                <p>No content available.</p>
              )}
            </section>
          )
        })}
      </>
    )
  }

  return (
    <div className="privacy-page">
      <header className="privacy-header">
        <button className="back-btn" onClick={() => router.push('/profile')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="privacy-title">{privacyData.title}</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="privacy-main">
        <div className="privacy-content">
          {privacyData.content ? (
            renderContent(privacyData.content)
          ) : (
            <div>Loading privacy policy...</div>
          )}
          {privacyData.lastUpdated && (
            <div className="privacy-last-updated">
              Last updated: {privacyData.lastUpdated}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
