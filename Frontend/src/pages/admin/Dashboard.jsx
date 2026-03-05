import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useDashboardData } from '../../hooks/useAdminData'

export default function AdminDashboard() {
  const { stats, recentOrders, topProducts, loading, error } = useDashboardData()

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="bg-[#141414] rounded-2xl h-28"/>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#141414] rounded-2xl h-80"/>
            <div className="bg-[#141414] rounded-2xl h-80"/>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-red-400 text-sm">
            Error loading dashboard: {error}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-violet-400 text-[11px] font-black tracking-widest uppercase mb-1">Overview</p>
          <h1 className="text-white font-black text-2xl tracking-tight">Dashboard</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Revenue" value={`ZMK ${stats.totalRevenue.toLocaleString()}`} color="violet"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          />
          <StatCard title="This Month" value={`ZMK ${stats.monthlyRevenue.toLocaleString()}`} color="blue"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <StatCard title="Pending Orders" value={stats.pendingOrders} color="amber"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard title="Products" value={stats.totalProducts} color="emerald"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent Orders */}
          <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-black text-sm tracking-tight">Recent Orders</h3>
              <Link to="/admin/orders" className="text-violet-400 text-xs font-bold hover:text-violet-300 transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentOrders.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-10">No orders yet</p>
              ) : recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-white/60 text-xs font-mono mb-0.5">#{order.reference || order.id.slice(0,8).toUpperCase()}</p>
                    <p className="text-white text-sm font-semibold">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-black mb-1">ZMK {order.total_price.toLocaleString()}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-black text-sm tracking-tight">Top Products</h3>
              <Link to="/admin/products" className="text-violet-400 text-xs font-bold hover:text-violet-300 transition-colors">Manage →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {topProducts.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-10">No sales data yet</p>
              ) : topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-black shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{product.name}</p>
                    <p className="text-white/30 text-xs">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white text-sm font-black">ZMK {product.revenue?.toLocaleString() || 0}</p>
                    <p className="text-white/30 text-xs">{product.units_sold || 0} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ title, value, icon, color }) {
  const cfg = {
    violet: { bg: 'bg-violet-600/10', text: 'text-violet-400', border: 'border-violet-500/10' },
    blue:   { bg: 'bg-blue-600/10',   text: 'text-blue-400',   border: 'border-blue-500/10' },
    amber:  { bg: 'bg-amber-600/10',  text: 'text-amber-400',  border: 'border-amber-500/10' },
    emerald:{ bg: 'bg-emerald-600/10',text: 'text-emerald-400',border: 'border-emerald-500/10' },
  }[color]

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/5 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {icon}
        </div>
      </div>
      <p className="text-white/40 text-xs tracking-wide mb-1">{title}</p>
      <p className="text-white font-black text-2xl tracking-tight">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    pending:   'bg-amber-500/15 text-amber-400 border-amber-500/20',
    confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    shipped:   'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    delivered: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${cfg[status] || 'bg-white/5 text-white/30 border-white/10'}`}>
      {status}
    </span>
  )
}