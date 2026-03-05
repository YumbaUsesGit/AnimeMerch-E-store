import { Link } from "react-router-dom";
import useCartStore from '../store/cartStore';

// ─── Empty State ───
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <h3 className="text-white text-xl font-black mb-2">Your cart is empty</h3>
      <p className="text-white/30 text-sm mb-8 max-w-xs">You haven't added anything yet. Browse the store and find something you like.</p>
      <Link to="/" className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm tracking-wide uppercase rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-600/25">
        Browse Products
      </Link>
    </div>
  );
}

// ─── Cart Item ───
function CartItem({ item }) {
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const removeItem = useCartStore(state => state.removeItem)

  return (
    <div className="flex items-start gap-4 py-5 border-b border-white/5 last:border-0">
      {/* Image */}
      <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#111] border border-white/5 shrink-0">
        <img
          src={item.image_url || "https://placehold.co/100x120/0d0d1a/7c3aed?text=•"}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://placehold.co/100x120/0d0d1a/7c3aed?text=•"; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="text-white/40 text-[10px] tracking-widest uppercase font-bold mb-0.5">{item.category}</p>
            <h3 className="text-white text-sm font-bold leading-snug truncate">{item.name}</h3>
            {/* Size badge */}
            {item.selectedSize && (
              <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[10px] font-black tracking-widest uppercase rounded-full">
                Size {item.selectedSize}
              </span>
            )}
          </div>
          <button
            onClick={() => removeItem(item.cartKey)}
            className="text-white/20 hover:text-red-400 transition-colors shrink-0 mt-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Quantity + price row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-full overflow-hidden">
            <button
              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors text-base"
            >
              −
            </button>
            <span className="w-7 text-center text-white font-black text-xs">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
              disabled={item.quantity >= item.stock_quantity}
              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors text-base"
            >
              +
            </button>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-sm">ZMK {(item.price * item.quantity).toLocaleString()}</p>
            {item.quantity > 1 && (
              <p className="text-white/25 text-[10px]">ZMK {item.price.toLocaleString()} each</p>
            )}
          </div>
        </div>

        {item.quantity >= item.stock_quantity && (
          <p className="text-amber-400 text-[10px] font-semibold mt-1.5">Max stock reached</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Cart ───
export default function Cart() {
  const cartItems = useCartStore(state => state.cartItems)
  const clearCart = useCartStore(state => state.clearCart)
  const getCartTotal = useCartStore(state => state.getCartTotal)
  const getCartCount = useCartStore(state => state.getCartCount)

  const subtotal = getCartTotal()
  const shippingCost = subtotal >= 2000 ? 0 : 150
  const total = subtotal + shippingCost
  const remaining = Math.max(0, 2000 - subtotal)
  const progress = Math.min(100, (subtotal / 2000) * 100)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <EmptyCart />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-1">Your</p>
            <h1 className="text-white text-3xl font-black tracking-tight">
              Cart
              <span className="text-white/20 font-medium text-xl ml-3">{getCartCount()} items</span>
            </h1>
          </div>
          <button
            onClick={() => { if (window.confirm('Clear your entire cart?')) clearCart() }}
            className="text-white/20 hover:text-red-400 text-xs font-semibold transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Items ── */}
          <div className="lg:w-[60%]">
            <div className="bg-[#111] rounded-2xl border border-white/5 px-5 divide-y divide-white/5">
              {cartItems.map((item) => (
                <CartItem key={item.cartKey} item={item} />
              ))}
            </div>

            {/* Free shipping bar */}
            <div className="mt-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
              {remaining > 0 ? (
                <>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/40">Add <span className="text-white font-bold">ZMK {remaining.toLocaleString()}</span> more for free shipping</span>
                    <span className="text-white/25">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <p className="text-emerald-400 text-xs font-bold">You qualify for free shipping!</p>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col items-center text-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400 mb-1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="text-white text-[11px] font-bold">Authentic</p>
                <p className="text-white/25 text-[10px]">100% genuine</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400 mb-1.5">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <p className="text-white text-[11px] font-bold">Via Yango</p>
                <p className="text-white/25 text-[10px]">24–48hrs</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400 mb-1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p className="text-white text-[11px] font-bold">WhatsApp</p>
                <p className="text-white/25 text-[10px]">Support</p>
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-[40%]">
            <div className="bg-[#111] rounded-2xl border border-white/5 p-6 sticky top-24">
              <h2 className="text-white font-black text-lg mb-6">Order Summary</h2>

              {/* Mini item list */}
              <div className="space-y-3 mb-5 max-h-44 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-3">
                    <div className="w-9 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                      <img
                        src={item.image_url || "https://placehold.co/40x48/0d0d1a/7c3aed?text=•"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "https://placehold.co/40x48/0d0d1a/7c3aed?text=•"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-white/30 text-[10px]">
                        {item.selectedSize && `Size ${item.selectedSize} · `}× {item.quantity}
                      </p>
                    </div>
                    <p className="text-white text-xs font-black shrink-0">ZMK {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 pt-4 border-t border-white/5 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white">ZMK {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Shipping</span>
                  {shippingCost === 0
                    ? <span className="text-emerald-400 font-bold">FREE</span>
                    : <span className="text-white">ZMK {shippingCost.toLocaleString()}</span>
                  }
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-white font-black">Total</span>
                  <span className="text-white font-black text-xl">ZMK {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment note */}
              <div className="flex items-center gap-3 p-3 bg-green-600/10 border border-green-600/20 rounded-xl mb-5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400 shrink-0">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <div>
                  <p className="text-green-400 text-xs font-bold">Pay via Airtel Money</p>
                  <p className="text-white/30 text-[10px]">Payment details sent on WhatsApp after order</p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm tracking-wide uppercase text-center rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-600/25 mb-3"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/"
                className="block w-full py-3 text-center text-white/30 hover:text-white text-xs font-semibold transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}