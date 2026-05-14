'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'
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
    <main className="min-h-screen bg-[#000] flex flex-col items-center justify-center overflow-hidden max-w-md mx-auto w-full">

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Title Animation */}
        <div
          className={`transition-all duration-700 ${
            animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="mb-4">
            <Image
              src="/intro_logo.jpg"
              alt="Amriela Pastries Logo"
              width={240}
              height={240}
              className="mx-auto mb-2"
            />
          </div>   

          
        </div>

        {/* Animated Loading Dots */}
        <div className="mt-8 flex justify-center gap-4">
          <div
            className={`w-3 h-3 rounded-full bg-[#ffbc26] transition-all duration-300 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            style={{ animation: 'bounce 1.4s infinite' }}
          />
          <div
            className={`w-3 h-3 rounded-full bg-[#ffbc26] transition-all duration-300 ${
              animate ? 'opacity-100 scale-100' : 'opacity-0'
            }`}
            style={{ animation: 'bounce 1.4s infinite 0.2s' }}
          />
          <div
            className={`w-3 h-3 rounded-full bg-[#ffbc26] transition-all duration-300 ${
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
