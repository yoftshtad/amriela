'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface MenuItem {
  id: number
  category_id: number
  name: string
  description: string
  price: number
  image_url: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('admin_authenticated')
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/menu-items'),
      ])

      const categoriesData = await categoriesRes.json()
      const itemsData = await itemsRes.json()

      // Ensure we always have arrays
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
      const itemsArray = Array.isArray(itemsData) ? itemsData : []

      setCategories(categoriesArray)
      setItems(itemsArray)

      // Set default category
      if (categoriesArray.length > 0 && !formData.category_id) {
        setFormData((prev) => ({
          ...prev,
          category_id: categoriesArray[0].id.toString(),
        }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set empty arrays on error
      setCategories([])
      setItems([])
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let imageUrl = '/cupcake.png'

      // Upload image if file is selected
      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.path
      }

      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: parseInt(formData.category_id),
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add item')
      }

      setMessage('Item added successfully!')
      setFormData({
        category_id: formData.category_id,
        name: '',
        description: '',
        price: '',
        image_url: '',
      })
      setImageFile(null)

      fetchData()
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('[v0] Delete error response:', data)
        throw new Error(data.error || 'Failed to delete item')
      }

      setMessage('Item deleted successfully!')
      fetchData()
    } catch (error) {
      console.error('[v0] Delete error:', error)
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    router.push('/menu')
  }

  return (
    <main className="min-h-screen bg-[#222222]">
      {/* Header */}
      <header className="bg-[#222222] border-b border-[#444444]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-normal text-[#ffbc26]">
            ☕ Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff8888] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Item Form - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-[#222222] border border-[#444444] rounded-2xl p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-[#ffbc26] mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Add Menu Item
              </h2>

              {/* Message */}
              {message && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    message.startsWith('Error')
                      ? 'bg-[#330000] text-[#ff9999] border border-[#ff6b6b]'
                      : 'bg-[#003300] text-[#99ff99] border border-[#66cc66]'
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleAddItem} className="space-y-4">
                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-[#fff5e4] mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#fff5e4] mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Espresso"
                    className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#fff5e4] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Item description..."
                    rows={3}
                    className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[#fff5e4] mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#fff5e4] mb-2">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                  />
                  {imageFile && (
                    <p className="text-xs text-[#ffbc26] mt-1">Selected: {imageFile.name}</p>
                  )}
                  <p className="text-xs text-[#999999] mt-1">If no image is selected, cupcake.png will be used</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-[#ffbc26] text-[#222222] rounded-lg font-medium hover:bg-[#ffc940] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Item'}
                </button>
              </form>
            </div>
          </div>

          {/* Menu Items List - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-[#222222] border border-[#444444] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[#ffbc26] mb-6">
                Current Menu Items
              </h2>

              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {items.map((item) => {
                  const category = categories.find((c) => c.id === item.category_id)
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border border-[#444444] rounded-lg hover:border-[#ffbc26] transition-colors"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-[#333333] rounded-lg overflow-hidden">
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src =
                              'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=100&h=100&fit=crop'
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-[#fff5e4]">{item.name}</h3>
                            <p className="text-xs text-[#999999]">{category?.name}</p>
                            <p className="text-sm text-[#999999] mt-1 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 hover:bg-[#330000] rounded-lg transition-colors text-[#ff6b6b]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-[#ffbc26] text-lg mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
