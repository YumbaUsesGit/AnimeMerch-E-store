import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Customer Pages
import Home from './pages/Home'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import TrackOrder from './pages/TrackOrder'

// Admin Pages
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminProducts from './pages/admin/Products'

// Layouts
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
        <Route path="/product/:id" element={<CustomerLayout><Product /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
        <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
        <Route path="/track" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />

        {/* Admin Login — public, no protection */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App