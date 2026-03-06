import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useProductsData } from '../../hooks/useAdminData'
import { supabase } from '../../lib/supabase'

// ── Toast notification (replaces browser alert/confirm) ──
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-sm font-semibold transition-all ${
      type === 'error'
        ? 'bg-red-500/15 border-red-500/30 text-red-300'
        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
    }`}>
      {type === 'error' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

// ── Confirm dialog ──
function ConfirmDialog({ product, onConfirm, onCancel }) {
  if (!product) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h3 className="text-white font-black text-base mb-1">Remove product?</h3>
        <p className="text-white/40 text-sm mb-1 font-medium">{product.name}</p>
        <p className="text-white/25 text-xs mb-6 leading-relaxed">
          Are you sure you want to remove this product from the store?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-sm font-semibold rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-black rounded-xl transition-all">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { products, loading, error, fetchProducts, addProduct, updateProduct, uploadImage } = useProductsData()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [currentProduct, setCurrentProduct] = useState(null)
  const [confirmProduct, setConfirmProduct] = useState(null)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '', category: '', image_url: '' })
  const [imagePreview, setImagePreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const fileInputRef = useRef(null)

  const showToast = (message, type = 'success') => setToast({ message, type })

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchProducts(searchTerm, categoryFilter === 'all' ? '' : categoryFilter)
    }, 300)
    return () => clearTimeout(t)
  }, [searchTerm, categoryFilter])

  const handleAddProduct = () => {
    setModalMode('add')
    setCurrentProduct(null)
    setFormData({ name: '', description: '', price: '', stock_quantity: '', category: '', image_url: '' })
    setImagePreview('')
    setFormError('')
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
    setFormError('')
    setShowModal(true)
  }

  // Soft delete — check for active orders first
  const handleDeleteConfirmed = async () => {
    if (!confirmProduct) return
    try {
      // Check if product has any active (non-completed) orders
      const { data: activeOrders, error: checkError } = await supabase
        .from('order_items')
        .select('order_id, orders!inner(status)')
        .eq('product_id', confirmProduct.id)
        .in('orders.status', ['pending', 'confirmed', 'shipped'])
        .limit(1)

      if (checkError) throw checkError

      if (activeOrders && activeOrders.length > 0) {
        showToast('Cannot remove — product has active orders in progress', 'error')
        setConfirmProduct(null)
        return
      }

      // Safe to soft delete
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', confirmProduct.id)

      if (error) throw error

      showToast('Product removed from store')
      fetchProducts(searchTerm, categoryFilter === 'all' ? '' : categoryFilter)
    } catch (err) {
      showToast('Failed to remove product: ' + err.message, 'error')
    } finally {
      setConfirmProduct(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      is_active: true,
    }

    const result = modalMode === 'add'
      ? await addProduct(productData)
      : await updateProduct(currentProduct.id, productData)

    if (result.success) {
      setShowModal(false)
      showToast(modalMode === 'add' ? 'Product added!' : 'Product updated!')
    } else {
      setFormError(result.error || 'Something went wrong')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    const result = await uploadImage(file, `${Date.now()}-${file.name}`)
    if (result.success) {
      setFormData(prev => ({ ...prev, image_url: result.url }))
      setImagePreview(result.url)
    } else {
      showToast('Image upload failed: ' + result.error, 'error')
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
        <div className="p-6 animate-pulse">
          <div className="h-10 bg-white/5 rounded-xl w-48 mb-6"/>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"/>)}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-1">Catalogue</p>
            <h1 className="text-white font-black text-2xl tracking-tight">Products</h1>
          </div>
          <button onClick={handleAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-600/25">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Product
          </button>
        </div>

        {/* Search + filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search products..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/8 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#141414] border border-white/8 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors">
            <option value="all">All Categories</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="anime-merch">Anime Merch</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
          {error ? (
            <div className="p-6 text-red-400 text-sm">Error: {error}</div>
          ) : products.length === 0 ? (
            <div className="p-14 text-center">
              <p className="text-white/20 text-sm mb-4">No products found</p>
              <button onClick={handleAddProduct}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-full transition-all">
                Add First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-6 text-white/30 text-xs font-black tracking-widest uppercase">Product</th>
                    <th className="text-left py-4 px-6 text-white/30 text-xs font-black tracking-widest uppercase">Category</th>
                    <th className="text-left py-4 px-6 text-white/30 text-xs font-black tracking-widest uppercase">Price</th>
                    <th className="text-left py-4 px-6 text-white/30 text-xs font-black tracking-widest uppercase">Stock</th>
                    <th className="py-4 px-6"/>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-12 rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 shrink-0">
                            {product.image_url
                              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'}/>
                              : <div className="w-full h-full flex items-center justify-center text-white/10 text-[10px]">IMG</div>
                            }
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{product.name}</p>
                            <p className="text-white/30 text-xs line-clamp-1 max-w-[180px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white/40 text-xs font-medium capitalize">{product.category}</span>
                      </td>
                      <td className="py-4 px-6 text-white font-black text-sm">ZMK {product.price?.toLocaleString()}</td>
                      <td className="py-4 px-6"><StockBadge stock={product.stock_quantity} status={getStockStatus(product.stock_quantity)}/></td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 justify-end">
                          <button onClick={() => handleEditProduct(product)}
                            className="text-violet-400 hover:text-violet-300 text-xs font-bold transition-colors">
                            Edit
                          </button>
                          <button onClick={() => setConfirmProduct(product)}
                            className="text-white/20 hover:text-red-400 text-xs font-bold transition-colors">
                            Remove
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

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#141414] border border-white/8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-violet-400 text-[10px] font-black tracking-widest uppercase mb-0.5">Products</p>
                    <h2 className="text-white font-black text-lg">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Image */}
                  <div>
                    <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Product Image</label>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/8 shrink-0 flex items-center justify-center">
                        {imagePreview
                          ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/15"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        }
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" disabled={isUploading}/>
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                          className="w-full py-2.5 bg-white/[0.03] border border-white/8 hover:border-violet-500/40 rounded-xl text-white/50 hover:text-white text-sm transition-all disabled:opacity-40">
                          {isUploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
                        </button>
                        <input type="text" value={formData.image_url}
                          onChange={(e) => { setFormData(prev => ({...prev, image_url: e.target.value})); setImagePreview(e.target.value) }}
                          placeholder="Or paste image URL"
                          className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-xs placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Name *</label>
                      <input type="text" required value={formData.name}
                        onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="Product name"/>
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Category *</label>
                      <select required value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors">
                        <option value="">Select category</option>
                        <option value="clothing">Clothing</option>
                        <option value="accessories">Accessories</option>
                        <option value="anime-merch">Anime Merch</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Price (ZMK) *</label>
                      <input type="number" required min="0" step="0.01" value={formData.price}
                        onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                        className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="0"/>
                    </div>
                    <div>
                      <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Stock *</label>
                      <input type="number" required min="0" value={formData.stock_quantity}
                        onChange={(e) => setFormData(prev => ({...prev, stock_quantity: e.target.value}))}
                        className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                        placeholder="0"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-black tracking-widest uppercase mb-2">Description</label>
                    <textarea value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      rows={3} placeholder="Product description..."
                      className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/8 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"/>
                  </div>

                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">{formError}</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white/40 hover:text-white text-sm font-semibold rounded-full transition-all">
                      Cancel
                    </button>
                    <button type="submit"
                      className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-black rounded-full transition-all hover:shadow-lg hover:shadow-violet-600/25">
                      {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirm remove dialog */}
        <ConfirmDialog
          product={confirmProduct}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmProduct(null)}
        />

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)}/>}
      </div>
    </AdminLayout>
  )
}

function StockBadge({ stock, status }) {
  const cfg = {
    'out-of-stock': 'bg-red-500/15 text-red-400 border-red-500/20',
    'low-stock': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    'in-stock': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  }
  const label = {
    'out-of-stock': 'Out of Stock',
    'low-stock': `Low (${stock})`,
    'in-stock': `In Stock (${stock})`,
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${cfg[status]}`}>
      {label[status]}
    </span>
  )
}