// Simple demo authentication
// In production, you would use proper authentication with Supabase Auth
// This is just for demonstration purposes

const DEMO_CREDENTIALS = {
  email: 'admin@cafe.com',
  password: 'password123',
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      // In production, create a secure session/token
      return Response.json(
        {
          success: true,
          message: 'Login successful',
        },
        {
          status: 200,
          headers: {
            'Set-Cookie': `admin_token=authenticated; Path=/; HttpOnly; SameSite=Strict`,
          },
        }
      )
    } else {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
