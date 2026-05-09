'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MenuGrid } from '@/components/menu-grid'
import { Search, Filter, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/menu-items'),
        ])

        const categoriesData = await categoriesRes.json()
        const itemsData = await itemsRes.json()

        // Ensure we always have arrays
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
        setItems(Array.isArray(itemsData) ? itemsData : [])
        
        // Show all items by default
        setSelectedCategory(null)
      } catch (error) {
        console.error('Error fetching menu:', error)
        // Set empty arrays on error
        setCategories([])
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter items based on selected category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-[#000] w-full relative">
      {/* Gradient decoration at top left */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-[#8B6F47] via-[#5a4a33] to-transparent rounded-full blur-3xl opacity-20 pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#000] border-b border-[#444444]">
        <div className=" max-w-7xl mx-auto">
          {/* Top Section - Logo and Search */}
          <div className=" py-4 px-6 bg-[#000] rounded-xl p-4 mb-6">
            {/* Logo Line */}
            <div className=" mb-4]">
              <div className="relative h-22 w-22">
                <Image
                  src="/logo.jpg"
                  alt="Amriela Pastries"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Tagline */}
            <div className="mb-4 flex flex-col gap-2">
              <p className="text-[25px] font-serif text-[#fff5e4] font-bold leading-snug mb-2">
                Meet Amriela Pastries
              </p>
              <p className="text-xs w-[70%] font-sans text-[#fff5e4] leading-snug">
                A modern café experience with artisanal pastries and rich coffee.
              </p>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#ffbc26]" />
              <span className="text-xs text-[#fff5e4]">Mexico, Debrework</span>
            </div>

            {/* Search Bar and Filter Button Line */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-[#161616] bg-[#161616] text-[#4B5563] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                />
              </div>

              {/* Filter Button */}
              <button className="p-2 rounded-lg bg-[#161616] border border-[#161616] text-[#fff5e4] hover:border-[#ffbc26] transition-colors flex-shrink-0">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <p className="px-6 text-sm font-medium text-[#999999] mb-3">Categories</p>
            <div className="px-6 flex gap-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 relative pb-3 flex flex-col items-center ${
                  selectedCategory === null
                    ? 'text-[#ffbc26]'
                    : 'text-[#999999] hover:text-[#fff5e4]'
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
                      : 'text-[#999999] hover:text-[#fff5e4]'
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
        </div>
      </header>

      {/* Menu Items */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-[#fff5e4] text-lg">Loading menu...</div>
        </div>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <MenuGrid items={filteredItems} />
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-[#fff5e4] text-lg">No items found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  className="mt-4 px-4 py-2 bg-[#ffbc26] text-[#222222] rounded-lg hover:bg-[#ffc940] font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="bg-[#000] border-t border-[#444444] mt-8">
        <div className="px-6 py-6">
          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <a href="#" className="text-[#fff5e4] hover:text-[#ffbc26] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#fff5e4] hover:text-[#ffbc26] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-[#fff5e4] hover:text-[#ffbc26] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-[#999999]">
              © 2026 Amriela Pastries. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
