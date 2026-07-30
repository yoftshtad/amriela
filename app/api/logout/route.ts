import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' })

  // Expire and clear session cookies
  response.cookies.set('admin_session', '', { maxAge: 0, path: '/' })
  response.cookies.set('owner_session', '', { maxAge: 0, path: '/' })

  return response
}