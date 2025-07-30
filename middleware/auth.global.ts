export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If user is not logged in and tries to access a protected page
  if (!session && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }

  // If user is logged in and tries to access login or register page
  if (session && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/')
  }
})
