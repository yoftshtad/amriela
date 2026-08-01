import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('Missing BLOB_READ_WRITE_TOKEN')
      return NextResponse.json(
        { error: 'Vercel Blob token is missing in Environment Variables. Please redeploy your Vercel project.' },
        { status: 500 }
      )
    }

    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      filename: file.name,
      path: blob.url,
    })
  } catch (error) {
    console.error('Upload error detail:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}