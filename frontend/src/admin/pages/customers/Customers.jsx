import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, Mail, Phone, ShoppingCart, Trash2, Download } from 'lucide-react'
import { customersAPI } from '../../api/customers'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import * as XLSX from 'xlsx'

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

export default function Customers() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  useEffect(() => {
    customersAPI.getAll().then(data => setCustomers(data.users || data || MOCK)).catch(() => setCustomers(MOCK)).finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const s = search.toLowerCase()
    return !s || c.username?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)
  })

  const load = () => {
    setLoading(true)
    customersAPI.getAll().then(data => setCustomers(data.users || data || MOCK)).catch(() => setCustomers(MOCK)).finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('customers.deleteConfirm', "Rostdan ham bu foydalanuvchini o'chirmoqchimisiz?"))) return
    try {
      await apiClient.delete(`/auth/users/${id}`)
      toast.success(t('customers.deleted', "Foydalanuvchi o'chirildi"))
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || t('customers.deleteError', "O'chirishda xatolik yuz berdi"))
    }
  }

  const handleExportExcel = () => {
    const dataToExport = filtered.map(c => ({
      [t('customers.name', 'Ism')]: c.username,
      [t('customers.email', 'Email')]: c.email,
      [t('customers.phone', 'Telefon')]: c.phone || '',
      [t('customers.ordersCount', 'Buyurtmalar soni')]: c._count?.orders || 0,
      [t('customers.role', 'Rol')]: c.role,
      [t('customers.verified', 'Tasdiqlangan')]: c.isVerified ? t('common.yes', 'Ha') : t('common.no', 'Yo\'q'),
      [t('customers.registerDate', 'Ro\'yxatdan o\'tgan sana')]: new Date(c.createdAt).toLocaleDateString('uz-UZ')
    }))
    
    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, t('customers.title', 'Mijozlar'))
    XLSX.writeFile(wb, "mijozlar_royxati.xlsx")
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customers.title')}</h1>
          <p className="page-subtitle">{filtered.length} {t('customers.count', 'ta mijoz/menejer')}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            <Download size={16} /> {t('customers.exportExcel', 'Excel (.xlsx)')}
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="al-search" style={{ flex: 1 }}>
          <Search size={15} className="al-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('customers.searchPlaceholder', 'Ism yoki email...')} />
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
                  <th>{t('customers.customer', 'Mijoz')}</th>
                  <th>{t('customers.email', 'Email')}</th>
                  <th>{t('customers.phone', 'Telefon')}</th>
                  <th>{t('customers.orders', 'Buyurtmalar')}</th>
                  <th>{t('customers.role', 'Rol')}</th>
                  <th>{t('customers.verified', 'Tasdiqlangan')}</th>
                  <th>{t('common.date', 'Sana')}</th>
                  <th>{t('common.actions', 'Amallar')}</th>
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
                        {c.isVerified ? t('common.yes', 'Ha') : t('common.no', 'Yo\'q')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td>
                      {(user?.role === 'superadmin' || user?.role === 'manager') && (
                        <button 
                          className="btn btn-ghost btn-icon btn-sm" 
                          style={{ color: 'var(--clr-danger)' }} 
                          onClick={() => handleDelete(c.id)}
                          title={t('common.delete', 'O\'chirish')}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
