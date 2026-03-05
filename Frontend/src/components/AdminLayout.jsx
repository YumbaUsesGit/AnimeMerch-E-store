import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  {
    to: '/admin/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    to: '/admin/orders', label: 'Orders',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  },
  {
    to: '/admin/products', label: 'Products',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  },
]

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-[#0d0d0d] border-r border-white/5 z-40">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link to="/admin/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-violet-600 rounded-sm flex items-center justify-center font-black text-white text-xs rotate-3 group-hover:rotate-6 transition-transform duration-300">
              M
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-tight leading-none">MITRAS</p>
              <p className="text-violet-400 text-[9px] font-black tracking-widest uppercase">Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-white/20 text-[9px] font-black tracking-widest uppercase px-3 mb-2">Menu</p>
          <ul className="space-y-0.5">
            {NAV.map(({ to, label, icon }) => (
              <li key={to}>
                <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                }`}>
                  <span className={isActive(to) ? 'text-violet-400' : 'text-white/30'}>{icon}</span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            View Store
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d0d] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-600 rounded-sm flex items-center justify-center font-black text-white text-[10px] rotate-3">M</div>
          <span className="text-white font-black text-sm tracking-tight">MITRAS <span className="text-violet-400">ADMIN</span></span>
        </Link>
        <Link to="/" className="text-white/30 hover:text-white text-xs transition-colors">View Store</Link>
      </header>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d0d] border-t border-white/5 flex">
        {NAV.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold tracking-wide transition-colors ${
            isActive(to) ? 'text-violet-400' : 'text-white/25 hover:text-white/60'
          }`}>
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}