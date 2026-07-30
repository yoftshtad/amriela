import { db } from '@/lib/turso'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.execute('SELECT role, email FROM users')

    let ownerEmail = ''
    let adminEmail = ''

    for (const row of result.rows) {
      if (row.role === 'owner') ownerEmail = String(row.email)
      if (row.role === 'admin') adminEmail = String(row.email)
    }

    return Response.json({ ownerEmail, adminEmail })
  } catch (error) {
    console.error('Error fetching account details:', error)
    return Response.json({ error: 'Failed to fetch account details' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { target, currentOwnerPassword, newEmail, newPassword } = body

    if (!target || (target !== 'owner' && target !== 'admin')) {
      return Response.json({ error: 'Invalid target specified' }, { status: 400 })
    }

    // Require Owner's current password for security verification
    if (!currentOwnerPassword) {
      return Response.json({ error: 'Current Owner Password is required' }, { status: 400 })
    }

    const ownerRes = await db.execute({
      sql: 'SELECT * FROM users WHERE role = ? LIMIT 1',
      args: ['owner'],
    })

    if (ownerRes.rows.length === 0) {
      return Response.json({ error: 'Owner account not found' }, { status: 404 })
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentOwnerPassword,
      String(ownerRes.rows[0].password_hash)
    )

    if (!isCurrentPasswordCorrect) {
      return Response.json({ error: 'Incorrect Current Owner Password' }, { status: 401 })
    }

    // Get current target record
    const targetRes = await db.execute({
      sql: 'SELECT * FROM users WHERE role = ? LIMIT 1',
      args: [target],
    })

    if (targetRes.rows.length === 0) {
      return Response.json({ error: `${target} account not found` }, { status: 404 })
    }

    const currentRecord = targetRes.rows[0]
    const updatedEmail = newEmail && newEmail.trim() ? newEmail.trim() : String(currentRecord.email)

    let updatedPasswordHash = String(currentRecord.password_hash)
    if (newPassword && newPassword.trim()) {
      updatedPasswordHash = await bcrypt.hash(newPassword.trim(), 10)
    }

    await db.execute({
      sql: 'UPDATE users SET email = ?, password_hash = ? WHERE role = ?',
      args: [updatedEmail, updatedPasswordHash, target],
    })

    return Response.json({ success: true, message: `${target.toUpperCase()} credentials updated successfully!` })
  } catch (error) {
    console.error('Error updating credentials:', error)
    return Response.json({ error: 'Failed to update credentials' }, { status: 500 })
  }
}