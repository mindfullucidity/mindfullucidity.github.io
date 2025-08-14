import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useSupabaseClient } from '#imports'
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Check local storage for authentication status
  const isAuthenticatedLocally = process.client ? localStorage.getItem('isAuthenticated') === 'true' : false

  // If not authenticated locally, redirect to login
  if (!isAuthenticatedLocally) {
    // Only redirect if the current route is not already the login page
    if (to.path !== '/login' && !to.path.startsWith('/redirect')) { // Added redirect check for logout flow
      return navigateTo(`/login?to=${to.path}`)
    }
  }

  // Supabase check for more robust authentication once client is ready
  if (process.client) {
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // If local storage said authenticated but Supabase says no session, clear local storage
      if (isAuthenticatedLocally) {
        localStorage.removeItem('isAuthenticated')
      }
      // If not authenticated by Supabase, and not already on login/redirect page, redirect to login
      if (to.path !== '/login' && !to.path.startsWith('/redirect')) { // Added redirect check for logout flow
        return navigateTo(`/login?to=${to.path}`)
      }
    } else {
      // If Supabase session exists, ensure local storage is set
      if (!isAuthenticatedLocally) {
        localStorage.setItem('isAuthenticated', 'true')
      }
    }
  }
})
