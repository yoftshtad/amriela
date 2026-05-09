import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menu_items')
      .select('id, category_id, name, description, price, image_url')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return Response.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category_id, name, description, price, image_url } = body

    if (!category_id || !name || !price) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          category_id,
          name,
          description,
          price,
          image_url,
        },
      ])
      .select()

    if (error) {
      throw error
    }

    return Response.json(data[0])
  } catch (error) {
    console.error('Error creating menu item:', error)
    return Response.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
