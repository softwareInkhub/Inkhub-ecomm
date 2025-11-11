'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface DatePickerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: string
  onDateSelect: (dateString: string) => void
}

export default function DatePickerModal({ isOpen, onClose, selectedDate, onDateSelect }: DatePickerModalProps) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()
  
  // Years from 100 years ago to current year only (for DOB)
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 99 + i)
  
  const [date, setDate] = useState(() => {
    if (selectedDate) {
      const d = new Date(selectedDate)
      return {
        month: d.getMonth(),
        day: d.getDate(),
        year: d.getFullYear()
      }
    }
    return {
      month: currentMonth,
      day: currentDay,
      year: currentYear
    }
  })

  const monthRef = useRef<HTMLDivElement>(null)
  const dayRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Check if a date is in the future
  const isFutureDate = (year: number, month: number, day: number) => {
    const selectedDate = new Date(year, month, day)
    const todayDate = new Date(currentYear, currentMonth, currentDay)
    return selectedDate > todayDate
  }

  const daysInMonth = getDaysInMonth(date.month, date.year)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Update 3D transform effect for wheel items
  const updateWheelTransforms = useCallback((container: HTMLDivElement | null) => {
    if (!container) return

    const items = container.querySelectorAll('.wheel-item')
    const containerRect = container.getBoundingClientRect()
    const centerY = containerRect.top + containerRect.height / 2

    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect()
      const itemCenterY = itemRect.top + itemRect.height / 2
      const distance = Math.abs(centerY - itemCenterY)
      const maxDistance = containerRect.height / 2

      // Calculate scale and opacity based on distance from center
      const normalizedDistance = Math.min(distance / maxDistance, 1)
      const scale = 1 - normalizedDistance * 0.2
      const opacity = 1 - normalizedDistance * 0.5

      const htmlItem = item as HTMLElement
      htmlItem.style.transform = `scale(${scale})`
      htmlItem.style.opacity = String(opacity)
      
      // Highlight centered item
      if (distance < 25) {
        htmlItem.style.color = '#111827'
        htmlItem.style.fontWeight = '600'
      } else {
        htmlItem.style.color = '#9ca3af'
        htmlItem.style.fontWeight = '400'
      }
    })
  }, [])

  // Handle scroll snap and update selected value
  const handleScroll = useCallback((wheelRef: React.RefObject<HTMLDivElement | null>, type: 'month' | 'day' | 'year') => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current)
    }

    updateWheelTransforms(wheelRef.current)

    scrollTimerRef.current = setTimeout(() => {
      if (!wheelRef.current) return

      const container = wheelRef.current
      const itemHeight = 50
      const scrollTop = container.scrollTop
      const centerIndex = Math.round(scrollTop / itemHeight)
      
      // Smooth snap to center
      container.scrollTo({
        top: centerIndex * itemHeight,
        behavior: 'smooth'
      })

      // Update selected value based on wheel type
      if (type === 'month') {
        const newMonth = centerIndex
        if (newMonth >= 0 && newMonth < months.length) {
          setDate(prev => ({ ...prev, month: newMonth }))
        }
      } else if (type === 'day') {
        const newDay = centerIndex + 1
        const currentDaysInMonth = getDaysInMonth(date.month, date.year)
        if (newDay >= 1 && newDay <= currentDaysInMonth) {
          setDate(prev => ({ ...prev, day: newDay }))
        }
      } else if (type === 'year') {
        const newYear = years[centerIndex]
        if (newYear) {
          setDate(prev => ({ ...prev, year: newYear }))
        }
      }
    }, 150)
  }, [months.length, date.month, date.year, years, updateWheelTransforms])

  // Initialize wheel positions
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const itemHeight = 50

        if (monthRef.current) {
          monthRef.current.scrollTop = date.month * itemHeight
          updateWheelTransforms(monthRef.current)
        }

        if (dayRef.current) {
          dayRef.current.scrollTop = (date.day - 1) * itemHeight
          updateWheelTransforms(dayRef.current)
        }

        if (yearRef.current) {
          const yearIndex = years.indexOf(date.year)
          yearRef.current.scrollTop = yearIndex * itemHeight
          updateWheelTransforms(yearRef.current)
        }
      }, 100)
    }
  }, [isOpen, date.month, date.day, date.year, years, updateWheelTransforms])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleDone = () => {
    // Validate that the selected date is not in the future
    if (isFutureDate(date.year, date.month, date.day)) {
      alert('Please select a date that is not in the future.')
      return
    }
    
    const selectedDateString = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    onDateSelect(selectedDateString)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="date-picker-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-picker-title"
    >
      <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="date-picker-handle"></div>
        <h2 id="date-picker-title" className="date-picker-title">Select Date</h2>
        
        <div className="date-picker-wheels-container">
          <div className="date-picker-highlight-bar"></div>
          <div className="date-picker-fade-top"></div>
          <div className="date-picker-fade-bottom"></div>
          
          <div className="date-picker-wheels">
            {/* Month Wheel */}
            <div 
              className="date-picker-wheel" 
              ref={monthRef}
              onScroll={() => handleScroll(monthRef, 'month')}
              aria-label="Month selector"
            >
              <div className="wheel-spacer"></div>
              {months.map((month, index) => {
                const isDisabled = date.year === currentYear && index > currentMonth
                return (
                  <div
                    key={month}
                    className={`wheel-item ${isDisabled ? 'disabled' : ''}`}
                    data-value={index}
                  >
                    {month}
                  </div>
                )
              })}
              <div className="wheel-spacer"></div>
            </div>

            {/* Day Wheel */}
            <div 
              className="date-picker-wheel date-picker-wheel-day" 
              ref={dayRef}
              onScroll={() => handleScroll(dayRef, 'day')}
              aria-label="Day selector"
            >
              <div className="wheel-spacer"></div>
              {days.map((day) => {
                const isDisabled = date.year === currentYear && date.month === currentMonth && day > currentDay
                return (
                  <div
                    key={day}
                    className={`wheel-item ${isDisabled ? 'disabled' : ''}`}
                    data-value={day}
                  >
                    {day}
                  </div>
                )
              })}
              <div className="wheel-spacer"></div>
            </div>

            {/* Year Wheel */}
            <div 
              className="date-picker-wheel date-picker-wheel-year" 
              ref={yearRef}
              onScroll={() => handleScroll(yearRef, 'year')}
              aria-label="Year selector"
            >
              <div className="wheel-spacer"></div>
              {years.map((year, index) => (
                <div
                  key={year}
                  className="wheel-item"
                  data-value={index}
                >
                  {year}
                </div>
              ))}
              <div className="wheel-spacer"></div>
            </div>
          </div>
        </div>

        <button className="date-picker-done-btn" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  )
}

