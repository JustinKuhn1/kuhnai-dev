// lib/utils/auth.ts
import { createClient } from '@/lib/supabase/server'

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return null
    }
    
    return session.user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if the current user has admin privileges
 * You could extend this with role-based checks if needed
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }
  
  // Check for admin email or custom claim in the user metadata
  // This is just an example, you should implement your own admin check logic
  const isAdminUser = user.email?.endsWith('@youradmindomain.com') || 
                      user.app_metadata?.is_admin === true
                      
  return !!isAdminUser
}