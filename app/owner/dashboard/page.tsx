'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus, Pencil, X, Utensils, Key, Shield, User } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface MenuItem {
  id: number
  category_id: number
  name: string
  description: string
  price: number | string
  image_url: string
}

export default function OwnerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'menu' | 'account'>('menu')

  // Menu Management State
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

  // Owner Account State
  const [ownerEmail, setOwnerEmail] = useState('')
  const [newOwnerEmail, setNewOwnerEmail] = useState('')
  const [currentOwnerPassword, setCurrentOwnerPassword] = useState('')
  const [newOwnerPassword, setNewOwnerPassword] = useState('')
  const [confirmOwnerPassword, setConfirmOwnerPassword] = useState('')
  const [ownerMessage, setOwnerMessage] = useState('')
  const [ownerLoading, setOwnerLoading] = useState(false)

  // Admin Account State
  const [adminEmail, setAdminEmail] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [adminOwnerAuthPassword, setAdminOwnerAuthPassword] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  useEffect(() => {
    fetchData()
    fetchAccountDetails()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        fetch('/api/categories', { cache: 'no-store' }),
        fetch('/api/menu-items', { cache: 'no-store' }),
      ])

      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : []
      const itemsData = itemsRes.ok ? await itemsRes.json() : []

      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
      const itemsArray = Array.isArray(itemsData) ? itemsData : []

      setCategories(categoriesArray)
      setItems(itemsArray)

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

  const fetchAccountDetails = async () => {
    try {
      const res = await fetch('/api/owner/account', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setOwnerEmail(data.ownerEmail || '')
        setNewOwnerEmail(data.ownerEmail || '')
        setAdminEmail(data.adminEmail || '')
        setNewAdminEmail(data.adminEmail || '')
      }
    } catch (error) {
      console.error('Failed to fetch account details:', error)
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
      let imageUrl = formData.image_url || '/favicon.jpg'

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
        throw new Error(data.error || 'Failed to delete item')
      }

      setMessage('Item deleted successfully!')
      if (editingId === itemId) {
        handleCancelEdit()
      }
      fetchData()
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Handle Owner Account Update
  const handleUpdateOwnerAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setOwnerLoading(true)
    setOwnerMessage('')

    if (newOwnerPassword && newOwnerPassword !== confirmOwnerPassword) {
      setOwnerMessage('Error: New owner passwords do not match')
      setOwnerLoading(false)
      return
    }

    try {
      const response = await fetch('/api/owner/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'owner',
          currentOwnerPassword,
          newEmail: newOwnerEmail,
          newPassword: newOwnerPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update owner account')
      }

      setOwnerMessage('Owner credentials updated successfully!')
      setCurrentOwnerPassword('')
      setNewOwnerPassword('')
      setConfirmOwnerPassword('')
      fetchAccountDetails()

      // Log out owner only if their password was changed
      if (newOwnerPassword && newOwnerPassword.trim().length > 0) {
        setOwnerMessage('Owner password updated successfully! Logging out...')
        setTimeout(async () => {
          await handleLogout()
        }, 1200)
      }
    } catch (error) {
      setOwnerMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setOwnerLoading(false)
    }
  }

  // Handle Admin Account Update (Owner stays logged in)
  const handleUpdateAdminAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminMessage('')

    if (newAdminPassword && newAdminPassword !== confirmAdminPassword) {
      setAdminMessage('Error: New admin passwords do not match')
      setAdminLoading(false)
      return
    }

    try {
      const response = await fetch('/api/owner/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: 'admin',
          currentOwnerPassword: adminOwnerAuthPassword,
          newEmail: newAdminEmail,
          newPassword: newAdminPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update admin account')
      }

      setAdminMessage('Admin credentials updated successfully!')
      setAdminOwnerAuthPassword('')
      setNewAdminPassword('')
      setConfirmAdminPassword('')
      fetchAccountDetails()
    } catch (error) {
      setAdminMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setAdminLoading(false)
    }
  }

  const handleLogout = async () => {
    sessionStorage.removeItem('owner_authenticated')
    await fetch('/api/logout', { method: 'POST' })
    router.push('/owner/login')
  }

  return (
    <main className="min-h-screen bg-[#222222]">
      {/* Header */}
      <header className="bg-[#222222] border-b border-[#444444]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-normal text-[#ffbc26]">☕ Owner Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#ff6b6b] text-white rounded-lg hover:bg-[#ff8888] transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 mt-2 flex gap-4 border-t border-[#333333] pt-4">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'menu'
                ? 'bg-[#ffbc26] text-[#222222]'
                : 'text-[#fff5e4] hover:bg-[#333333]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Menu Management
          </button>
          <button
            onClick={() => {
              setActiveTab('account')
              fetchAccountDetails()
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'account'
                ? 'bg-[#ffbc26] text-[#222222]'
                : 'text-[#fff5e4] hover:bg-[#333333]'
            }`}
          >
            <Key className="w-4 h-4" />
            Account Settings
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ==================== MENU MANAGEMENT TAB ==================== */}
        {activeTab === 'menu' && (
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
                  <div>
                    <label className="block text-sm font-medium text-[#fff5e4] mb-2">Category</label>
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

                  <div>
                    <label className="block text-sm font-medium text-[#fff5e4] mb-2">Item Name</label>
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

                  <div>
                    <label className="block text-sm font-medium text-[#fff5e4] mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Item description..."
                      rows={3}
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] placeholder-[#999999] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#fff5e4] mb-2">Price ($)</label>
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
                    {imageFile && <p className="text-xs text-[#ffbc26] mt-1">Selected: {imageFile.name}</p>}
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
                <h2 className="text-2xl font-bold text-[#ffbc26] mb-6">Current Menu Items</h2>

                <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {items.map((item) => {
                    const category = categories.find((c) => Number(c.id) === Number(item.category_id))
                    const isBeingEdited = editingId === item.id
                    const numPrice = Number(item.price) || 0

                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 border rounded-lg transition-colors ${
                          isBeingEdited
                            ? 'border-[#66cc66] bg-[#2a332a]'
                            : 'border-[#444444] hover:border-[#ffbc26]'
                        }`}
                      >
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

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-[#fff5e4]">{item.name}</h3>
                              <p className="text-xs text-[#999999]">{category?.name}</p>
                              <p className="text-sm text-[#999999] mt-1 line-clamp-1">{item.description}</p>
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
                          <p className="font-bold text-[#ffbc26] text-lg mt-2">${numPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ACCOUNT MANAGEMENT TAB ==================== */}
        {activeTab === 'account' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Owner Account Form */}
            <div className="bg-[#222222] border border-[#444444] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#ffbc26] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#ffbc26]" />
                Owner Credentials
              </h2>

              {ownerMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                    ownerMessage.startsWith('Error')
                      ? 'bg-[#330000] text-[#ff9999] border border-[#ff6b6b]'
                      : 'bg-[#003300] text-[#99ff99] border border-[#66cc66]'
                  }`}
                >
                  {ownerMessage}
                </div>
              )}

              <form onSubmit={handleUpdateOwnerAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#999999] mb-1">
                      Current Email
                    </label>
                    <input
                      type="text"
                      value={ownerEmail}
                      disabled
                      className="w-full px-4 py-2 border border-[#444444] bg-[#2a2a2a] text-[#888888] rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      New Owner Email
                    </label>
                    <input
                      type="email"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      placeholder="owner@amriela.com"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      Current Owner Password *
                    </label>
                    <input
                      type="password"
                      value={currentOwnerPassword}
                      onChange={(e) => setCurrentOwnerPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      New Owner Password
                    </label>
                    <input
                      type="password"
                      value={newOwnerPassword}
                      onChange={(e) => setNewOwnerPassword(e.target.value)}
                      placeholder="Leave empty to keep current"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmOwnerPassword}
                      onChange={(e) => setConfirmOwnerPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={ownerLoading}
                    className="px-6 py-2 bg-[#ffbc26] text-[#222222] font-semibold rounded-lg hover:bg-[#ffc940] transition-colors disabled:opacity-50 text-sm"
                  >
                    {ownerLoading ? 'Saving...' : 'Update Owner Account'}
                  </button>
                </div>
              </form>
            </div>

            {/* Admin Account Form */}
            <div className="bg-[#222222] border border-[#444444] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#ffbc26] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#ffbc26]" />
                Admin Credentials
              </h2>

              {adminMessage && (
                <div
                  className={`mb-4 p-3 rounded-xl text-sm font-medium ${
                    adminMessage.startsWith('Error')
                      ? 'bg-[#330000] text-[#ff9999] border border-[#ff6b6b]'
                      : 'bg-[#003300] text-[#99ff99] border border-[#66cc66]'
                  }`}
                >
                  {adminMessage}
                </div>
              )}

              <form onSubmit={handleUpdateAdminAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#999999] mb-1">
                      Current Admin Email
                    </label>
                    <input
                      type="text"
                      value={adminEmail}
                      disabled
                      className="w-full px-4 py-2 border border-[#444444] bg-[#2a2a2a] text-[#888888] rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      New Admin Email
                    </label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@amriela.com"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      Your (Owner) Password *
                    </label>
                    <input
                      type="password"
                      value={adminOwnerAuthPassword}
                      onChange={(e) => setAdminOwnerAuthPassword(e.target.value)}
                      placeholder="Enter your owner password"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      New Admin Password
                    </label>
                    <input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Leave empty to keep current"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#fff5e4] mb-1">
                      Confirm Admin Password
                    </label>
                    <input
                      type="password"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      placeholder="Confirm new admin password"
                      className="w-full px-4 py-2 border border-[#444444] bg-[#333333] text-[#fff5e4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ffbc26]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="px-6 py-2 bg-[#ffbc26] text-[#222222] font-semibold rounded-lg hover:bg-[#ffc940] transition-colors disabled:opacity-50 text-sm"
                  >
                    {adminLoading ? 'Saving...' : 'Update Admin Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}