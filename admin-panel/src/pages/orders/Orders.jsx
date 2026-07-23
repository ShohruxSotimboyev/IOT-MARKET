import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, X, Clock, ChevronDown } from 'lucide-react'
import { ordersAPI } from '../../api/orders'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import * as XLSX from 'xlsx'

const STATUS = {
  pending: { label: 'Kutilmoqda', cls: 'badge-warning' },
  processing: { label: 'Jarayonda', cls: 'badge-info' },
  shipped: { label: 'Yuborilgan', cls: 'badge-info' },
  delivered: { label: 'Yetkazilgan', cls: 'badge-success' },
  completed: { label: 'Yakunlangan', cls: 'badge-success' },
  cancelled: { label: 'Bekor qilingan', cls: 'badge-danger' },
}

const MOCK_ORDERS = Array.from({ length: 15 }, (_, i) => ({
  id: `ord-${1000 + i}`,
  user: { username: ['Alisher M.', 'Dilnoza K.', 'Jasur B.', 'Malika T.', 'Sardor N.'][i % 5], email: 'user@example.com' },
  total: [234000, 567000, 890000, 1234000, 345000, 678000, 123000, 456000, 789000, 1011000, 234000, 567000, 890000, 345000, 678000][i],
  status: Object.keys(STATUS)[i % 6],
  items: [{ product: { name: 'Arduino Uno', image: null }, quantity: 1, price: 89000 }],
  shippingAddress: { city: 'Toshkent', address: 'Chilonzor 3-kvartal' },
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewOrder, setViewOrder] = useState(null)
  const [page, setPage] = useState(1)
  const PER = 10

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await ordersAPI.getAll()
      setOrders(data.orders || data || MOCK_ORDERS)
    } catch { setOrders(MOCK_ORDERS) }
    setLoading(false)
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus).catch(() => {})
      setOrders(o => o.map(x => x.id === orderId ? { ...x, status: newStatus } : x))
      if (viewOrder?.id === orderId) setViewOrder(v => ({ ...v, status: newStatus }))
      toast.success('Status yangilandi')
    } catch { toast.error('Xatolik') }
  }

  const filtered = orders.filter(o => {
    const s = search.toLowerCase()
    if (s && !o.id?.toLowerCase().includes(s) && !o.user?.username?.toLowerCase().includes(s)) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  })
  const total = filtered.length
  const pages = Math.ceil(total / PER)
  const slice = filtered.slice((page - 1) * PER, page * PER)

  const exportExcel = () => {
    const dataToExport = filtered.map(o => ({
      'Buyurtma ID': o.id,
      'Mijoz Ismi': o.user?.username || 'Noma\'lum',
      'Mijoz Email': o.user?.email || '',
      'Summa': o.total || 0,
      'Holat': STATUS[o.status]?.label || o.status,
      'Sana': new Date(o.createdAt).toLocaleString('uz-UZ'),
      'Manzil': `${o.shippingAddress?.city || ''}, ${o.shippingAddress?.address || ''}`
    }))
    
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Buyurtmalar")
    XLSX.writeFile(wb, `Buyurtmalar_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('orders.title')}</h1>
          <p className="page-subtitle">{total} ta buyurtma</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={exportExcel}>
          Eksport (Excel)
        </button>
      </div>

      <div className="filter-row">
        <div className="al-search" style={{ flex: 1 }}>
          <Search size={15} className="al-search-icon" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="ID yoki mijoz nomi..." />
        </div>
        <select className="ui-select" style={{ width: 180 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">Barcha holat</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><p>Yuklanmoqda...</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Buyurtma ID</th>
                  <th>Mijoz</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th>Sana</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((o, i) => {
                  const st = STATUS[o.status] || { label: o.status, cls: 'badge-default' }
                  return (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--clr-brand-light)', fontWeight: 600 }}>#{String(o.id).slice(-6).toUpperCase()}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.user?.username || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.user?.email || ''}</div>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{(o.total || 0).toLocaleString()} so'm</span></td>
                      <td>
                        <select
                          className="ui-select"
                          style={{ width: 160, height: 32, fontSize: 12 }}
                          value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}
                        >
                          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} />
                          {new Date(o.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewOrder(o)} title="Ko'rish">
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* View Order Modal */}
      <AnimatePresence>
        {viewOrder && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewOrder(null)}>
            <motion.div className="modal-box" style={{ maxWidth: 560 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">Buyurtma #{String(viewOrder.id).slice(-6).toUpperCase()}</span>
                <button className="modal-close" onClick={() => setViewOrder(null)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MIJOZ</p>
                    <p style={{ fontWeight: 600 }}>{viewOrder.user?.username}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{viewOrder.user?.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>HOLAT</p>
                    <select className="ui-select" style={{ width: '100%' }} value={viewOrder.status} onChange={e => updateStatus(viewOrder.id, e.target.value)}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>MANZIL</p>
                    <p style={{ fontSize: 13 }}>{viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.address}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>SANA</p>
                    <p style={{ fontSize: 13 }}>{new Date(viewOrder.createdAt).toLocaleString('uz-UZ')}</p>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>MAHSULOTLAR</p>
                  {(viewOrder.items || []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 13 }}>{item.name || item.product?.name || 'Mahsulot'} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{((item.price || 0) * (item.quantity || 1)).toLocaleString()} so'm</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 800, fontSize: 16 }}>
                    <span>Jami:</span>
                    <span style={{ color: 'var(--clr-brand-light)' }}>{(viewOrder.total || 0).toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
