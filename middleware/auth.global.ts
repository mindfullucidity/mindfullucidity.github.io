import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import {useSupabaseClient} from '#imports'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // If the target route is the redirect page, let it handle its own logic
  if (to.path.startsWith('/redirect')) {
    return
  }

  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If there's no current session
  if (!session) {
      const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/plus',
        '/documents',
        '/documents/privacy-policy',
        '/documents/terms-of-service',
        '/settings',
        '/settings/ai',
        '/settings/plus',
        '/support',
        '/support/contact_us',
        '/support/report_bug',
      ]
    // And the current path is NOT a public route, redirect to login
    if (!publicRoutes.some(route => to.path.startsWith(route))) {
        if (from.path.startsWith('/login')) {
          return
        } else {
          return navigateTo(`/login?to=${to.path}`)
        }
    }
  }
  // If there IS a current user
  else {
    const routes = ['/login', '/register']
    // And they are on a login/register page, redirect to home
    if (routes.some(route => route === to.path)) {
        return navigateTo('/home')
    }
  }
})
