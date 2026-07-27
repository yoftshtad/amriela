import { createClient } from '@/lib/supabase/server'

// Disable static caching so category updates/deletions reflect immediately
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menu_categories')
      .select('id, name, display_order')
      .order('display_order', { ascending: true })

    if (error) {
      throw error
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}