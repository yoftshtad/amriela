import { db } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM menu_items ORDER BY id ASC')
    // Convert Turso rows to plain JS objects
    const items = result.rows.map((row) => ({ ...row }))
    return Response.json(items)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category_id, name, description, price, image_url } = body

    if (!category_id || !name || price === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await db.execute({
      sql: `INSERT INTO menu_items (category_id, name, description, price, image_url) 
            VALUES (?, ?, ?, ?, ?) RETURNING *`,
      args: [category_id, name, description || '', price, image_url || '/favicon.jpg'],
    })

    const item = result.rows[0] ? { ...result.rows[0] } : null
    return Response.json({ success: true, item })
  } catch (error) {
    console.error('Error adding menu item:', error)
    return Response.json({ error: 'Failed to add menu item' }, { status: 500 })
  }
}