import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import useCartStore from '../store/cartStore';

// ── Icons ──
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckCircle = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const MapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const User = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Phone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
  </svg>
);

// ── Input Field ──
function Field({ label, icon, error, textarea, ...props }) {
  return (
    <div>
      <label className="block text-white/40 text-xs tracking-widest uppercase mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">{icon}</span>
        )}
        {textarea ? (
          <textarea
            {...props}
            rows={3}
            className="w-full px-4 py-3.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500 transition-colors resize-none"
          />
        ) : (
          <input
            {...props}
            className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3.5 bg-[#1a1a1a] border rounded-xl text-white text-sm placeholder-white/20 focus:outline-none transition-colors ${
              error ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-violet-500"
            }`}
          />
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Order Confirmed Screen ──
function OrderConfirmed({ orderRef, phone }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-6"><CheckCircle /></div>
      <h2 className="text-white text-2xl font-black mb-2">Order Placed!</h2>
      <p className="text-white/40 text-sm mb-1">Your order reference is</p>
      <p className="text-violet-400 font-black text-lg tracking-widest mb-6">#{orderRef}</p>
      <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-8 text-left w-full max-w-sm">
        <h3 className="text-white font-bold text-sm mb-3">What happens next</h3>
        <ul className="space-y-3">
          {[
            { n: "1", text: <>We'll send you an <span className="text-white font-medium">Airtel Money</span> number on WhatsApp at <span className="text-white font-medium">{phone}</span></> },
            { n: "2", text: <>Once payment is confirmed your order will be packed and handed to <span className="text-white font-medium">Yango</span></> },
            { n: "3", text: <>Delivery within <span className="text-white font-medium">24–48 hours</span></> },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-black text-xs shrink-0 mt-0.5">{n}.</span>
              <span className="text-white/50 text-xs leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          to={`/track?ref=${orderRef}`}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-full transition-all text-center"
        >
          Track My Order
        </Link>
        <Link
          to="/"
          className="w-full py-3.5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white text-sm font-medium rounded-full transition-all text-center"
        >
          Back to Shop
        </Link>
      </div>
    </div>
  );
}

// ── Main Checkout ──
export default function Checkout() {
  const navigate = useNavigate();

  // Cart store
  const cartItems = useCartStore(state => state.cartItems);
  const clearCart = useCartStore(state => state.clearCart);
  const getCartTotal = useCartStore(state => state.getCartTotal);
  const getCartCount = useCartStore(state => state.getCartCount);

  const subtotal = getCartTotal();
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !confirmed) {
      navigate('/cart');
    }
  }, [cartItems, confirmed, navigate]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9+\s]{9,15}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Delivery address is required";
    if (!form.city.trim()) e.city = "City is required";
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Insert order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          customer_city: form.city,
          notes: form.notes,
          total_price: total,
          status: 'pending',
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(cartItems.map(item => ({
          order_id: orderResult.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price,
          selected_size: item.selectedSize || null,
        })));

      if (itemsError) throw itemsError;

      // Update stock
      await Promise.all(cartItems.map(async (item) => {
        const { data: p } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();
        if (p) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) })
            .eq('id', item.id);
        }
      }));

      // Save reference to orders table for tracking
      const ref = orderResult.id.substring(0, 8).toUpperCase();
      await supabase
        .from('orders')
        .update({ reference: ref })
        .eq('id', orderResult.id);

      clearCart();
      setOrderRef(ref);
      setConfirmed(true);

    } catch (err) {
      console.error('Checkout error:', err);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <OrderConfirmed orderRef={orderRef} phone={form.phone} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/cart")}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 hover:border-violet-500/50 text-white/50 hover:text-white transition-all"
        >
          <ChevronLeft />
        </button>
        <div>
          <h1 className="text-white text-2xl font-black tracking-tight">Checkout</h1>
          <p className="text-white/30 text-xs mt-0.5">{getCartCount()} items · ZMK {total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">

        {/* Delivery Details */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-5">Delivery Details</p>
          <div className="flex flex-col gap-4">
            <Field label="Full Name" icon={<User />} name="name" type="text" placeholder="e.g. Mwila Banda" value={form.name} onChange={handleChange} error={errors.name} />
            <Field label="Phone Number" icon={<Phone />} name="phone" type="tel" placeholder="e.g. 0977 000 000" value={form.phone} onChange={handleChange} error={errors.phone} />
            <Field label="Delivery Address" icon={<MapPin />} name="address" type="text" placeholder="Street, area, landmark..." value={form.address} onChange={handleChange} error={errors.address} />
            <Field label="City / Town" icon={<MapPin />} name="city" type="text" placeholder="e.g. Lusaka" value={form.city} onChange={handleChange} error={errors.city} />
            <Field label="Order Notes (optional)" name="notes" textarea placeholder="Any special instructions..." value={form.notes} onChange={handleChange} />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">Payment Method</p>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
            <div className="w-4 h-4 rounded-full border-2 border-violet-500 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Airtel Money</p>
              <p className="text-white/30 text-xs mt-0.5">Payment details sent via WhatsApp after order</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-4">Order Summary</p>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.cartKey} className="flex items-center gap-3">
                <div className="w-10 h-12 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                  <img
                    src={item.image_url || "https://placehold.co/40x48/0d0d1a/7c3aed?text=•"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://placehold.co/40x48/0d0d1a/7c3aed?text=•"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium leading-snug truncate">{item.name}</p>
                  <p className="text-white/30 text-[10px]">
                    {item.selectedSize && `Size ${item.selectedSize} · `}×{item.quantity}
                  </p>
                </div>
                <span className="text-white text-xs font-bold shrink-0">
                  ZMK {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Subtotal</span>
              <span className="text-white">ZMK {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Shipping</span>
              <span className={shipping === 0 ? "text-emerald-400" : "text-white"}>
                {shipping === 0 ? "Free" : `ZMK ${shipping.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/5">
              <span className="text-white font-bold">Total</span>
              <span className="text-violet-400 font-black text-lg">ZMK {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {errors.submit && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm text-center">{errors.submit}</p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Placing Order...
            </>
          ) : "Place Order"}
        </button>

        <p className="text-center text-white/20 text-xs px-4">
          By placing your order you agree to be contacted via WhatsApp for delivery confirmation.
        </p>
      </div>
    </div>
  );
}