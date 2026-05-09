'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OwnerPage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/owner/login')
  }, [router])

  return null
}
