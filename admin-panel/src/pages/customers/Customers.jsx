import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Mail, Phone, ShoppingCart, Plus, X } from 'lucide-react'
import { customersAPI } from '../../api/customers'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'

const MOCK = Array.from({ length: 12 }, (_, i) => ({
  id: String(i+1),
  username: ['Alisher Mirzaev', 'Dilnoza Karimova', 'Jasur Botirov', 'Malika Toshmatova', 'Sardor Nazarov', 'Zulfiya Holmatova', 'Bobur Yusupov', 'Nargiza Abdullayeva', 'Sherzod Ruziyev', 'Feruza Qodirov', 'Ulugbek Mamatov', 'Dilorom Xasanova'][i],
  email: `user${i+1}@example.com`,
  phone: `+99890${String(1234567 + i).slice(0,7)}`,
  role: i === 0 ? 'admin' : 'user',
  isVerified: i % 3 !== 2,
  loginCount: Math.floor(Math.random() * 50),
  createdAt: new Date(Date.now() - i * 5 * 86400000).toISOString(),
  _count: { orders: Math.floor(Math.random() * 20) },
}))

function ManagerModal({ onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiClient.post('/auth/add-manager', form)
      if (res.data.success) {
        toast.success("Menejer muvaffaqiyatli qo'shildi!")
        onSave(res.data.data)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 400 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Yangi Menejer Qo'shish</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="ui-input-wrap">
              <label className="ui-label">Ismi</label>
              <input required className="ui-input" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Ism familiya" />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">Email</label>
              <input required type="email" className="ui-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">Telefon</label>
              <input required className="ui-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+998901234567" />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">Parol</label>
              <input required type="password" className="ui-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Kamida 8 belgi" minLength={8} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Qo\'shilmoqda...' : 'Qo\'shish'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function Customers() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showManagerModal, setShowManagerModal] = useState(false)

  useEffect(() => {
    customersAPI.getAll().then(data => setCustomers(data.users || data || MOCK)).catch(() => setCustomers(MOCK)).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const s = search.toLowerCase()
    return !s || c.username?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customers.title')}</h1>
          <p className="page-subtitle">{filtered.length} ta mijoz/menejer</p>
        </div>
        {user?.role === 'superadmin' && (
          <button className="btn btn-primary" onClick={() => setShowManagerModal(true)}>
            <Plus size={16} /> Yangi Menejer
          </button>
        )}
      </div>

      <div className="filter-row">
        <div className="al-search" style={{ flex: 1 }}>
          <Search size={15} className="al-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki email..." />
        </div>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Users size={40} /><p>{t('common.loading')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Buyurtmalar</th>
                  <th>Rol</th>
                  <th>Tasdiqlangan</th>
                  <th>Ro'yxatdan o'tgan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="al-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                          {(c.username?.[0] || 'U').toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{c.username}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Mail size={12} />{c.email}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <Phone size={12} />{c.phone || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShoppingCart size={13} style={{ color: 'var(--clr-brand)' }} />
                        <strong>{c._count?.orders || 0}</strong>
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.role === 'admin' ? 'badge-info' : 'badge-default'}`}>
                        {c.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.isVerified ? 'badge-success' : 'badge-warning'}`}>
                        <span className="badge-dot" />
                        {c.isVerified ? 'Ha' : 'Yo\'q'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showManagerModal && (
          <ManagerModal 
            onClose={() => setShowManagerModal(false)}
            onSave={(newManager) => {
              setCustomers([newManager, ...customers])
              setShowManagerModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
