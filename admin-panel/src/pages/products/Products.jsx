import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit, Trash2, Eye, Package, X, Upload, Image } from 'lucide-react'
import { productsAPI } from '../../api/products'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const CATS = ['Arduino', 'ESP Modullar', 'Raspberry Pi', 'Sensorlar', 'Smart Home', 'Motorlar', 'Displeylar', 'Asboblar', 'To\'plamlar']
const BADGES = ['', 'HOT', 'NEW', 'SALE', 'BEST']
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

const MOCK = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: ['Arduino Uno R3', 'ESP32 DevKit', 'Raspberry Pi 4B', 'DHT22 Sensor', 'SSD1306 OLED', 'L298N Motor Driver', 'HC-SR04 Ultrasonic', 'IR Sensor Module', 'Relay Module 4ch', 'Breadboard 830', 'Jump Wires Set', 'Arduino Nano'][i],
  category: CATS[i % CATS.length],
  price: [89000, 145000, 890000, 32000, 67000, 45000, 28000, 22000, 55000, 18000, 15000, 45000][i],
  oldPrice: i % 3 === 0 ? [120000, 180000, null, 45000][i % 4] : null,
  badge: BADGES[i % BADGES.length],
  inStock: i % 5 !== 3,
  rating: 3.5 + (i % 3) * 0.5,
  reviews: 10 + i * 7,
  image: `https://picsum.photos/seed/prod${i}/400/400`,
  description: 'Arduino asosidagi mikrokontroller platasi',
  status: i % 4 === 0 ? 'inactive' : 'active',
}))

