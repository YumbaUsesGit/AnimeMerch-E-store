import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080808] border-t border-white/5 mt-24 overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,0.08) 0%, transparent 70%)"
        }}
      />

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">

        {/* Top — brand + links */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-16">

          {/* Brand */}
          <div className="max-w-xs">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="w-8 h-8 bg-violet-600 rounded-sm flex items-center justify-center font-black text-white text-sm rotate-3 group-hover:rotate-6 transition-transform duration-300">
                M
              </div>
              <span className="font-black text-white tracking-tight text-lg">
                MITRAS<span className="text-violet-400">CLOTHING</span>
              </span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed mb-6">
              Premium Anime Merch delivered across Zambia. Real gear for real fans.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                aria-label="TikTok"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/+260978917953?text=Hi!%20I%20have%20a%20question%20about%20Mitras%20Clothing."
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.115.554 4.103 1.524 5.829L.057 23.57l5.888-1.542A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.84a9.84 9.84 0 01-5.031-1.38l-.361-.214-3.735.979.998-3.645-.235-.374A9.84 9.84 0 012.16 12C2.16 6.554 6.554 2.16 12 2.16S21.84 6.554 21.84 12 17.446 21.84 12 21.84z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links — only real ones */}
          <div className="flex flex-col sm:flex-row gap-10">
            <div>
              <h4 className="text-white text-[10px] font-black tracking-widest uppercase mb-4">Store</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-white/35 text-sm hover:text-violet-400 transition-colors duration-200">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-white/35 text-sm hover:text-violet-400 transition-colors duration-200">
                    My Cart
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-white/35 text-sm hover:text-violet-400 transition-colors duration-200">
                    Track My Order
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-[10px] font-black tracking-widest uppercase mb-4">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://wa.me/+260978917953?text=Hi! I have a question about Mitras Clothing."
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/35 text-sm hover:text-green-400 transition-colors duration-200 flex items-center gap-1.5"
                  >
                    WhatsApp Us
                  </a>
                </li>
                <li>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/35 text-sm hover:text-violet-400 transition-colors duration-200"
                  >
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider with big wordmark */}
        <div className="relative border-t border-white/5 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/15 text-xs">
              © {year} Mitras Clothing · Lusaka, Zambia
            </p>

            {/* Delivery badges */}
            <div className="flex items-center gap-3">
              {["Yango Delivery", "Airtel Money", "24–48hrs"].map((badge) => (
                <span
                  key={badge}
                  className="px-2.5 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/20 text-[10px] font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Big background wordmark */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center overflow-hidden pointer-events-none h-24 select-none">
        <p className="text-white/[0.025] font-black tracking-tighter leading-none"
          style={{ fontSize: "clamp(4rem, 15vw, 10rem)" }}>
          MITRAS
        </p>
      </div>

    </footer>
  );
}