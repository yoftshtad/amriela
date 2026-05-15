'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MenuGrid } from '@/components/menu-grid'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, MapPin, Facebook, Instagram, Twitter, Phone } from 'lucide-react'
import { useTheme } from 'next-themes'

interface MenuItem {
  id: number
  category_id: number
  name: string
  description: string
  price: number
  image_url: string
}

interface Category {
  id: number
  name: string
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu-items'),
        ])

        const categoriesData = await categoriesRes.json()
        const itemsData = await itemsRes.json()

        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setItems(Array.isArray(itemsData) ? itemsData : [])
        setSelectedCategory(null)
      } catch (error) {
        console.error('Error fetching menu:', error)
        setCategories([])
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Determine which logo to show based on theme
  const logoSrc = !mounted ? '/logo.jpg' : theme === 'dark' ? '/logo.jpg' : '/logo.jpg'
  // CHANGE THE LOGO PATHS ABOVE ^^^
  // For dark mode logo: change the first '/logo.jpg' to your dark mode logo path
  // For light mode logo: change the second '/logo.jpg' to your light mode logo path

  return (
    <main className="min-h-screen bg-background w-full relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 pt-4">
          {/* Logo and Right Section - Space between */}
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="relative h-14 w-30">
              <Image
                src={logoSrc}
                alt="Amriela Pastries"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Search and Theme Toggle - Right aligned */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-1.5 w-40 text-sm rounded-lg border border-input bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ffbc26] focus:border-transparent"
                />
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Tagline */}
          <div className="flex flex-col mt-2 pb-4 gap-2">
            <p className="text-[22px] font-serif text-foreground font-bold leading-snug">
              Meet Amriela Pastries
            </p>
            <p className="text-xs w-[70%] font-sans text-muted-foreground leading-snug">
              A modern café experience with artisanal pastries and rich coffee.
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="max-w-7xl mx-auto px-6 pb-2">
          
          
          <div className="flex gap-6 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-sm font-medium whitespace-nowrap transition-all duration-300 relative pb-3 flex flex-col items-center ${
                selectedCategory === null
                  ? 'text-[#ffbc26]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
              {selectedCategory === null && (
                <div className="w-1.5 h-1.5 bg-[#ffbc26] rounded-full mt-1"></div>
              )}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 relative pb-3 flex flex-col items-center ${
                  selectedCategory === category.id
                    ? 'text-[#ffbc26]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <div className="w-1.5 h-1.5 bg-[#ffbc26] rounded-full mt-1"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-foreground text-lg">Loading menu...</div>
        </div>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <MenuGrid items={filteredItems} />
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-foreground text-lg">No items found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  className="mt-4 px-4 py-2 bg-[#ffbc26] text-[#222222] rounded-lg hover:bg-[#ffc940] font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="bg-background border-t border-border mt-8">
        <div className="px-6 py-6">
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <a href="#" className="text-foreground hover:text-[#ffbc26] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-foreground hover:text-[#ffbc26] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-foreground hover:text-[#ffbc26] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Location and Phone */}
          <div className="flex gap-5 justify-center">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#ffbc26]" />
              <span className="text-xs text-foreground">Mexico, Debrework</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-[#ffbc26]" />
              <span className="text-xs text-foreground">+251 9** *** ***</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center flex flex-col gap-2">
            
            <p className="text-xs text-muted-foreground">
              © 2026 Amriela Pastries. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}