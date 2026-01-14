import { auth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from '@/firebase'

let confirmationResult: ConfirmationResult | null = null

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; error?: any }> => {
  try {
    if (typeof window === 'undefined') throw new Error('Window not available')

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
        'expired-callback': () => console.warn('reCAPTCHA expired'),
      }
    )

    const appVerifier = window.recaptchaVerifier
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending OTP:', error)
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = undefined
    }

    let errorMessage = 'Failed to send OTP. Please try again.'
    if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number. Please check and try again.'
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many requests. Please try again later.'
    } else if (error.code === 'auth/invalid-app-credential') {
      errorMessage = 'Invalid app credential. Check Firebase config or domain settings.'
    }

    return { success: false, error: errorMessage }
  }
}

export const verifyOTP = async (otp: string): Promise<{ success: boolean; user?: any; error?: any }> => {
  try {
    if (!confirmationResult) {
      return { success: false, error: 'No OTP session found. Please request a new OTP.' }
    }

    const result = await confirmationResult.confirm(otp)
    const user = result.user

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = undefined
    }

    confirmationResult = null
    return { success: true, user }
  } catch (error: any) {
    console.error('Invalid OTP:', error)
    let errorMessage = 'Invalid OTP. Please try again.'
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid verification code. Please check and try again.'
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'Verification code expired. Please request a new OTP.'
    } else if (error.code === 'auth/session-expired') {
      errorMessage = 'Session expired. Please request a new OTP.'
    }

    return { success: false, error: errorMessage }
  }
}

export const resendOTP = async (phoneNumber: string): Promise<{ success: boolean; error?: any }> => {
  confirmationResult = null
  return sendOTP(phoneNumber)
}
