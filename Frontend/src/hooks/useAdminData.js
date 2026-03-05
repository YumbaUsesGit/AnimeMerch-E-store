import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Fetch Dashboard Data
export function useDashboardData() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch total revenue
        const { data: revenueData, error: revenueError } = await supabase
          .rpc('get_total_revenue')
        
        if (revenueError) throw revenueError
        
        // Fetch monthly revenue
        const { data: monthlyData, error: monthlyError } = await supabase
          .rpc('get_monthly_revenue')
        
        if (monthlyError) throw monthlyError
        
        // Fetch pending orders count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .eq('status', 'pending')
        
        if (pendingError) throw pendingError
        
        // Fetch total products count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact' })
        
        if (productError) throw productError
        
        // Fetch recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            customer_name,
            total_price,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (ordersError) throw ordersError
        
        // Fetch top products
        const { data: topProductsData, error: topProductsError } = await supabase
          .rpc('get_top_products')
        
        if (topProductsError) throw topProductsError
        
        setStats({
          totalRevenue: revenueData || 0,
          monthlyRevenue: monthlyData || 0,
          pendingOrders: pendingCount || 0,
          totalProducts: productCount || 0
        })
        
        setRecentOrders(ordersData || [])
        setTopProducts(topProductsData || [])
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, recentOrders, topProducts, loading, error }
}

// Fetch Orders Data
export function useOrdersData() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async (searchTerm = '', statusFilter = '') => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          total_price,
          status,
          created_at
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Refresh orders data
      await fetchOrders()
      
      return { success: true }
    } catch (err) {
      console.error('Error updating order status:', err)
      return { success: false, error: err.message }
    }
  }

  return { orders, loading, error, fetchOrders, updateOrderStatus }
}

// Fetch Products Data
export function useProductsData() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async (searchTerm = '', categoryFilter = '') => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) throw error
      
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error

      // Refresh products data
      await fetchProducts()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding product:', err)
      return { success: false, error: err.message }
    }
  }

  const updateProduct = async (productId, productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error

      // Refresh products data
      await fetchProducts()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating product:', err)
      return { success: false, error: err.message }
    }
  }

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      // Refresh products data
      await fetchProducts()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting product:', err)
      return { success: false, error: err.message }
    }
  }

  // Upload image to Supabase Storage
  const uploadImage = async (file, fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (err) {
      console.error('Error uploading image:', err)
      return { success: false, error: err.message }
    }
  }

  return { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    uploadImage
  }
}

