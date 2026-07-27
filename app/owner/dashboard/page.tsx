'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus, Pencil, X } from 'lucide-react'

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

export default function OwnerDashboard() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('owner_authenticated')
    if (!isAuthenticated) {
      router.push('/owner/login')
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

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      })

      if (!response.ok) {
        throw new Error('Failed to add category')
      }

      setMessage('Category added successfully!')
      setNewCategoryName('')
      fetchData()
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete category')
      }

      setMessage(`Category "${categoryName}" deleted successfully!`)
      fetchData()
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (item: MenuItem) => {
    setEditingId(item.id)
    setFormData({
      category_id: item.category_id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      image_url: item.image_url || '',
    })
    setImageFile(null)
    setMessage('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      category_id: categories.length > 0 ? categories[0].id.toString() : '',
      name: '',
      description: '',
      price: '',
      image_url: '',
    })
    setImageFile(null)
    setMessage('')
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Use favicon.jpg as fallback if no image is uploaded or set
      let imageUrl = formData.image_url || '/favicon.jpg'

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

      const isEditing = editingId !== null
      const url = isEditing ? `/api/menu-items/${editingId}` : '/api/menu-items'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
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
        throw new Error(isEditing ? 'Failed to update item' : 'Failed to add item')
      }

      setMessage(isEditing ? 'Item updated successfully!' : 'Item added successfully!')
      handleCancelEdit()
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
        console.error('Delete error response:', data)
        throw new Error(data.error || 'Failed to delete item')
      }

      setMessage('Item deleted successfully!')
      if (editingId === itemId) {
        handleCancelEdit()
      }
      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('owner_authenticated')
    router.push('/menu')
  }

  return (
    <main className="min-h-screen bg-[#222222]">
      {/* Header */}
      <header className="bg-[#222222] border-b border-[#444444]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-normal text-[#ffbc26]">
            ☕ Owner Dashboard
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
          {/* Add / Edit Item Form - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-[#222222] border border-[#444444] rounded-2xl p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#ffbc26] flex items-center gap-2">
                  {editingId ? <Pencil className="w-6 h-6 text-[#66cc66]" /> : <Plus className="w-6 h-6" />}
                  {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
                </h2>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-[#999999] hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Cancel Edit"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
              </div>

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

              {/* Category Management Section */}
              <div className="mb-6 pb-6 border-b border-[#444444]">
                <h3 className="text-lg font-semibold text-[#fff5e4] mb-3">Manage Categories</h3>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Beverages"
                    className="flex-1 px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26] text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#ffbc26] text-[#222222] rounded-lg font-medium hover:bg-[#ffc940] transition-colors disabled:opacity-50 text-sm"
                  >
                    Add
                  </button>
                </form>

                {/* Category List with Delete Option */}
                <div className="space-y-2">
                  <span className="text-xs text-[#999999] block font-medium">Existing Categories:</span>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#333333] border border-[#444444] rounded-full text-xs text-[#fff5e4]"
                      >
                        <span>{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-0.5 text-[#ff6b6b] hover:bg-[#442222] rounded-full transition-colors"
                          title={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitItem} className="space-y-4">
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
                    Upload Image {editingId ? '(Optional - Keep current if empty)' : '(Optional)'}
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
                  {!imageFile && formData.image_url && (
                    <p className="text-xs text-[#999999] mt-1 truncate">Current image: {formData.image_url}</p>
                  )}
                  <p className="text-xs text-[#999999] mt-1">If no image is selected, favicon.jpg will be used</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2 ${
                      editingId ? 'bg-[#66cc66] hover:bg-[#52b352]' : 'bg-[#ffbc26] hover:bg-[#ffc940]'
                    } text-[#222222] rounded-lg font-medium transition-colors disabled:opacity-50`}
                  >
                    {loading ? (editingId ? 'Updating...' : 'Adding...') : editingId ? 'Update Item' : 'Add Item'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-[#333333] text-[#fff5e4] rounded-lg border border-[#444444] hover:bg-[#444444] transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                  const isBeingEdited = editingId === item.id
                  return (
                    <div
                      key={item.id}
                      className={`flex gap-4 p-4 border rounded-lg transition-colors ${
                        isBeingEdited ? 'border-[#66cc66] bg-[#2a332a]' : 'border-[#444444] hover:border-[#ffbc26]'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 bg-[#333333] rounded-lg overflow-hidden">
                        <Image
                          src={item.image_url || '/favicon.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src = '/favicon.jpg'
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-[#003300] rounded-lg transition-colors text-[#66cc66]"
                              title="Edit item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 hover:bg-[#330000] rounded-lg transition-colors text-[#ff6b6b]"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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