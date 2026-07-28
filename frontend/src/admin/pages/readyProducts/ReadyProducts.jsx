import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Package, X, Upload } from 'lucide-react'
import { readyProductsAPI } from '../../api/readyProducts'
import { categoriesAPI } from '../../api/categories'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

function ProductModal({ product, categories = [], onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(product ? { ...product } : {
    name: '', description: '', price: '', oldPrice: '', image: '',
    categoryId: '', status: 'active', inStock: true, stockCount: 0,
    rating: 0, reviews: 0, features: [],
  })
  const [featureInput, setFeatureInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = async (files) => {
    if (!files || files.length === 0) return
    const file = files[0]
    setUploading(true)
    try {
      const data = await readyProductsAPI.uploadImage(file)
      const url = data.url || data.path || data.image
      set('image', url)
    } catch {
      const url = URL.createObjectURL(file)
      set('image', url)
    }
    setUploading(false)
  }

  const removeImage = () => {
    set('image', '')
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      set('features', [...(form.features || []), featureInput.trim()])
      setFeatureInput('')
    }
  }
  const removeFeature = (idx) => {
    set('features', form.features.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return toast.error(t('readyProducts.nameRequired'))
    setSubmitting(true)
    try {
      if (product) {
        await readyProductsAPI.update(product.id, form)
        toast.success(t('readyProducts.updated'))
      } else {
        await readyProductsAPI.create(form)
        toast.success(t('readyProducts.created'))
      }
      onSave()
    } catch (e) {
      toast.error(e.response?.data?.message || t('readyProducts.loadError'))
    }
    setSubmitting(false)
  }

  const imgPreview = form.image
    ? (form.image.startsWith('http') ? form.image : `${API_URL}${form.image}`)
    : ''

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 560 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{product ? t('readyProducts.edit') : t('readyProducts.add')}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div>
              <div
                className={`img-upload-area${uploading ? ' dragging' : ''}`}
                style={{ padding: '20px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files) }}
              >
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Upload size={28} />
                  <span style={{ fontSize: 13 }}>{t('readyProducts.uploadImage')}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{uploading ? t('common.loading') : t('readyProducts.imageHint')}</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files)} />
              </div>
              {imgPreview && (
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', marginTop: '10px' }}>
                  <img src={imgPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('readyProducts.name')} *</label>
              <input className="ui-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('readyProducts.namePlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('readyProducts.category')}</label>
              <select className="ui-select" value={form.categoryId || ''} onChange={e => set('categoryId', e.target.value)}>
                <option value="">{t('readyProducts.selectCategory')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-grid form-grid-2">
              <div className="ui-input-wrap">
                <label className="ui-label">{t('readyProducts.price')} *</label>
                <input type="number" className="ui-input" value={form.price} onChange={e => set('price', e.target.value)} placeholder="89000" />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('readyProducts.oldPrice')}</label>
                <input type="number" className="ui-input" value={form.oldPrice || ''} onChange={e => set('oldPrice', e.target.value)} placeholder="120000" />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="ui-input-wrap">
                <label className="ui-label">{t('readyProducts.stockCount')}</label>
                <input type="number" className="ui-input" value={form.stockCount || 0} onChange={e => set('stockCount', parseInt(e.target.value) || 0)} />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('readyProducts.status')}</label>
                <select className="ui-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">{t('readyProducts.active')}</option>
                  <option value="inactive">{t('readyProducts.inactive')}</option>
                </select>
              </div>
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('readyProducts.description')}</label>
              <textarea className="ui-input" rows={3} value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder={t('readyProducts.descriptionPlaceholder')} />
            </div>
            <div className="ui-input-wrap">
              <label className="ui-label">{t('readyProducts.features')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="ui-input" value={featureInput} onChange={e => setFeatureInput(e.target.value)} placeholder={t('readyProducts.addFeature')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                <button className="btn btn-secondary" type="button" onClick={addFeature}>+</button>
              </div>
              {form.features?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {form.features.map((f, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: 'var(--bg-tag, #f1f5f9)', fontSize: 12 }}>
                      {f}
                      <button onClick={() => removeFeature(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clr-danger)', padding: 0, lineHeight: 1 }}>&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{t('common.save')}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ReadyProducts() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadItems(); loadCategories() }, [page, search])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await readyProductsAPI.getAll({ page, limit: 20, search })
      setItems(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch { toast.error(t('readyProducts.loadError')) }
    setLoading(false)
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(Array.isArray(data) ? data : data.data || [])
    } catch {}
  }

  const handleDelete = async (id) => {
    if (!confirm(t('readyProducts.deleteConfirm'))) return
    try {
      await readyProductsAPI.delete(id)
      toast.success(t('readyProducts.delete'))
      loadItems()
    } catch (e) {
      toast.error(e.response?.data?.message || t('readyProducts.loadError'))
    }
  }

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === 'active' ? 'inactive' : 'active'
    try {
      await readyProductsAPI.updateStatus(item.id, newStatus)
      loadItems()
    } catch {
      toast.error(t('readyProducts.loadError'))
    }
  }

  const openCreate = () => { setEditItem(null); setModalOpen(true) }
  const openEdit = (item) => { setEditItem(item); setModalOpen(true) }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('readyProducts.title')}</h1>
          <p className="page-subtitle">{t('readyProducts.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="ui-input-wrap" style={{ margin: 0, position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="ui-input" placeholder={t('readyProducts.search')} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px', height: '40px' }} />
          </div>
          <button className="btn btn-primary" onClick={openCreate} style={{ height: '40px' }}>
            <Plus size={16} /> {t('readyProducts.add')}
          </button>
        </div>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Package size={40} /><p>{t('common.loading')}</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>{t('readyProducts.noProducts')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('readyProducts.product')}</th>
                  <th>{t('readyProducts.category')}</th>
                  <th>{t('readyProducts.price')}</th>
                  <th>{t('readyProducts.stockCount')}</th>
                  <th>{t('readyProducts.status')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.image || 'https://picsum.photos/seed/default/80/80'} alt="" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.features?.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 13 }}>{item.category?.name || '-'}</span></td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 700 }}>{item.price?.toLocaleString()} UZS</span>
                        {item.oldPrice > 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{item.oldPrice?.toLocaleString()} UZS</div>}
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: item.stockCount > 0 ? 'var(--clr-success)' : 'var(--clr-danger)' }}>{item.stockCount}</span></td>
                    <td>
                      <button onClick={() => handleStatusToggle(item)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                        <span className={`badge badge-${item.status === 'active' ? 'success' : 'danger'}`}>
                          {item.status === 'active' ? t('readyProducts.active') : t('readyProducts.inactive')}
                        </span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => openEdit(item)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(item.id)}>
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

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ProductModal
            product={editItem}
            categories={categories}
            onClose={() => setModalOpen(false)}
            onSave={() => { setModalOpen(false); loadItems() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
