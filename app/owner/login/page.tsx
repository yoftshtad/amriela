'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      // Set authentication flag
      sessionStorage.setItem('owner_authenticated', 'true')
      router.push('/owner/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#222222] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#222222] rounded-2xl border border-[#444444] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">☕</div>
            <h1 className="text-3xl font-normal text-[#ffbc26]">
              Owner Panel
            </h1>
            <p className="text-[#999999] mt-2">Sign in to manage categories and menu</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#330000] border border-[#ff6b6b] rounded-lg text-[#ff9999] text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#fff5e4] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                required
              />
              
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#fff5e4] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                required
              />
              
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#ffbc26] text-[#222222] rounded-lg font-medium hover:bg-[#ffc940] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          

          {/* Back Button */}
          <div className="mt-6">
            <a
              href="/menu"
              className="block text-center text-[#ffbc26] hover:text-[#ffc940] underline text-sm"
            >
              Back to Menu
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
