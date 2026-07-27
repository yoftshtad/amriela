import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const categoryId = parseInt(id)

    if (isNaN(categoryId)) {
      return Response.json({ error: 'Invalid category ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Using 'menu_categories' table name as configured in Supabase
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('Supabase category delete error:', error)
      return Response.json(
        { error: error.message || 'Failed to delete category (it may contain menu items)' },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}