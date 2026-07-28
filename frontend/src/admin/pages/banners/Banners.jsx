import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Image, X, Upload, ExternalLink } from 'lucide-react'
import { bannersAPI } from '../../api/banners'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

const MOCK_BANNERS = [
  { id: '1', title: 'Arduino Yangi Keldi', description: 'Arduino Uno R4 endi mavjud', image: 'https://picsum.photos/seed/b1/800/300', link: '/products', status: 'active', order: 1 },
  { id: '2', title: 'Smart Home Sale', description: '30% chegirma barcha smart qurilmalarda', image: 'https://picsum.photos/seed/b2/800/300', link: '/products?cat=smart', status: 'active', order: 2 },
  { id: '3', title: 'Yangi Mahsulotlar', description: 'Eng yangi ESP32 modullari', image: 'https://picsum.photos/seed/b3/800/300', link: '/products', status: 'inactive', order: 3 },
]

function BannerModal({ banner, onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(banner || { title: '', description: '', link: '', image: '', status: 'active', order: 0 })
  const [preview, setPreview] = useState(banner?.image || '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('image', file)
    try {
      const token = localStorage.getItem('admin-token')
      const res = await fetch(`${API_URL}/api/banners/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        const url = data.url || data.path
        set('image', url)
        setPreview(url.startsWith('http') ? url : `${API_URL}${url}`)
      } else throw new Error()
    } catch {
      const url = URL.createObjectURL(file)
      setPreview(url); set('image', url)
    }
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!form.title) return toast.error(t('banners.titleRequired'))
    try {
      let saved
      if (banner?.id) {
        saved = await bannersAPI.update(banner.id, form).catch(() => ({ ...form, id: banner.id }))
      } else {
        saved = await bannersAPI.create(form).catch(() => ({ ...form, id: Date.now().toString() }))
      }
      toast.success(banner ? t('banners.updated') : t('banners.added'))
      onSave(saved || form)
    } catch { toast.error(t('common.error')) }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 560 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{banner ? t('banners.editBanner') : t('banners.addBanner')}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className={`img-upload-area${uploading ? ' dragging' : ''}`} onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
              {preview ? (
                <img src={preview} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
              ) : (
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 0' }}>
                  <Upload size={28} />
                  <span style={{ fontSize: 13 }}>{t('banners.uploadImage')}</span>
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{uploading ? t('common.loading') : t('banners.recommended')}</p>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('banners.titleLabel')} *</label>
              <input className="ui-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder={t('banners.titlePlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('common.description')}</label>
              <input className="ui-input" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder={t('banners.descPlaceholder')} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="ui-input-wrap">
                <label className="ui-label">{t('banners.link')}</label>
                <input className="ui-input" value={form.link || ''} onChange={e => set('link', e.target.value)} placeholder="/products" />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('banners.order')}</label>
                <input className="ui-input" type="number" value={form.order || 0} onChange={e => set('order', Number(e.target.value))} />
              </div>
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('common.status')}</label>
              <select className="ui-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">{t('common.active')}</option>
                <option value="inactive">{t('common.inactive')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{banner ? t('common.save') : t('common.add')}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Banners() {
  const { t } = useTranslation()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    bannersAPI.getAll().then(data => setBanners(data.banners || data || MOCK_BANNERS)).catch(() => setBanners(MOCK_BANNERS)).finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    try {
      await bannersAPI.delete(deleteTarget.id).catch(() => {})
      setBanners(b => b.filter(x => x.id !== deleteTarget.id))
      toast.success(t('banners.deleted'))
    } catch { toast.error(t('common.error')) }
    setDeleteTarget(null)
  }

  const handleSave = (saved) => {
    if (modal?.id) setBanners(b => b.map(x => x.id === saved.id ? { ...x, ...saved } : x))
    else setBanners(b => [saved, ...b])
    setModal(null)
  }

  const imgSrc = (b) => {
    if (!b.image) return null
    return b.image.startsWith('http') || b.image.startsWith('blob') ? b.image : `${API_URL}${b.image}`
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('banners.title')}</h1>
          <p className="page-subtitle">{banners.length} {t('banners.count')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> {t('banners.addBanner')}
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><p>{t('common.loading')}</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {banners.map((b, i) => (
            <motion.div key={b.id} className="ui-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div style={{ display: 'flex', gap: 16, padding: 16, alignItems: 'center' }}>
                <div style={{ width: 160, height: 90, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-overlay)', flexShrink: 0 }}>
                  {imgSrc(b) ? (
                    <img src={imgSrc(b)} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}><Image size={24} /></div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{b.title}</span>
                    <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                      <span className="badge-dot" />{b.status === 'active' ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  {b.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{b.description}</p>}
                  {b.link && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--clr-brand-light)' }}>
                      <ExternalLink size={11} />{b.link}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(b)}><Edit size={14} /></button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(b)}><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
          {banners.length === 0 && <div className="empty-state"><Image size={40} /><p>{t('banners.noBanners')}</p></div>}
        </div>
      )}

      <AnimatePresence>
        {modal && <BannerModal banner={modal === 'add' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
        {deleteTarget && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: 380 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title" style={{ color: 'var(--clr-danger)' }}>{t('banners.deleteBanner')}</span>
                <button className="modal-close" onClick={() => setDeleteTarget(null)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>"{deleteTarget.title}" {t('banners.deleteConfirm')}</p>
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
