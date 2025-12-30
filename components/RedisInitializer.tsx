'use client'

import { useEffect } from 'react'

export function RedisInitializer() {
  useEffect(() => {
    // Initialize Redis on app load
    fetch('/api/init').catch(err => console.error('Redis init error:', err))
  }, [])

  return null
}
