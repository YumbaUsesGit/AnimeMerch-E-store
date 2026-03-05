import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useCartStore from '../store/cartStore'
import useUIStore from '../store/uiStore'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cartCount = useCartStore(state => state.getCartCount())
  const { searchOpen, toggleSearch } = useUIStore()
  const location = useLocation()

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { label: 'Shop', to: '/' },
    { label: 'Track Order', to: '/track' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/8 shadow-xl shadow-black/20'
        : 'bg-[#0a0a0a] border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-violet-600 rounded-sm flex items-center justify-center font-black text-white text-xs rotate-3 group-hover:rotate-6 transition-transform duration-300 shrink-0">
              M
            </div>
            <span className="font-black text-white tracking-tight text-base">
              MITRAS<span className="text-violet-400">CLOTHING</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'text-white bg-white/8'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">

            {/* Search */}
            <button
              onClick={toggleSearch}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
                searchOpen
                  ? 'bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
              aria-label="Search"
            >
              {searchOpen ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              )}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="Cart"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-lg shadow-violet-600/40">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* WhatsApp — desktop only */}
            <a
              href="https://wa.me/+260978917953?text=Hi! I have a question."
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 ml-1 px-3.5 py-2 bg-green-600/15 hover:bg-green-600/25 border border-green-600/20 text-green-400 text-xs font-bold rounded-full transition-all duration-200"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
              </svg>
              Chat
            </a>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-3">
            <div className="flex flex-col gap-0.5 mb-3">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-white bg-white/8'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
            {/* WhatsApp in mobile menu */}
            <a
              href="https://wa.me/+260978917953?text=Hi! I have a question."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 text-green-400 text-sm font-medium rounded-xl hover:bg-green-600/10 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        )}
      </div>
    </header>
  )
}