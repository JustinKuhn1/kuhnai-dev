// lib/utils/validation.ts

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  /**
   * Validate password strength
   * Requires at least 8 characters, one uppercase letter, one lowercase letter, 
   * one number and one special character
   */
  export function isStrongPassword(password: string): boolean {
    const minLength = 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    return (
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar
    )
  }
  
  /**
   * Get password strength feedback
   */
  export function getPasswordFeedback(password: string): { 
    strength: 'weak' | 'medium' | 'strong',
    feedback: string 
  } {
    if (!password) {
      return { strength: 'weak', feedback: 'Please enter a password' }
    }
    
    const hasLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    const meetsCriteria = [hasLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar]
    const strengthScore = meetsCriteria.filter(Boolean).length
    
    if (strengthScore <= 2) {
      return { 
        strength: 'weak', 
        feedback: 'Password is too weak. Add more variety of characters.' 
      }
    } else if (strengthScore <= 4) {
      return { 
        strength: 'medium', 
        feedback: 'Password is decent, but could be stronger.' 
      }
    } else {
      return { 
        strength: 'strong', 
        feedback: 'Strong password!' 
      }
    }
  }