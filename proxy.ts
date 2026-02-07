import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/',
]

/**
 * Route access control based on user roles
 * Maps route prefixes to allowed roles
 */
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  '/dashboard': ['super_admin', 'pastor', 'admin', 'treasurer', 'dept_leader', 'shepherd', 'member'],
  '/profile': ['super_admin', 'pastor', 'admin', 'treasurer', 'dept_leader', 'shepherd', 'member'],
  '/members': ['super_admin', 'pastor', 'admin', 'dept_leader', 'shepherd'],
  '/finance': ['super_admin', 'pastor', 'admin', 'treasurer'],
  '/attendance': ['super_admin', 'pastor', 'admin', 'dept_leader'],
  '/shepherding': ['super_admin', 'pastor', 'admin', 'shepherd', 'dept_leader'],
  '/departments': ['super_admin', 'pastor', 'admin'],
  '/events': ['super_admin', 'pastor', 'admin', 'dept_leader'],
  '/messages': ['super_admin', 'pastor', 'admin'],
  '/reports': ['super_admin', 'pastor', 'admin', 'treasurer', 'dept_leader', 'shepherd'],
  '/settings': ['super_admin', 'admin'],
  '/admin': ['super_admin'],
}

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

/**
 * Check if user role has access to a route
 */
function canAccessRoute(pathname: string, userRole: string | null): boolean {
  // If no role, deny access
  if (!userRole) return false

  // Check each protected route
  for (const [route, allowedRoles] of Object.entries(ROLE_BASED_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return allowedRoles.includes(userRole)
    }
  }

  // If route is not in the protected routes list, allow access if authenticated
  return true
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // First, update the session - this handles auth and sets user role in cookies
  const response = await updateSession(request)

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return response
  }

  // Get user role from the response cookies (set by updateSession)
  const userRole = response.cookies.get('user-role')?.value || null

  // Check if user has access to this route
  if (!canAccessRoute(pathname, userRole)) {
    // Redirect to unauthorized page
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
