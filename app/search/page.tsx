'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RecentlyViewedSection from '@/components/RecentlyViewedSection'
import WishlistToast from '@/components/WishlistToast'

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function SearchPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  
  const plantNames = [
    'Spiritual Collection', 'Love & Couple Tattoos', 'Anime & Pop Tattoos', 'Animal Tattoos', 'Minimal Tattoos',
    'Bold & Dark Tattoos', 'Tattoos Packs', 'Body Placement Tattoos', 'Lifestyle Tattoos', 'Tattoos Size & Type'
  ]

  const popularSearches = [
    'Spiritual Collection', 'Anime & Pop Tattoos', 'Minimal Tattoos', 'Animal Tattoos',
    'Love & Couple Tattoos', 'Bold & Dark Tattoos', 'Tattoos Packs', 'Body Placement Tattoos'
  ]

  useEffect(() => {
    let currentPlantIndex = 0
    setPlaceholder(`Search for ${plantNames[currentPlantIndex]}...`)
    
    const interval = setInterval(() => {
      currentPlantIndex = (currentPlantIndex + 1) % plantNames.length
      setPlaceholder(`Search for ${plantNames[currentPlantIndex]}...`)
    }, 2000)
    
    const recent = JSON.parse(localStorage.getItem('bagichaRecentSearches') || '[]')
    setRecentSearches(recent)
    
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setSearchTerm(transcript)
        setIsListening(false)
      }
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.')
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable microphone permissions.')
        }
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      setRecognition(recognitionInstance)
    }
    
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (term: string) => {
    if (!term.trim()) return
    
    // Save to recent searches
    let recent = JSON.parse(localStorage.getItem('bagichaRecentSearches') || '[]')
    recent = recent.filter((t: string) => t.toLowerCase() !== term.toLowerCase())
    recent.unshift(term)
    if (recent.length > 10) recent = recent.slice(0, 10)
    localStorage.setItem('bagichaRecentSearches', JSON.stringify(recent))
    setRecentSearches(recent)
    
    // Check if the search term matches a category name
    const categoryNames = [
      'Spiritual Collection', 'Love & Couple Tattoos', 'Anime & Pop Tattoos', 
      'Animal Tattoos', 'Minimal Tattoos', 'Bold & Dark Tattoos', 
      'Tattoos Packs', 'Body Placement Tattoos', 'Lifestyle Tattoos', 
      'Tattoos Size & Type'
    ]
    
    const matchedCategory = categoryNames.find(
      cat => cat.toLowerCase() === term.toLowerCase()
    )
    
    if (matchedCategory) {
      // Navigate to the category page
      router.push(`/category/${encodeURIComponent(matchedCategory)}`)
    } else {
      // If no exact match, try partial match
      const partialMatch = categoryNames.find(
        cat => cat.toLowerCase().includes(term.toLowerCase()) || 
               term.toLowerCase().includes(cat.toLowerCase())
      )
      
      if (partialMatch) {
        router.push(`/category/${encodeURIComponent(partialMatch)}`)
      } else {
        // If no category match, show a message
        alert(`No category found for: ${term}. Try searching for specific categories like "Anime & Pop Tattoos" or "Minimal Tattoos"`)
      }
    }
  }

  const handleVoiceSearch = () => {
    if (!recognition) {
      alert('Voice search is not supported in your browser. Please try Chrome or Edge.')
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setSearchTerm('')
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-header-content">
          <button className="back-btn" onClick={() => router.back()}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="search-bar-container">
            <input 
              type="text" 
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch(searchTerm)}
              placeholder={isListening ? 'Listening...' : placeholder}
              autoFocus
            />
            <button 
              className={`voice-search-btn ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceSearch}
              aria-label="Voice search"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="19" x2="12" y2="23" strokeLinecap="round"/>
                <line x1="8" y1="23" x2="16" y2="23" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="search-main">
        <div className="search-content">
          {recentSearches.length > 0 && (
            <div className="search-section">
              <h3 className="search-section-title">Recent Searches</h3>
              <div className="search-results-list">
                {recentSearches.map((term, idx) => (
                  <div key={idx} className="search-result-item" onClick={() => handleSearch(term)}>
                    <svg className="search-result-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
                      <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                    </svg>
                    <span className="search-result-text">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="search-section">
            <h3 className="search-section-title">Popular Searches</h3>
            <div className="search-results-list">
              {popularSearches.map((term, idx) => (
                <div key={idx} className="search-result-item" onClick={() => handleSearch(term)}>
                  <svg className="search-result-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
                    <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                  </svg>
                  <span className="search-result-text">{term}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Viewed Items */}
          <RecentlyViewedSection />
        </div>
      </main>

      {/* Wishlist Toast */}
      <WishlistToast />
    </div>
  )
}
