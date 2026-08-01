import { db } from '@/lib/turso'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM menu_items ORDER BY id ASC')
    
    // Explicitly parse and normalize numeric IDs, category_ids, and prices
    const items = result.rows.map((row) => ({
      ...row,
      id: Number(row.id),
      category_id: Number(row.category_id),
      price: Number(row.price) || 0,
    }))

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
      args: [Number(category_id), name, description || '', Number(price), image_url || '/favicon.jpg'],
    })

    const item = result.rows[0] ? { ...result.rows[0], id: Number(result.rows[0].id) } : null
    return Response.json({ success: true, item })
  } catch (error) {
    console.error('Error adding menu item:', error)
    return Response.json({ error: 'Failed to add menu item' }, { status: 500 })
  }
}