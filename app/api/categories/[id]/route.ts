import { db } from '@/lib/turso'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = parseInt(id, 10)

    if (isNaN(categoryId)) {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    await db.execute({
      sql: 'DELETE FROM menu_categories WHERE id = ? OR id = ?',
      args: [categoryId, String(categoryId)],
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return Response.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}