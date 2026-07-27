import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return Response.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    const body = await request.json()
    const { category_id, name, description, price, image_url } = body

    const supabase = await createClient()

    const updateData: Record<string, any> = {
      category_id,
      name,
      description,
      price,
    }

    if (image_url) {
      updateData.image_url = image_url
    }

    const { data, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', itemId)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      return Response.json(
        { error: error.message || 'Failed to update menu item' },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Error updating menu item:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const itemId = parseInt(id)

    if (isNaN(itemId)) {
      return Response.json({ error: 'Invalid item ID' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Supabase delete error:', error)
      return Response.json(
        { error: error.message || 'Failed to delete menu item' },
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}