import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, X, Truck } from 'lucide-react'
import { suppliersAPI } from '../../api/suppliers'
import toast from 'react-hot-toast'

function SupplierModal({ supplier, onClose, onSave }) {
  const { t } = useTranslation()

  const [form, setForm] = useState(supplier || { name: '', contact: '', phone: '', address: '', status: 'active' })

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Kompaniya nomi kiritilishi shart')
    try {
      let saved
      if (supplier?.id) {
        saved = await suppliersAPI.update(supplier.id, form)
      } else {
        saved = await suppliersAPI.create(form)
      }
      toast.success(supplier ? t('suppliers.updated') : t('suppliers.added'))
      onSave(saved)
    } catch (e) {
      toast.error(e.message || 'Xatolik yuz berdi')
    }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 500 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{supplier ? t('suppliers.editTitle') : t('suppliers.addTitle')}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="ui-input-wrap">
              <label className="ui-label">{t('suppliers.nameLabel')}</label>
              <input className="ui-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('suppliers.namePlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">Bog'lanish uchun shaxs</label>
              <input className="ui-input" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder={t('suppliers.contactPlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('common.phone')}</label>
              <input className="ui-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('common.address')}</label>
              <input className="ui-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('suppliers.addressPlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">Holat</label>
              <select className="ui-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Bekor qilish</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Saqlash</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Suppliers() {
  const { t } = useTranslation()

  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await suppliersAPI.getAll()
      setSuppliers(data)
    } catch {
      toast.error(t('suppliers.loadError'))
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await suppliersAPI.delete(deleteTarget.id)
      setSuppliers(prev => prev.filter(x => x.id !== deleteTarget.id))
      toast.success(t('suppliers.deleted'))
    } catch (e) {
      toast.error(e.message || 'Xatolik')
    }
    setDeleteTarget(null)
  }

  const handleSave = (saved) => {
    if (modal?.id) {
      setSuppliers(prev => prev.map(x => x.id === saved.id ? saved : x))
    } else {
      setSuppliers(prev => [saved, ...prev])
    }
    setModal(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('suppliers.title')}</h1>
          <p className="page-subtitle">{suppliers.length} {t('suppliers.partnersCount')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Truck size={40} /><p>Yuklanmoqda...</p></div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state"><Truck size={40} /><p>{t('suppliers.title')} topilmadi</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('suppliers.companyName')}</th>
                  <th>{t('suppliers.contact')}</th>
                  <th>{t('common.phone')}</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td><div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.contact || '-'}</span></td>
                    <td><span style={{ fontSize: 13 }}>{s.phone || '-'}</span></td>
                    <td>
                      <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                        <span className="badge-dot" />{s.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(s)} title="Tahrirlash">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(s)} title="O'chirish">
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
        {modal && (
          <SupplierModal
            supplier={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: 400 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title" style={{ color: 'var(--clr-danger)' }}>Postavshikni o'chirish</span>
                <button className="modal-close" onClick={() => setDeleteTarget(null)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong> ni o'chirmoqchimisiz? Agar bu postavshikka tegishli mahsulotlar bo'lsa, o'chirish bekor qilinadi.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Bekor qilish</button>
                <button className="btn btn-danger" onClick={handleDelete}>O'chirish</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
