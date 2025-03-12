import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// THIS MIDDLEWARE IS LITTLE BIT MODIFIED FROM THE ORIGINAL ONE, THIS IS MORE EFFICIENT

// Define protected and public routes
const PROTECTED_ROUTES = [
  '/dashboard',
  '/image-generation',
  '/gallery',
  '/billing',
  '/account-settings',
]

// Routes that require subscription for full functionality
// These routes are accessible but with limited functionality
const SUBSCRIPTION_REQUIRED_ROUTES: string[] = [
  // Removed video routes from here to allow access
]

const PUBLIC_ROUTES = [
  '/login',
  '/auth',
  '/reset-password',
  // Add more public routes here
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value
            // options
         }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  const isSubscriptionRequiredRoute = SUBSCRIPTION_REQUIRED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  const isAuthRoute = PUBLIC_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

   // Handle authentication logic
   if (!user && isProtectedRoute) {
    // Redirect to login if accessing protected route without auth
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.url)
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from the original response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  // Check subscription for subscription-required routes
  if (user && isSubscriptionRequiredRoute) {
    // Check if user has active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (!subscription) {
      // Redirect to billing page if no subscription
      const url = request.nextUrl.clone()
      url.pathname = '/billing'
      const redirectResponse = NextResponse.redirect(url)
      
      // Copy all cookies from the original response
      supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      
      return redirectResponse
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    
    // Copy all cookies from the original response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  return supabaseResponse
}