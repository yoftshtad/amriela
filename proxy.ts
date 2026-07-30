import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const adminSession = request.cookies.get('admin_session')?.value
  const ownerSession = request.cookies.get('owner_session')?.value

  // 1. Protect Admin Dashboard
  if (pathname.startsWith('/admin/dashboard')) {
    if (adminSession !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 2. Protect Owner Dashboard
  if (pathname.startsWith('/owner/dashboard')) {
    if (ownerSession !== 'authenticated') {
      return NextResponse.redirect(new URL('/owner/login', request.url))
    }
  }

  // 3. Redirect to Dashboard if already logged in and visiting Login pages
  if (pathname === '/admin/login' || pathname === '/admin') {
    if (adminSession === 'authenticated') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  if (pathname === '/owner/login' || pathname === '/owner') {
    if (ownerSession === 'authenticated') {
      return NextResponse.redirect(new URL('/owner/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}