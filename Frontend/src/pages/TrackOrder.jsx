import { useState } from "react";
import { supabase } from '../lib/supabase';

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const STATUS_CONFIG = {
  pending: {
    label: "Order Placed",
    sub: "We've received your order",
    color: "text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    sub: "Your order has been confirmed and is being packed",
    color: "text-blue-400",
    bg: "bg-blue-500",
    border: "border-blue-500/30",
  },
  shipped: {
    label: "On the Way",
    sub: "Your order is with Yango and on its way to you",
    color: "text-violet-400",
    bg: "bg-violet-500",
    border: "border-violet-500/30",
  },
  delivered: {
    label: "Delivered",
    sub: "Your order has been delivered. Enjoy!",
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    sub: "This order has been cancelled",
    color: "text-red-400",
    bg: "bg-red-500",
    border: "border-red-500/30",
  },
};

const PROGRESS_WIDTH = "calc(100% - 2rem)";

function StatusTracker({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
        <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
        <div>
          <p className="text-red-400 font-bold text-sm">Order Cancelled</p>
          <p className="text-white/30 text-xs">Contact us on WhatsApp for help.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/5" />
      <div
        className="absolute top-4 left-4 h-0.5 bg-violet-600 transition-all duration-700"
        style={{ width: `calc(${(currentIndex / (STATUS_STEPS.length - 1)) * 100}% * (100% - 2rem) / 100%)` }}
      />
      <div className="relative flex justify-between">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          const cfg = STATUS_CONFIG[step];
          return (
            <div key={step} className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                done ? `${cfg.bg} border-transparent` : 'bg-[#111] border-white/10'
              } ${active ? 'ring-4 ring-violet-500/20' : ''}`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                )}
              </div>
              <p className={`text-[10px] font-bold tracking-wide text-center leading-tight ${done ? cfg.color : 'text-white/20'}`}>
                {cfg.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setOrderItems([]);
    setSearched(true);

    try {
      // Search by reference column (stored as uppercase 8-char string)
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('reference', ref)
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        setError("No order found with that reference. Please check and try again.");
        return;
      }

      const foundOrder = orders[0];
      setOrder(foundOrder);

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`*, products(name, image_url, category)`)
        .eq('order_id', foundOrder.id);

      if (itemsError) throw itemsError;
      setOrderItems(items || []);

    } catch (err) {
      console.error('Track order error:', err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = order ? STATUS_CONFIG[order.status] || STATUS_CONFIG.pending : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        <div className="text-center mb-10">
          <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-2">Mitras Clothing</p>
          <h1 className="text-white font-black text-3xl sm:text-4xl tracking-tight mb-3">Track Your Order</h1>
          <p className="text-white/30 text-sm">Enter the reference number from your order confirmation</p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="e.g. 34294EEF"
              maxLength={8}
              className="flex-1 px-5 py-4 bg-[#111] border border-white/8 rounded-full text-white placeholder-white/20 font-mono text-sm tracking-widest focus:outline-none focus:border-violet-500/60 transition-colors uppercase"
            />
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="px-7 py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 disabled:text-white/30 text-white font-black text-sm rounded-full transition-all duration-300 shrink-0"
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              ) : "Track"}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-white/30 text-xs mt-1">Your reference is the 8-character code shown on your order confirmation screen</p>
          </div>
        )}

        {order && currentStatus && (
          <div className="space-y-4">
            <div className={`p-5 bg-[#111] border rounded-2xl ${currentStatus.border}`}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white/30 text-[10px] tracking-widest uppercase font-bold mb-1">Order Reference</p>
                  <p className="text-white font-mono font-black text-lg tracking-widest">#{order.reference}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full border text-xs font-black tracking-widest uppercase ${currentStatus.color} ${currentStatus.border} bg-white/[0.03]`}>
                  {currentStatus.label}
                </div>
              </div>
              {order.status !== 'cancelled' && <StatusTracker status={order.status} />}
              <div className={`mt-5 p-3 rounded-xl bg-white/[0.02] border ${currentStatus.border}`}>
                <p className={`text-sm font-semibold ${currentStatus.color}`}>{currentStatus.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{currentStatus.sub}</p>
              </div>
            </div>

            {orderItems.length > 0 && (
              <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <h3 className="text-white font-black text-sm">Items Ordered</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] shrink-0 border border-white/5">
                        <img
                          src={item.products?.image_url || "https://placehold.co/60x70/0d0d1a/7c3aed?text=•"}
                          alt={item.products?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://placehold.co/60x70/0d0d1a/7c3aed?text=•"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/30 text-[10px] tracking-widest uppercase font-bold mb-0.5">{item.products?.category}</p>
                        <p className="text-white text-sm font-semibold leading-snug truncate">{item.products?.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {item.selected_size && (
                            <span className="px-2 py-0.5 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-[9px] font-black tracking-widest uppercase rounded-full">
                              Size {item.selected_size}
                            </span>
                          )}
                          <span className="text-white/25 text-[10px]">× {item.quantity}</span>
                        </div>
                      </div>
                      <p className="text-white font-black text-sm shrink-0">ZMK {(item.price_at_time * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-white/40 text-sm">Total</span>
                  <span className="text-white font-black">ZMK {order.total_price?.toLocaleString()}</span>
                </div>
              </div>
            )}

            <a
              href={`https://wa.me/254700000000?text=${encodeURIComponent(`Hi! I'm tracking my order #${order.reference}. Can you give me an update?`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-4 bg-green-600/10 border border-green-600/20 hover:bg-green-600/20 text-green-400 font-bold text-sm rounded-2xl transition-all duration-300"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
              </svg>
              Need help? Chat on WhatsApp
            </a>
          </div>
        )}

        {!searched && !order && (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-white/20 text-sm">Enter your order reference to get started</p>
          </div>
        )}

      </div>
    </div>
  );
}