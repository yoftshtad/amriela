import { db } from '@/lib/turso'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE role = ? LIMIT 1',
      args: ['owner'],
    })

    if (result.rows.length === 0) {
      return Response.json({ error: 'Owner account not found' }, { status: 404 })
    }

    const ownerUser = result.rows[0]
    const dbEmail = String(ownerUser.email).trim().toLowerCase()
    const dbHash = String(ownerUser.password_hash)

    const isEmailValid = email.trim().toLowerCase() === dbEmail
    const isPasswordValid = await bcrypt.compare(password, dbHash)

    if (isEmailValid && isPasswordValid) {
      return Response.json(
        { success: true, message: 'Login successful' },
        {
          status: 200,
          headers: {
            'Set-Cookie': `owner_session=authenticated; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          },
        }
      )
    }

    return Response.json({ error: 'Invalid email or password' }, { status: 401 })
  } catch (error) {
    console.error('Owner login error:', error)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}