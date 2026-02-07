import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
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

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/members', '/finance', '/attendance', '/shepherding', '/reports', '/settings', '/admin']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated, fetch and set their role
  if (user) {
    try {
      const [userRecord] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)

      if (userRecord) {
        // Set user role in response headers for downstream access
        supabaseResponse.headers.set('x-user-role', userRecord.role)
        supabaseResponse.headers.set('x-user-id', user.id)

        // Also set as cookie for client-side access if needed
        supabaseResponse.cookies.set('user-role', userRecord.role, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          httpOnly: false, // Set to true if you want it only accessible server-side
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      // Continue without role - will be treated as member
      supabaseResponse.headers.set('x-user-role', 'member')
      supabaseResponse.cookies.set('user-role', 'member', {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
