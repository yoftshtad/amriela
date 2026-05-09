'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    const timer = setTimeout(() => {
      router.push('/menu')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen bg-[#222222] flex flex-col items-center justify-center overflow-hidden max-w-md mx-auto w-full">

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Title Animation */}
        <div
          className={`transition-all duration-700 ${
            animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="mb-4">
            <div className="text-6xl font-bold">
              ☕
            </div>
          </div>

          <h1 className="text-3xl font-normal text-[#ffbc26] mb-2">
            Welcome
          </h1>

          <p className="text-sm text-[#fff5e4] font-light mb-6">
            Experience the finest coffee, cakes, and pastries
          </p>

          {/* Animated Lines */}
          <div className="flex justify-center gap-2 mb-6">
            <div className="h-1 w-8 bg-[#ffbc26] rounded-full" />
            <div className="h-1 w-8 bg-[#ffbc26] rounded-full" />
            <div className="h-1 w-8 bg-[#ffbc26] rounded-full" />
          </div>

          <p className="text-xs text-[#fff5e4] font-medium">
            Redirecting to menu...
          </p>
        </div>

        {/* Animated Loading Dots */}
        <div className="mt-8 flex justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full bg-[#ffbc26] transition-all duration-300 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            style={{ animation: 'bounce 1.4s infinite' }}
          />
          <div
            className={`w-2 h-2 rounded-full bg-[#ffbc26] transition-all duration-300 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            style={{ animation: 'bounce 1.4s infinite 0.2s' }}
          />
          <div
            className={`w-2 h-2 rounded-full bg-[#ffbc26] transition-all duration-300 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            style={{ animation: 'bounce 1.4s infinite 0.4s' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </main>
  )
}
