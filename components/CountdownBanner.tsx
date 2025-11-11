'use client'

import React, { useState, useEffect } from 'react'

const CountdownBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { hours, minutes, seconds } = prevTime

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Timer reached 0, reset to 1 hour
          hours = 1
          minutes = 0
          seconds = 0
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="px-5 pb-3 relative">
      {/* poster-link from CSS */}
      <div className="relative block rounded-[20px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.1)] transition-transform duration-200 hover:translate-y-[-4px]">
        <img 
          src="/images/Countdown_Banner.webp" 
          alt="Mega Deal Offer - Buy 5 Get 5 Free"
          className="w-full h-auto block"
        />
        {/* Countdown overlay */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-start px-[5%] text-white pointer-events-none">
          <div className="text-[clamp(0.8rem,2vw,1.2rem)] font-medium mb-2 uppercase tracking-wider">
            Buy 5 Get 5 Free
          </div>
          <div className="text-[clamp(1.5rem,4vw,3rem)] font-bold mb-4 uppercase tracking-[2px] leading-tight">
            MEGA OFFER DEAL
          </div>
          <div className="text-[clamp(1.2rem,3vw,2.5rem)] font-bold font-mono tracking-[3px]">
            {String(timeLeft.hours).padStart(2, '0')} : {String(timeLeft.minutes).padStart(2, '0')} : {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CountdownBanner

