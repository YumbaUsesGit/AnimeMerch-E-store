import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import useCartStore from '../store/cartStore';

const SIZES = ["S", "M", "L", "XL"];

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
    </svg>
  );
}

function RelatedCard({ product }) {
  const outOfStock = product.stock_quantity === 0;
  return (
    <Link to={`/product/${product.id}`} className="group block shrink-0 w-40 sm:w-48">
      <div className="relative overflow-hidden rounded-xl bg-[#111] border border-white/5 group-hover:border-violet-500/30 transition-all duration-300">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={product.image_url || "https://placehold.co/300x400/0d0d1a/7c3aed?text=•"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? "opacity-40 grayscale" : ""}`}
            onError={(e) => { e.target.src = "https://placehold.co/300x400/0d0d1a/7c3aed?text=•"; }}
          />
        </div>
        <div className="p-3">
          <p className="text-white/40 text-[9px] tracking-widest uppercase font-bold mb-0.5">{product.category}</p>
          <h4 className="text-white text-xs font-semibold leading-snug mb-1.5 line-clamp-2 group-hover:text-violet-300 transition-colors">{product.name}</h4>
          <p className="text-white font-black text-sm">ZMK {product.price?.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 bg-white/5 rounded-full w-40 mb-8" />
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <div className="lg:w-[55%]"><div className="aspect-[4/5] bg-white/5 rounded-2xl" /></div>
        <div className="lg:w-[45%] space-y-4">
          <div className="h-3 bg-white/5 rounded-full w-20" />
          <div className="h-8 bg-white/5 rounded-full w-3/4" />
          <div className="h-8 bg-white/5 rounded-full w-1/2" />
          <div className="h-20 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/5 rounded-full" />
          <div className="h-12 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const addItem = useCartStore(state => state.addItem);
  const isInCart = useCartStore(state => state.isInCart);

  useEffect(() => {
    setProduct(null); setLoading(true); setError(null);
    setQuantity(1); setSelectedSize(null); setSizeError(false);
    setAddedToCart(false); setRelatedProducts([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) throw new Error('Product not found');
        setProduct(data);
        const { data: related } = await supabase.from('products').select('*')
          .eq('category', data.category).neq('id', id).limit(6).order('created_at', { ascending: false });
        setRelatedProducts(related || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return; }
    addItem({ ...product, selectedSize }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); setTimeout(() => setSizeError(false), 2000); return; }
    addItem({ ...product, selectedSize }, quantity);
    navigate('/cart');
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I'm interested in "${product.name}"${selectedSize ? ` (Size: ${selectedSize})` : ""}. Price: ZMK ${product.price?.toLocaleString()}. Can you help me order?`;
    window.open(`https://wa.me/254700000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <ProductSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-white/20 text-6xl font-black mb-4">!</p>
        <p className="text-white/50 text-sm mb-6">{error || "Product not found"}</p>
        <Link to="/" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-full transition-colors">Back to Store</Link>
      </div>
    );
  }

  const outOfStock = product.stock_quantity === 0;
  const lowStock = !outOfStock && product.stock_quantity <= 5;
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const alreadyInCart = isInCart(product.id);
  const total = (product.price * quantity).toLocaleString();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs text-white/25">
          <Link to="/" className="hover:text-white/60 transition-colors flex items-center gap-1.5">
            <ArrowLeft />Back
          </Link>
          <span>/</span>
          <span className="text-violet-400/70">{product.category}</span>
          <span>/</span>
          <span className="text-white/40 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* Image */}
          <div className="lg:w-[55%]">
            <div className="relative rounded-2xl overflow-hidden bg-[#111] border border-white/5 aspect-[4/5]">
              <img
                src={product.image_url || "https://placehold.co/600x750/0d0d1a/7c3aed?text=•"}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${outOfStock ? "opacity-50 grayscale" : ""}`}
                onError={(e) => { e.target.src = "https://placehold.co/600x750/0d0d1a/7c3aed?text=•"; }}
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isNew && !outOfStock && (
                  <span className="px-3 py-1.5 bg-violet-600 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">NEW</span>
                )}
                {outOfStock && (
                  <span className="px-3 py-1.5 bg-black/80 text-white/50 text-[10px] font-black tracking-widest uppercase rounded-full border border-white/10">SOLD OUT</span>
                )}
                {lowStock && (
                  <span className="px-3 py-1.5 bg-amber-500 text-black text-[10px] font-black tracking-widest uppercase rounded-full">LAST {product.stock_quantity}</span>
                )}
              </div>
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black text-2xl tracking-tight drop-shadow-lg">ZMK {product.price?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start">
            <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-2">{product.category}</p>
            <h1 className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-tight mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-red-500' : lowStock ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className={`text-xs font-semibold ${outOfStock ? 'text-red-400' : lowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                {outOfStock ? 'Out of Stock' : lowStock ? `Only ${product.stock_quantity} left` : 'In Stock'}
              </span>
            </div>

            {product.description && (
              <p className="text-white/50 text-sm leading-relaxed mb-8 border-l-2 border-violet-600/40 pl-4">{product.description}</p>
            )}

            {!outOfStock && (
              <>
                {/* Size selector */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-black tracking-widest uppercase flex items-center gap-1.5 ${sizeError ? 'text-red-400' : 'text-white/50'}`}>
                      {sizeError && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      )}
                      {sizeError ? 'Please select a size' : 'Select Size'}
                    </p>
                    <button className="text-violet-400 text-xs hover:text-violet-300 transition-colors">Size Guide</button>
                  </div>
                  <div className="flex gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false); }}
                        className={`w-12 h-12 rounded-xl text-sm font-black transition-all duration-200 border ${
                          selectedSize === size
                            ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/30'
                            : sizeError
                            ? 'border-red-500/50 text-red-400/70 bg-red-500/5 hover:border-red-400'
                            : 'border-white/10 text-white/50 bg-white/[0.03] hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-xs font-black tracking-widest uppercase text-white/50 mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-full overflow-hidden">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}
                        className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors text-lg font-light">−</button>
                      <span className="w-10 text-center text-white font-black text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))} disabled={quantity >= product.stock_quantity}
                        className="w-11 h-11 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-30 transition-colors text-lg font-light">+</button>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl tracking-tight">ZMK {total}</p>
                      {quantity > 1 && <p className="text-white/30 text-[10px]">ZMK {product.price?.toLocaleString()} each</p>}
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 mb-6">
                  <button onClick={handleAddToCart}
                    className={`w-full py-4 rounded-full font-black text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                      addedToCart ? 'bg-emerald-600 text-white'
                      : alreadyInCart ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300'
                      : 'bg-violet-600 hover:bg-violet-500 text-white hover:shadow-lg hover:shadow-violet-600/25 hover:-translate-y-0.5'
                    }`}>
                    {addedToCart ? <CheckIcon /> : <CartIcon />}
                    {addedToCart ? 'Added to Cart' : alreadyInCart ? 'Add Again' : 'Add to Cart'}
                  </button>
                  <button onClick={handleBuyNow}
                    className="w-full py-4 rounded-full font-black text-sm tracking-wide uppercase border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                    Buy Now
                  </button>
                </div>
              </>
            )}

            {/* WhatsApp */}
            <button onClick={handleWhatsApp}
              className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-green-600/10 border border-green-600/20 text-green-400 hover:bg-green-600/20 transition-all duration-300 mb-8">
              <WhatsAppIcon />
              Ask on WhatsApp
            </button>

            {/* Trust badges — SVG icons */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400 mb-1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <p className="text-white text-[11px] font-bold">Authentic</p>
                <p className="text-white/30 text-[10px]">100% genuine</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400 mb-1.5">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <p className="text-white text-[11px] font-bold">Via Yango</p>
                <p className="text-white/30 text-[10px]">24–48hrs</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-400 mb-1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <p className="text-white text-[11px] font-bold">WhatsApp</p>
                <p className="text-white/30 text-[10px]">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-black text-xl tracking-tight">More in {product.category}</h3>
              <Link to="/" className="text-violet-400 text-xs font-bold hover:text-violet-300 transition-colors">View all →</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {relatedProducts.map((p) => <RelatedCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}