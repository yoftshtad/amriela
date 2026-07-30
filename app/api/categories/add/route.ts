import { db } from '@/lib/turso'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const result = await db.execute({
      sql: 'INSERT INTO menu_categories (name, display_order) VALUES (?, ?) RETURNING *',
      args: [name.trim(), 0],
    })

    const newCategory = result.rows[0] ? { ...result.rows[0] } : null

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}