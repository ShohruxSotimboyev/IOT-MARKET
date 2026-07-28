import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, X, Package } from 'lucide-react'
import { categoriesAPI } from '../../api/categories'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

function CategoryModal({ category, onClose, onSave }) {
  const { t } = useTranslation()

  const [form, setForm] = useState(category || { name: '', status: 'active' })

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error(t('categories.nameRequired'))
    try {
      let saved
      if (category?.id) {
        saved = await categoriesAPI.update(category.id, form)
      } else {
        saved = await categoriesAPI.create(form)
      }
      toast.success(category ? t('categories.updated') : t('categories.added'))
      onSave(saved)
    } catch (e) {
      toast.error(e.message || t('common.errorOccurred'))
    }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 400 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{category ? t('categories.editTitle') : t('categories.addTitle')}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="ui-input-wrap">
              <label className="ui-label">{t('categories.nameLabel')}</label>
              <input className="ui-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('categories.namePlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('common.status')}</label>
              <select className="ui-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{t('common.save')}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Categories() {
  const { t } = useTranslation()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'add' | category
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data)
    } catch {
      toast.error(t('categories.loadError'))
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoriesAPI.delete(deleteTarget.id)
      setCategories(prev => prev.filter(x => x.id !== deleteTarget.id))
      toast.success(t('categories.deleted'))
    } catch (e) {
      toast.error(e.message || t('common.error'))
    }
    setDeleteTarget(null)
  }

  const handleSave = (saved) => {
    if (modal?.id) {
      setCategories(prev => prev.map(x => x.id === saved.id ? saved : x))
    } else {
      setCategories(prev => [...prev, saved])
    }
    setModal(null)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('categories.title')}</h1>
          <p className="page-subtitle">{categories.length} {t('categories.count')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Package size={40} /><p>{t('common.loading')}</p></div>
        ) : categories.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>{t('categories.notFound', 'Kategoriyalar topilmadi')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('common.name')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.date', 'Sana')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td><div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div></td>
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                        <span className="badge-dot" />{c.status === 'active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(c)} title={t('common.edit')}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(c)} title={t('common.delete')}>
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
          <CategoryModal
            category={modal === 'add' ? null : modal}
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
                <span className="modal-title" style={{ color: 'var(--clr-danger)' }}>{t('categories.deleteTitle', 'Kategoriyani o\'chirish')}</span>
                <button className="modal-close" onClick={() => setDeleteTarget(null)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong> {t('categories.deleteConfirm')}
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>{t('common.cancel')}</button>
                <button className="btn btn-danger" onClick={handleDelete}>{t('common.delete')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
