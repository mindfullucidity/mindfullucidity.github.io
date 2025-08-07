import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  // If the target route is the redirect page, let it handle its own logic
  if (to.path === '/redirect') {
    return
  }

  const user = useSupabaseUser()
  const publicRoutes = ['/', '/login', '/register']

  // If there's no current user
  if (!user.value) {
    // And the current path is NOT a public route, redirect to login
    if (!publicRoutes.some(route => route === to.path)) {
      // If coming from the login page, don't set the 'to' parameter
      if (process.client) {
        if (from.path === '/login') {
          return navigateTo('/login')
        } else {
          return navigateTo(`/login?to=${to.path}`)
        }
      }
    }
  }
  // If there IS a current user
  else {
    // And they are on a login/register page, redirect to home
    if (to.path === '/login' || to.path === '/register') {
      if (process.client) {
        return navigateTo('/home')
      }
    }
  }
})
