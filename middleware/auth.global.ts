export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  const unprotectedRoutes = ['/', '/login', '/register']

  if (!session && !unprotectedRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (session && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/home')
  }
})
