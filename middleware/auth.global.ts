import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  // If the target route is the redirect page, let it handle its own logic
  if (to.path.startsWith('/redirect')) {
    return
  }

  const user = useSupabaseUser()

  // If there's no current user
  if (!user.value) {
    const publicRoutes = ['/', '/login', '/register', '/plus']
    // And the current path is NOT a public route, redirect to login
    if (!publicRoutes.some(route => route === to.path)) {
      // If coming from the login page, don't set the 'to' parameter
      if (process.client) {
        if (from.path.startsWith('/login')) {
          return
        } else {
          return navigateTo(`/login?to=${to.path}`, { replace: true })
        }
      }
    }
  }
  // If there IS a current user
  else {
    const routes = ['/login', '/register']
    // And they are on a login/register page, redirect to home
    if (routes.some(route => to.path.startsWith(route))) {
      if (process.client) {
        return navigateTo('/home')
      }
    }
  }
})
