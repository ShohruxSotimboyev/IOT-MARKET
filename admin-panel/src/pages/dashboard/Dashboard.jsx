import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import {
  Package, ShoppingCart, Users, DollarSign,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Clock, Plus, Eye, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { ordersAPI } from '../../api/orders'
import { productsAPI } from '../../api/products'
import { customersAPI } from '../../api/customers'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

const salesData = [
  { name: 'Yan', value: 4200, orders: 32 },
  { name: 'Fev', value: 5800, orders: 45 },
  { name: 'Mar', value: 3900, orders: 28 },
  { name: 'Apr', value: 7200, orders: 61 },
  { name: 'May', value: 6100, orders: 52 },
  { name: 'Iyn', value: 8900, orders: 74 },
]

const STATUS_MAP = {
  completed: { label: 'Yakunlangan', cls: 'badge-success' },
  pending: { label: 'Kutilmoqda', cls: 'badge-warning' },
  processing: { label: 'Jarayonda', cls: 'badge-info' },
  cancelled: { label: 'Bekor qilingan', cls: 'badge-danger' },
  delivered: { label: 'Yetkazilgan', cls: 'badge-success' },
  shipped: { label: 'Yuborilgan', cls: 'badge-info' },
}

function StatCard({ label, value, change, trend, icon: Icon, color, delay }) {
  return (
    <motion.div
      className={`stat-box ${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="stat-icon-wrap">
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${trend}`}>
          {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {change}
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, chartData: [] })
  const [loading, setLoading] = useState(true)

  const isSuperadmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const canViewRevenue = isSuperadmin

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, ordersData] = await Promise.allSettled([
        ordersAPI.getAdminStats(),
        ordersAPI.getAll({ limit: 5 }),
      ])

      if (statsData.status === 'fulfilled' && statsData.value) {
        const d = statsData.value
        setStats({
          orders: d.totalOrders || 0,
          revenue: d.totalRevenue || 0,
          customers: d.totalCustomers || 0,
          products: d.totalProducts || 0,
          chartData: d.chartData || []
        })
      }

      if (ordersData.status === 'fulfilled' && ordersData.value) {
        const od = ordersData.value
        setOrders(od.orders?.slice(0, 5) || od.slice?.(0, 5) || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: t('dashboard.totalProducts'), value: stats.products, change: '', trend: 'up', icon: Package, color: 'blue', delay: 0 },
    { label: t('dashboard.totalOrders'), value: stats.orders, change: '', trend: 'up', icon: ShoppingCart, color: 'green', delay: 0.05 },
    { label: t('dashboard.totalCustomers'), value: stats.customers, change: '', trend: 'up', icon: Users, color: 'purple', delay: 0.1 },
    ...(isSuperadmin ? [
      { label: t('dashboard.totalRevenue'), value: `${stats.revenue.toLocaleString()} so'm`, change: '', trend: 'up', icon: DollarSign, color: 'orange', delay: 0.15 }
    ] : [])
  ]

  const displayOrders = orders

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/products')}>
            <Package size={14} /> {t('dashboard.newProduct')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders')}>
            <ShoppingCart size={14} /> {t('dashboard.viewOrders')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 24 }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts row */}
      {canViewRevenue ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Area chart */}
          <motion.div className="ui-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="ui-card-header">
              <span className="ui-card-title">{t('dashboard.salesDynamics')}</span>
              <span className="badge badge-success"><span className="badge-dot" />{t('dashboard.active')}</span>
            </div>
            <div style={{ padding: '20px 20px 10px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.chartData?.length ? stats.chartData : salesData}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                    formatter={(v) => [`${v.toLocaleString()} ${t('common.currency', "so'm")}`, t('dashboard.totalRevenue')]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad1)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar chart */}
          <motion.div className="ui-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="ui-card-header">
              <span className="ui-card-title">Buyurtmalar</span>
            </div>
            <div style={{ padding: '20px 20px 10px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.chartData?.length ? stats.chartData : salesData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                  />
                  <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginBottom: 14 }}>
          {/* Bar chart only for managers */}
          <motion.div className="ui-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="ui-card-header">
              <span className="ui-card-title">{t('dashboard.orderStatistics')}</span>
            </div>
            <div style={{ padding: '20px 20px 10px' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.chartData?.length ? stats.chartData : salesData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }}
                  />
                  <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent orders */}
      <motion.div className="ui-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="ui-card-header">
              <span className="ui-card-title">{t('dashboard.recentOrders')}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/orders')} style={{ gap: 4 }}>
                {t('dashboard.viewAll')} <ChevronRight size={14} />
              </button>
            </div>
            <div className="ui-table-wrap">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>{t('dashboard.id')}</th>
                    <th>{t('dashboard.customer')}</th>
                    <th>{t('dashboard.amount')}</th>
                    <th>{t('dashboard.holat')}</th>
                    <th>{t('common.date')}</th>
              </tr>
            </thead>
            <tbody>
              {displayOrders.map((order, i) => {
                const st = STATUS_MAP[order.status] || { label: order.status, cls: 'badge-default' }
                return (
                  <motion.tr key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}>
                    <td><span style={{ fontFamily: 'var(--mono, monospace)', fontSize: 12, color: 'var(--text-secondary)' }}>#{String(order.id).slice(-6)}</span></td>
                    <td style={{ fontWeight: 600 }}>{order.user?.username || order.customer || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{(order.total || 0).toLocaleString()} {t('common.currency', "so'm")}</td>
                    <td><span className={`badge ${st.cls}`}><span className="badge-dot" />{st.label}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
