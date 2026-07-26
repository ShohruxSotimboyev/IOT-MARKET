import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, X, Shield, Lock } from 'lucide-react'
import client from '../../api/client'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const getPermissions = (t) => [
  { id: 'orders', label: t('managers.ordersPerm', 'Buyurtmalar (Orders)') },
  { id: 'inventory', label: t('managers.inventoryPerm', 'Ombor (Inventory)') },
  { id: 'products', label: t('managers.productsPerm', 'Mahsulotlar (Products, Categories, Suppliers)') },
  { id: 'reviews', label: t('managers.reviewsPerm', 'Sharhlar (Reviews)') },
  { id: 'customers', label: t('managers.customersPerm', 'Mijozlar (Customers)') },
  { id: 'messages', label: t('managers.messagesPerm', 'Xabarlar (Messages)') },
  { id: 'banners', label: t('managers.bannersPerm', 'Bannerlar (Banners)') }
]

export default function Managers() {
  const { t } = useTranslation()
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', permissions: []
  })

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/users/managers')
      setManagers(res.data)
    } catch {
      toast.error(t('managers.loadError', "Ma'lumotlarni yuklashda xatolik"))
    }
    setLoading(false)
  }

  const handleOpen = (m = null) => {
    if (m) {
      setEditData(m)
      setFormData({ username: m.username, email: m.email, password: '', permissions: m.permissions || [] })
    } else {
      setEditData(null)
      setFormData({ username: '', email: '', password: '', permissions: [] })
    }
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editData) {
        await client.put(`/users/managers/${editData.id}`, formData)
        toast.success(t('managers.updated', "Menejer yangilandi"))
      } else {
        if (!formData.password) return toast.error(t('managers.passwordRequired', "Parol kiritish majburiy"))
        await client.post('/users/managers', formData)
        toast.success(t('managers.added', "Menejer qo'shildi"))
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', "Xatolik yuz berdi"))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.deleteConfirm', "Rostdan ham o'chirmoqchimisiz?"))) return
    try {
      await client.delete(`/users/managers/${id}`)
      toast.success(t('managers.deleted', "O'chirildi"))
      load()
    } catch {
      toast.error(t('managers.deleteError', "O'chirishda xatolik"))
    }
  }

  const togglePerm = (id) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id) 
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }))
  }

  const filtered = managers.filter(m => 
    m.username.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('managers.title', 'Menejerlar')}</h1>
          <p className="page-subtitle">{t('managers.subtitle', 'Tizim ishchilarini boshqarish')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpen()}>
          <Plus size={16} /> {t('managers.addManager', 'Yangi menejer qo\'shish')}
        </button>
      </div>

      <div className="filter-row">
        <div className="al-search" style={{ flex: 1 }}>
          <Search size={15} className="al-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('managers.searchPlaceholder', 'Ism yoki email orqali qidirish...')} />
        </div>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><p>{t('common.loading', 'Yuklanmoqda...')}</p></div>
        ) : filtered.length === 0 ? (
           <div className="empty-state"><p>{t('managers.notFound', 'Menejerlar topilmadi.')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('managers.user', 'Foydalanuvchi')}</th>
                  <th>{t('managers.permissionsCount', 'Ruxsatlar soni')}</th>
                  <th>{t('common.date', 'Sana')}</th>
                  <th>{t('common.actions', 'Amallar')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                    </td>
                    <td><span className="badge badge-info">{(m.permissions || []).length} {t('managers.permissions', 'ruxsat')}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleOpen(m)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--clr-danger)' }} onClick={() => handleDelete(m.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box" style={{ maxWidth: 500 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div className="modal-header">
                <span className="modal-title">{editData ? t('managers.editTitle', 'Menejerni tahrirlash') : t('managers.addTitle', 'Yangi menejer qo\'shish')}</span>
                <button className="modal-close" type="button" onClick={() => setModalOpen(false)}><X size={16} /></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body space-y-4">
                  <div>
                    <label className="ui-label">{t('managers.name', 'Ism')}</label>
                    <input className="ui-input" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div>
                    <label className="ui-label">{t('managers.email', 'Email (Login)')}</label>
                    <input className="ui-input" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="ui-label">{editData ? t('managers.newPassword', 'Yangi parol (ixtiyoriy)') : t('managers.password', 'Parol')}</label>
                    <div className="relative">
                      <Lock size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                      <input className="ui-input" style={{ paddingLeft: 36 }} type="password" required={!editData} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 20 }}>
                    <label className="ui-label flex items-center gap-2">
                      <Shield size={16} className="text-primary" /> {t('managers.permissions', 'Ruxsatlar')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                      {getPermissions(t).map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8 }}>
                          <input type="checkbox" checked={formData.permissions.includes(p.id)} onChange={() => togglePerm(p.id)} />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>{t('common.cancel', 'Bekor qilish')}</button>
                  <button type="submit" className="btn btn-primary">{editData ? t('common.save', 'Saqlash') : t('common.add', 'Qo\'shish')}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
