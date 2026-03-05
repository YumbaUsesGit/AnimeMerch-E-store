import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useProductsData } from '../../hooks/useAdminData'

export default function AdminProducts() {
  const { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, uploadImage } = useProductsData()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' or 'edit'
  const [currentProduct, setCurrentProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    image_url: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle search and filter
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchTerm, categoryFilter === 'all' ? '' : categoryFilter)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, categoryFilter])

  const handleAddProduct = () => {
    setModalMode('add')
    setCurrentProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category: '',
      image_url: ''
    })
    setImagePreview('')
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setModalMode('edit')
    setCurrentProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity || '',
      category: product.category || '',
      image_url: product.image_url || ''
    })
    setImagePreview(product.image_url || '')
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      const result = await deleteProduct(productId)
      if (!result.success) {
        alert('Error deleting product: ' + result.error)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity)
    }

    let result
    if (modalMode === 'add') {
      result = await addProduct(productData)
    } else {
      result = await updateProduct(currentProduct.id, productData)
    }

    if (result.success) {
      setShowModal(false)
    } else {
      alert('Error saving product: ' + result.error)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const fileName = `${Date.now()}-${file.name}`

    const result = await uploadImage(file, fileName)
    if (result.success) {
      setFormData({ ...formData, image_url: result.url })
      setImagePreview(result.url)
    } else {
      alert('Error uploading image: ' + result.error)
    }
    setIsUploading(false)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock'
    if (stock < 10) return 'low-stock'
    return 'in-stock'
  }

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-[#141414] rounded-xl p-6">
            <div className="animate-pulse">
              <div className="h-12 bg-[#1a1a1a] rounded-lg mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-20 bg-[#1a1a1a] rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Products Management</h1>
          <button
            onClick={handleAddProduct}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
          >
            <span>+</span>
            <span className="ml-2">Add Product</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#141414] rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Products</label>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
              >
                <option value="all">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="anime-merch">Anime Merch</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-[#141414] rounded-xl overflow-hidden">
          {error ? (
            <div className="p-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
              Error loading products: {error}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">No products found</div>
              <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
              <button
                onClick={handleAddProduct}
                className="mt-4 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Product</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Category</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Price</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Stock</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-12 h-12 object-cover rounded-lg mr-4"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg mr-4 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
                          )}
                          <div>
                            <div className="text-white font-medium">{product.name}</div>
                            <div className="text-gray-400 text-sm line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 capitalize">{product.category}</td>
                      <td className="py-4 px-6 text-white">ZMK {product.price?.toLocaleString() || 0}</td>
                      <td className="py-4 px-6">
                        <StockBadge 
                          stock={product.stock_quantity} 
                          status={getStockStatus(product.stock_quantity)} 
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#141414] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Product Image</label>
                    <div className="flex items-start space-x-4">
                      {imagePreview && (
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-2 px-4 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm hover:bg-[#1a1a1a]/80 disabled:opacity-50"
                        >
                          {isUploading ? 'Uploading...' : (imagePreview ? 'Change Image' : 'Upload Image')}
                        </button>
                        {(formData.image_url || imagePreview) && (
                          <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => {
                              setFormData({ ...formData, image_url: e.target.value })
                              setImagePreview(e.target.value)
                            }}
                            placeholder="Or enter image URL"
                            className="w-full mt-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                      >
                        <option value="">Select category</option>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="anime-merch">Anime Merch</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Price (ZMK) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white border border-white/10 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium"
                    >
                      {modalMode === 'add' ? 'Add Product' : 'Update Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function StockBadge({ stock, status }) {
  const statusConfig = {
    'out-of-stock': { text: 'Out of Stock', color: 'bg-red-500/20 text-red-400' },
    'low-stock': { text: `Low (${stock})`, color: 'bg-amber-500/20 text-amber-400' },
    'in-stock': { text: `In Stock (${stock})`, color: 'bg-emerald-500/20 text-emerald-400' }
  }

  const config = statusConfig[status] || statusConfig['in-stock']

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  )
}
