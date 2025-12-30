/**
 * Reliable Fetch Utility
 * Handles retries, timeouts, and error recovery for all API calls
 */

interface FetchOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Get base URL for API calls
 * Handles both relative and absolute URLs
 */
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_BASE_URL || ''
  }
  
  // Client-side: use current origin
  return window.location.origin
}

/**
 * Resolve URL - handles both relative and absolute URLs
 */
function resolveUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Relative URL - prepend base URL
  const baseUrl = getBaseUrl()
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  
  return `${baseUrl}/${url}`
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Reliable fetch with retry logic, timeout, and error handling
 */
export async function reliableFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    ...fetchOptions
  } = options

  const resolvedUrl = resolveUrl(url)
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(resolvedUrl, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data as T
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        
        if (fetchError.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`)
        }
        
        throw fetchError
      }
    } catch (error: any) {
      lastError = error
      
      // Don't retry on last attempt
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt) // Exponential backoff
        console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message)
        await sleep(delay)
        continue
      }
    }
  }

  // All retries failed
  console.error(`Fetch failed after ${retries + 1} attempts:`, lastError)
  throw lastError || new Error('Unknown fetch error')
}

/**
 * Safe fetch that returns default value on error instead of throwing
 */
export async function safeFetch<T = any>(
  url: string,
  defaultValue: T,
  options: FetchOptions = {}
): Promise<T> {
  try {
    return await reliableFetch<T>(url, options)
  } catch (error) {
    console.error('Safe fetch error:', error)
    return defaultValue
  }
}

/**
 * Fetch array - always returns an array
 */
export async function fetchArray<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T[]> {
  try {
    const data = await reliableFetch<any>(url, options)
    
    // Handle various response formats
    if (Array.isArray(data)) {
      return data
    }
    
    if (data && Array.isArray(data.data)) {
      return data.data
    }
    
    return []
  } catch (error) {
    console.error('Fetch array error:', error)
    return []
  }
}

/**
 * Fetch object - always returns an object
 */
export async function fetchObject<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const data = await reliableFetch<T>(url, options)
    return data || ({} as T)
  } catch (error) {
    console.error('Fetch object error:', error)
    return {} as T
  }
}







