import { db } from '@/lib/turso'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id, 10)

    if (isNaN(itemId)) {
      return Response.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    const body = await request.json()
    const { category_id, name, description, price, image_url } = body

    await db.execute({
      sql: `UPDATE menu_items 
            SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?
            WHERE id = ?`,
      args: [Number(category_id), name, description || '', Number(price), image_url || '/favicon.jpg', itemId],
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return Response.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id, 10)

    if (isNaN(itemId)) {
      return Response.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    await db.execute({
      sql: 'DELETE FROM menu_items WHERE id = ?',
      args: [itemId],
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return Response.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}