function ProductModal({ product, onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => {
    let initialImages = []
    if (product?.images?.length) initialImages = product.images
    else if (product?.image) initialImages = product.image.split(',')
    
    return product ? { ...product, images: initialImages } : {
      name: '', category: CATS[0], price: '', oldPrice: '',
      badge: '', inStock: true, description: '', images: [], image: '', status: 'active',
    }
  })
  const [imgPreviews, setImgPreviews] = useState(form.images || [])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = async (files) => {
    if (!files || files.length === 0) return
    const fileArray = Array.from(files).slice(0, 10 - imgPreviews.length)
    if (fileArray.length === 0) {
      toast.error('Maksimal 10 ta rasm yuklash mumkin')
      return
    }
    setUploading(true)
    
    const newPreviews = [...imgPreviews]
    const newFormImages = [...(form.images || [])]
    
    for (const file of fileArray) {
      const fd = new FormData()
      fd.append('image', file)
      try {
        const token = localStorage.getItem('admin-token')
        const res = await fetch(`${API_URL}/api/products/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          const url = data.url || data.path || data.image
          newFormImages.push(url)
          newPreviews.push(url.startsWith('http') ? url : `${API_URL}${url}`)
        } else {
          const url = URL.createObjectURL(file)
          newPreviews.push(url)
          newFormImages.push(url)
        }
      } catch {
        const url = URL.createObjectURL(file)
        newPreviews.push(url)
        newFormImages.push(url)
      }
    }
    
    setImgPreviews(newPreviews)
    set('images', newFormImages)
    set('image', newFormImages.join(','))
    setUploading(false)
  }

  const removeImage = (index) => {
    setImgPreviews(prev => prev.filter((_, i) => i !== index))
    const newImages = (form.images || []).filter((_, i) => i !== index)
    set('images', newImages)
    set('image', newImages.join(','))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return toast.error('Nomi va narxi kiritilishi shart')
    try {
      const payload = { ...form, price: Number(form.price), oldPrice: form.oldPrice ? Number(form.oldPrice) : null, image: (form.images || []).join(',') }
      let saved
      if (product?.id) {
        saved = await productsAPI.update(product.id, payload).catch(() => ({ ...payload, id: product.id }))
      } else {
        saved = await productsAPI.create(payload).catch(() => ({ ...payload, id: Date.now().toString() }))
      }
      toast.success(product ? 'Mahsulot yangilandi' : 'Mahsulot qo\'shildi')
      onSave(saved || payload)
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 620 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{product ? t('products.editProduct') : t('products.addProduct')}</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            {/* Image upload */}
            <div>
              <div
                className={`img-upload-area${uploading ? ' dragging' : ''}`}
                style={{ padding: '20px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files) }}
              >
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Upload size={28} />
                  <span style={{ fontSize: 13 }}>Rasm yuklash (maks. 10 ta)</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{uploading ? 'Yuklanmoqda...' : 'JPG, PNG, WEBP — max 5MB'}</p>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files)} />
              </div>
              
              {imgPreviews.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {imgPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }} 
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-grid form-grid-2">
              <div className="ui-input-wrap">
                <label className="ui-label">{t('products.productName')} *</label>
                <input className="ui-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Arduino Uno R3" />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('products.productCategory')}</label>
                <select className="ui-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('products.productPrice')} (so'm) *</label>
                <input className="ui-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="89000" />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">Eski narx (so'm)</label>
                <input className="ui-input" type="number" value={form.oldPrice || ''} onChange={e => set('oldPrice', e.target.value)} placeholder="120000" />
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">Badge</label>
                <select className="ui-select" value={form.badge || ''} onChange={e => set('badge', e.target.value)}>
                  {BADGES.map(b => <option key={b} value={b}>{b || '— Yo\'q —'}</option>)}
                </select>
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">Holat</label>
                <select className="ui-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Faol</option>
                  <option value="inactive">Nofaol</option>
                </select>
              </div>
            </div>

            <div className="ui-input-wrap">
              <label className="ui-label">{t('products.productDescription')}</label>
              <textarea className="ui-input ui-textarea" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Mahsulot tavsifi..." />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <button type="button" className={`toggle${form.inStock ? ' on' : ''}`} onClick={() => set('inStock', !form.inStock)} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {form.inStock ? t('products.inStock') : t('products.outOfStock')}
              </span>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{product ? t('common.save') : t('common.add')}</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Products() {
  const { t } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | 'add' | product
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const PER = 8

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getAll()
      setProducts(data.products || data || MOCK)
    } catch {
      setProducts(MOCK)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await productsAPI.delete(deleteTarget.id).catch(() => {})
      setProducts(p => p.filter(x => x.id !== deleteTarget.id))
      toast.success('Mahsulot o\'chirildi')
    } catch { toast.error('Xatolik') }
    setDeleteTarget(null)
  }

  const handleSave = (saved) => {
    if (modal?.id) {
      setProducts(p => p.map(x => x.id === saved.id ? { ...x, ...saved } : x))
    } else {
      setProducts(p => [saved, ...p])
    }
    setModal(null)
  }

  const filtered = products.filter(p => {
    const s = search.toLowerCase()
    if (s && !p.name?.toLowerCase().includes(s) && !p.category?.toLowerCase().includes(s)) return false
    if (catFilter !== 'all' && p.category !== catFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const total = filtered.length
  const pages = Math.ceil(total / PER)
  const slice = filtered.slice((page - 1) * PER, page * PER)

  const imgSrc = (p) => {
    if (!p.image) return null
    const firstImg = p.image.split(',')[0]
    if (firstImg.startsWith('http') || firstImg.startsWith('blob')) return firstImg
    return `${API_URL}${firstImg}`
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('products.title')}</h1>
          <p className="page-subtitle">{total} ta mahsulot</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> {t('products.addProduct')}
        </button>
      </div>

      {/* Filters */}
      <div className="filter-row">
        <div className="al-search" style={{ flex: 1, maxWidth: 'none' }}>
          <Search size={15} className="al-search-icon" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={t('common.search') + '...'} />
        </div>
        <select className="ui-select" style={{ width: 180 }} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1) }}>
          <option value="all">Barcha kategoriyalar</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="ui-select" style={{ width: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="all">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>

      {/* Table */}
      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Package size={40} /><p>Yuklanmoqda...</p></div>
        ) : slice.length === 0 ? (
          <div className="empty-state"><Package size={40} /><p>{t('products.noProducts')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Rasm</th>
                  <th>Nomi</th>
                  <th>Kategoriya</th>
                  <th>Narxi</th>
                  <th>Badge</th>
                  <th>Holat</th>
                  <th>Ombor</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      {imgSrc(p) ? (
                        <img src={imgSrc(p)} alt={p.name} className="tbl-img" onError={e => e.target.style.display='none'} />
                      ) : (
                        <div className="tbl-img" style={{ display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)' }}>
                          <Image size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      {p.oldPrice && <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{p.oldPrice?.toLocaleString()} so'm</div>}
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.category}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--clr-brand-light)' }}>{p.price?.toLocaleString()} so'm</span></td>
                    <td>
                      {p.badge ? (
                        <span className={`badge ${p.badge === 'HOT' ? 'badge-danger' : p.badge === 'NEW' ? 'badge-success' : p.badge === 'SALE' ? 'badge-warning' : 'badge-info'}`}>{p.badge}</span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-default'}`}>
                        <span className="badge-dot" />{p.status === 'active' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.inStock ? 'badge-success' : 'badge-danger'}`}>
                        {p.inStock ? t('products.inStock') : t('products.outOfStock')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(p)} title="Tahrirlash">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDeleteTarget(p)} title="O'chirish">
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>
              {(page-1)*PER+1}–{Math.min(page*PER,total)} / {total}
            </span>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={`page-btn${page === i+1 ? ' active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Product modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: 400 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title" style={{ color: 'var(--clr-danger)' }}>Mahsulotni o'chirish</span>
                <button className="modal-close" onClick={() => setDeleteTarget(null)}><X size={16} /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>"{deleteTarget.name}"</strong> ni o'chirmoqchimisiz? Bu amal qaytarilmaydi.
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
