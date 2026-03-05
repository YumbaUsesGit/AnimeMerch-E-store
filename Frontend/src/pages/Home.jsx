import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import useUIStore from '../store/uiStore';

// ─── Product Card ───
function ProductCard({ product }) {
  const outOfStock = product.stock_quantity === 0;
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-[#111] border border-white/5 group-hover:border-violet-500/40 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-violet-900/20">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4]">
          <img
            src={product.image_url || "https://placehold.co/400x530/0d0d1a/7c3aed?text=•"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 ${outOfStock ? "opacity-50 grayscale" : ""}`}
            onError={(e) => { e.target.src = "https://placehold.co/400x530/0d0d1a/7c3aed?text=•"; }}
          />

          {/* Dark gradient at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick view pill */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="px-5 py-2 bg-violet-600 text-white text-[11px] font-black tracking-widest uppercase rounded-full shadow-lg">
              {outOfStock ? "Sold Out" : "View Product"}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && !outOfStock && (
              <span className="px-2.5 py-1 bg-violet-600 text-white text-[9px] font-black tracking-widest uppercase rounded-full">
                NEW
              </span>
            )}
            {outOfStock && (
              <span className="px-2.5 py-1 bg-black/80 text-white/50 text-[9px] font-black tracking-widest uppercase rounded-full border border-white/10">
                SOLD OUT
              </span>
            )}
            {!outOfStock && product.stock_quantity <= 5 && (
              <span className="px-2.5 py-1 bg-amber-500/90 text-black text-[9px] font-black tracking-widest uppercase rounded-full">
                LAST {product.stock_quantity}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pb-5">
          <p className="text-violet-400/70 text-[10px] tracking-widest uppercase font-bold mb-1">{product.category}</p>
          <h3 className="text-white/90 text-sm font-bold leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-white font-black text-base tracking-tight">
              ZMK {product.price?.toLocaleString()}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-600 group-hover:border-violet-600 transition-all duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40 group-hover:text-white transition-colors">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton Card ───
function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#111] border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-white/5" />
      <div className="p-4">
        <div className="h-2.5 bg-white/5 rounded-full w-16 mb-3" />
        <div className="h-3.5 bg-white/5 rounded-full w-full mb-2" />
        <div className="h-3.5 bg-white/5 rounded-full w-3/4 mb-4" />
        <div className="h-4 bg-white/5 rounded-full w-24" />
      </div>
    </div>
  );
}

// ─── Main Home Page ───
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(["All"]);
  const { searchOpen, closeSearch } = useUIStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);

      // Build categories from fetched products
      const cats = Array.from(new Set((data || []).map(p => p.category).filter(Boolean)));
      setCategories(["All", ...cats]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Announcement Bar ── */}
      <div className="bg-violet-600 py-2.5">
        <p className="text-center text-white text-[11px] font-bold tracking-widest uppercase">
          Free delivery on orders over ZMK 2,000 · Ships in 24–48hrs via Yango
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Manga panel grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="max-w-3xl">

            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-[11px] font-bold tracking-widest uppercase">New drops weekly</span>
            </div>

            {/* Headline */}
            <h1 className="text-white font-black tracking-tighter leading-[0.9] mb-6" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
              WEAR YOUR
              <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #7c3aed 100%)" }}>
                ANIME
              </span>
              <br />
              IDENTITY
            </h1>

            <p className="text-white/40 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
              Premium anime streetwear delivered to your door. Authentic gear for real fans.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-black text-sm tracking-wide uppercase rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/30 hover:-translate-y-0.5"
              >
                Shop Now
              </a>
              <a
                href="https://wa.me/+260978917953?text=Hi! I'd like to order."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-bold text-sm rounded-full transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
                </svg>
                Order via WhatsApp
              </a>
            </div>
          </div>

          {/* Floating stat pills */}
          <div className="flex gap-3 mt-14 overflow-x-auto pb-2 scrollbar-hide" style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
            {[
              { label: "Products", value: `${products.length}+` },
              { label: "Delivery", value: "24–48hrs" },
              { label: "Via", value: "Yango" },
              { label: "Payment", value: "Airtel Money" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-full backdrop-blur-sm">
                <span className="text-white/30 text-[11px] font-medium tracking-wide uppercase">{stat.label}</span>
                <span className="text-white text-[11px] font-black tracking-wide">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-1">Catalog</p>
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight">
              {activeCategory === "All" ? "All Products" : activeCategory}
              <span className="text-white/20 font-medium text-lg ml-3">
                {filteredProducts.length}
              </span>
            </h2>
          </div>

          {/* Search — desktop only */}
          <div className="relative hidden sm:block">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/8 rounded-full text-white text-sm placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors w-52"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>


        </div>

        {/* Mobile search — expands when toggled */}
        {searchOpen && (
          <div className="sm:hidden relative mb-5">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 bg-white/[0.04] border border-white/10 rounded-full text-white text-sm placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
            {search && (
              <button onClick={() => { setSearch(""); closeSearch(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Category pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide" style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition-all duration-200 shrink-0 ${
                activeCategory === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                  : "bg-white/[0.04] border border-white/8 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-white/20 text-5xl mb-4">!</p>
            <p className="text-white/30 text-sm mb-4">Failed to load products</p>
            <button onClick={fetchProducts} className="px-5 py-2 bg-violet-600/20 text-violet-400 text-xs font-bold rounded-full hover:bg-violet-600/30 transition-colors">
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-white/10 text-6xl font-black mb-4">?</p>
            <p className="text-white/30 text-sm mb-1">Nothing found</p>
            <p className="text-white/15 text-xs mb-6">for "{search || activeCategory}"</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="px-5 py-2 bg-violet-600/20 text-violet-400 text-xs font-bold rounded-full hover:bg-violet-600/30 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="relative overflow-hidden mx-4 sm:mx-6 mb-16 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-[#0f0a1a] to-[#0a0a0a] rounded-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative px-8 py-14 sm:py-16 text-center">
          <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-3">Still have questions?</p>
          <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Chat with us directly
          </h2>
          <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">
            Order via WhatsApp, ask about sizing, or check if something is back in stock.
          </p>
          <a
            href="https://wa.me/+260978917953?text=Hi! I'd like to order."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-black text-sm tracking-wide uppercase rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-green-600/25 hover:-translate-y-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
            </svg>
            Open WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
}