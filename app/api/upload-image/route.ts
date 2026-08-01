import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file directly to Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      filename: file.name,
      path: blob.url, // Returns the public CDN URL of the uploaded image
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}