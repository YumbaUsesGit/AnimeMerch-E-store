  import { useState, useEffect, useMemo } from 'react'
  import AdminLayout from '../../components/AdminLayout'
  import { supabase } from '../../lib/supabase'

  // ─── Status Badge Component ───
  function StatusBadge({ status }) {
    const statusConfig = {
      pending: { text: 'Pending', color: 'bg-amber-500/20 text-amber-400' },
      confirmed: { text: 'Confirmed', color: 'bg-blue-500/20 text-blue-400' },
      shipped: { text: 'Shipped', color: 'bg-indigo-500/20 text-indigo-400' },
      delivered: { text: 'Delivered', color: 'bg-emerald-500/20 text-emerald-400' },
      cancelled: { text: 'Cancelled', color: 'bg-red-500/20 text-red-400' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  }

  // ─── Order Detail Modal ───
  function OrderDetailModal({ order, onClose, onUpdateStatus, onWhatsAppNotify }) {
    if (!order) return null;

    const getNextStatus = (currentStatus) => {
      const flow = {
        pending: 'confirmed',
        confirmed: 'shipped',
        shipped: 'delivered',
        delivered: 'delivered',
        cancelled: 'pending'
      };
      return flow[currentStatus] || 'pending';
    };

    const getOrderItems = async (orderId) => {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            *,
            products (name, image_url)
          `)
          .eq('order_id', orderId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching order items:', error);
        return [];
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#141414] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Order Details</h2>
                <p className="text-white/50 text-sm">#{order.id.substring(0, 8)}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/50 mb-1">Name</p>
                    <p className="text-white">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Phone</p>
                    <p className="text-white">{order.customer_phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-white/50 mb-1">Delivery Address</p>
                    <p className="text-white">{order.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-white font-medium mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#2a2a2a] border border-white/5 mr-3">
                          <img
                            src={item.products?.image_url || "https://placehold.co/40x40/1a1a2e/7c3aed?text=."}
                            alt={item.products?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                        <div>
                          <p className="text-white text-sm">{item.products?.name || 'Product'}</p>
                          <p className="text-white/50 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">
                          ZMK {(item.price_at_time * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Total Amount</span>
                    <span className="text-white font-medium">ZMK {order.total_price?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Status</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex justify-between text-white/50 text-sm">
                    <span>Order Date</span>
                    <span className="text-white">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => onUpdateStatus(order.id, getNextStatus(order.status))}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Mark as {getNextStatus(order.status)}
                </button>
                <button
                  onClick={() => onWhatsAppNotify(order)}
                  className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-600/30 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
                  </svg>
                  WhatsApp Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Admin Orders Component ───
  export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Load orders on component mount
    useEffect(() => {
      fetchOrders()
    }, [])

    // Enhanced fetch orders with order items
    const fetchOrders = async (searchTerm = '', statusFilter = '') => {
      try {
        setLoading(true)
        
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (name, image_url)
            )
          `)
          .order('created_at', { ascending: false })

        // Apply search filter
        if (searchTerm) {
          query = query.or(`customer_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`)
        }

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
          query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        if (error) throw error
        
        setOrders(data || [])
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError(err.message)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
      setUpdating(true)
      try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

        if (error) throw error

        // Refresh orders data
        await fetchOrders()
        
        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }))
        }
        
        return { success: true }
      } catch (err) {
        console.error('Error updating order status:', err)
        return { success: false, error: err.message }
      } finally {
        setUpdating(false)
      }
    }

    // Send WhatsApp notification
    const handleWhatsAppNotify = (order) => {
      const message = `Hello ${order.customer_name}, your order #${order.id.substring(0, 8)} status has been updated to: ${order.status}`
      const whatsappUrl = `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }

    // Filter orders based on search and status
    const filteredOrders = useMemo(() => {
      return orders.filter(order => {
        const matchesSearch = !searchTerm || 
          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
    }, [orders, searchTerm, statusFilter])

    // Get status counts for filter tabs
    const statusCounts = useMemo(() => {
      const counts = {
        all: orders.length,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
      
      orders.forEach(order => {
        counts[order.status] = (counts[order.status] || 0) + 1
      })
      
      return counts
    }, [orders])

    if (loading && orders.length === 0) {
      return (
        <AdminLayout>
          <div className="p-6">
            <div className="bg-[#141414] rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-[#1a1a1a] rounded-lg mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Orders Management</h1>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#141414] rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Search Orders</label>
                <input
                  type="text"
                  placeholder="Search by name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="all">All Orders ({statusCounts.all})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                  <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                  <option value="shipped">Shipped ({statusCounts.shipped})</option>
                  <option value="delivered">Delivered ({statusCounts.delivered})</option>
                  <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(statusCounts).map(([status, count]) => (
              status !== 'all' && (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#1a1a1a] text-white/70 hover:bg-[#1a1a1a]/80'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              )
            ))}
          </div>

          {/* Orders List */}
          <div className="bg-[#141414] rounded-xl overflow-hidden">
            {error ? (
              <div className="p-6 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                Error loading orders: {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                </div>
                <div className="text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Orders will appear here once customers place them'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Order ID</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Items</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-6 text-gray-300">#{order.id.substring(0, 8)}</td>
                        <td className="py-4 px-6 text-gray-300">
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-white/50 text-sm">{order.customer_phone}</div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {order.order_items?.length || 0} items
                        </td>
                        <td className="py-4 px-6 text-gray-300">ZMK {order.total_price?.toLocaleString() || 0}</td>
                        <td className="py-4 px-6">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowModal(true)
                            }}
                            className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Detail Modal */}
          {showModal && selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setShowModal(false)}
              onUpdateStatus={updateOrderStatus}
              onWhatsAppNotify={handleWhatsAppNotify}
            />
          )}
        </div>
      </AdminLayout>
    )
  }

