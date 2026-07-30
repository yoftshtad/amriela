import { db } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM menu_categories ORDER BY id ASC')
    // Convert Turso rows to plain JS objects
    const categories = result.rows.map((row) => ({ ...row }))
    return Response.json(categories)
  } catch (error) {
    console.error('Error fetching categories from Turso:', error)
    return Response.json([])
  }
}