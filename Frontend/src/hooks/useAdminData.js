import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Dashboard ──
export function useDashboardData() {
  const [stats, setStats] = useState({ totalRevenue: 0, monthlyRevenue: 0, pendingOrders: 0, totalProducts: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [
          { data: revenueData, error: revenueError },
          { data: monthlyData, error: monthlyError },
          { count: pendingCount, error: pendingError },
          { count: productCount, error: productError },
          { data: ordersData, error: ordersError },
          { data: topProductsData, error: topProductsError },
        ] = await Promise.all([
          supabase.rpc('get_total_revenue'),
          supabase.rpc('get_monthly_revenue'),
          supabase.from('orders').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true),
          supabase.from('orders').select('id, reference, customer_name, total_price, status, created_at').order('created_at', { ascending: false }).limit(10),
          supabase.rpc('get_top_products'),
        ])

        if (revenueError) throw revenueError
        if (monthlyError) throw monthlyError
        if (pendingError) throw pendingError
        if (productError) throw productError
        if (ordersError) throw ordersError
        if (topProductsError) throw topProductsError

        setStats({
          totalRevenue: revenueData || 0,
          monthlyRevenue: monthlyData || 0,
          pendingOrders: pendingCount || 0,
          totalProducts: productCount || 0,
        })
        setRecentOrders(ordersData || [])
        setTopProducts(topProductsData || [])
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { stats, recentOrders, topProducts, loading, error }
}

// ── Orders ──
export function useOrdersData() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async (searchTerm = '', statusFilter = '') => {
    try {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select('id, reference, customer_name, customer_phone, total_price, status, created_at')
        .order('created_at', { ascending: false })

      if (searchTerm) query = query.or(`customer_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`)
      if (statusFilter && statusFilter !== 'all') query = query.eq('status', statusFilter)

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Orders error:', err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      await fetchOrders()
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { orders, loading, error, fetchOrders, updateOrderStatus }
}

// ── Products ──
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
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (searchTerm) query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      if (categoryFilter && categoryFilter !== 'all') query = query.eq('category', categoryFilter)

      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Products error:', err)
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
        .insert([{ ...productData, is_active: true }])
        .select()
        .single()

      if (error) throw error
      await fetchProducts()
      return { success: true, data }
    } catch (err) {
      console.error('Add product error:', err)
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
      await fetchProducts()
      return { success: true, data }
    } catch (err) {
      console.error('Update product error:', err)
      return { success: false, error: err.message }
    }
  }

  const uploadImage = async (file, fileName) => {
    try {
      const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return { success: true, url: publicUrl }
    } catch (err) {
      console.error('Upload error:', err)
      return { success: false, error: err.message }
    }
  }

  return { products, loading, error, fetchProducts, addProduct, updateProduct, uploadImage }
}