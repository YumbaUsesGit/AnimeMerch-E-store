  import { useState } from 'react'
  import { useNavigate, useLocation } from 'react-router-dom'
  import { supabase } from '../../lib/supabase'

  export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/admin/dashboard'

    const handleLogin = async (e) => {
      console.log('Attempting login with email:', email) // Debug log
    e.preventDefault()
    setLoading(true)
    setError('')

      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) throw authError

        // Check if user has owner role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError || profile?.role !== 'owner') {
          await supabase.auth.signOut()
          setError('Unauthorized — admin access only')
          return
        }

        // Navigate directly — don't wait for AuthContext
        navigate(from, { replace: true })

      } catch (err) {
        setError(err.message || 'Invalid credentials')
      } finally {
        setLoading(false)
      }

      console.log('Login process completed') // Debug log
    }
    

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-[#141414] rounded-xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Admin Login</h2>
              <p className="text-gray-400 mt-2">Access your admin dashboard</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                  placeholder="admin@mitras.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-medium rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0f0f0f]"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }
