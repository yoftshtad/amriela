'use client'

import Image from 'next/image'

interface MenuItem {
  id: number
  name: string
  description: string
  price: number
  image_url: string
}

interface MenuGridProps {
  items: MenuItem[]
}

export function MenuGrid({ items }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-6 max-w-7xl mx-auto">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gradient-to-b from-secondary to-background rounded-lg overflow-hidden p-1.5 flex flex-col border border-border hover:border-[#ffbc26] transition-all duration-300"
        >
          {/* Image Container - Centered at top */}
          <div className="relative w-full h-28 md:h-24 lg:h-32 bg-muted rounded-lg overflow-hidden mb-3 flex items-center justify-center">
            <Image
              src={item.image_url || '/'}
              alt={item.name}
              fill
              loading="eager"
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>

          {/* Content - Left Aligned */}
          <div className="flex-1">
            <h3 className="text-xs md:text-sm lg:text-base font-bold text-foreground mb-1 font-serif">
              {item.name}
            </h3>
            <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground mb-2 font-sans">
              {item.description}
            </p>
            <span className="text-xs md:text-sm lg:text-base font-bold text-[#ffbc26]">
              {item.price.toFixed(2)} ETB
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}