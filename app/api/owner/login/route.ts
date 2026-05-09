export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Demo credentials
  const OWNER_EMAIL = 'owner@cafe.com'
  const OWNER_PASSWORD = 'owner123'

  if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
    return Response.json({ success: true })
  }

  return Response.json(
    { error: 'Invalid email or password' },
    { status: 401 }
  )
}
