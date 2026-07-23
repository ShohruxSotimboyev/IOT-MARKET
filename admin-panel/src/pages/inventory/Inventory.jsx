import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Archive, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { inventoryAPI } from '../../api/inventory'
import { productsAPI } from '../../api/products'
import toast from 'react-hot-toast'

function InventoryModal({ products, onClose, onSave }) {
  const { t } = useTranslation()

  const [form, setForm] = useState({ productId: '', type: 'in', quantity: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedProduct = products.find(p => p.id === form.productId)
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = async () => {
    if (!form.productId) return toast.error(t('inventory.selectProduct'))
    if (!form.quantity || form.quantity <= 0) return toast.error(t('inventory.enterAmount'))
    
    setSubmitting(true)
    try {
      const saved = await inventoryAPI.addLog(form)
      toast.success(t('inventory.updated'))
      onSave(saved.data)
    } catch (e) {
      toast.error(e.message || 'Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 450 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Ombor qoldig'ini o'zgartirish</span>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="ui-input-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
              <label className="ui-label">{t('inventory.productLabel')}</label>
              
              <div 
                className="ui-input" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'var(--bg-card)' }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span style={{ color: selectedProduct ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {selectedProduct ? selectedProduct.name : `-- ${t('common.select')} --`}
                </span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </div>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, 
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', 
                  borderRadius: '8px', marginTop: '4px', zIndex: 50, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <input 
                      type="text" 
                      className="ui-input" 
                      style={{ height: '32px', fontSize: '13px' }}
                      placeholder="Qidirish..." 
                      value={searchTerm} 
                      onChange={e => setSearchTerm(e.target.value)} 
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <div 
                          key={p.id}
                          style={{
                            padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                            background: form.productId === p.id ? 'var(--bg-body)' : 'transparent',
                            color: form.productId === p.id ? 'var(--clr-primary)' : 'var(--text-primary)'
                          }}
                          onClick={() => {
                            setForm({ ...form, productId: p.id })
                            setDropdownOpen(false)
                            setSearchTerm('')
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-body)'}
                          onMouseLeave={e => e.currentTarget.style.background = form.productId === p.id ? 'var(--bg-body)' : 'transparent'}
                        >
                          {p.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Topilmadi
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-grid form-grid-2">
              <div className="ui-input-wrap">
                <label className="ui-label">{t('inventory.operationType')}</label>
                <select className="ui-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="in">{t('inventory.income')}</option>
                  <option value="out">{t('inventory.expense')}</option>
                </select>
              </div>
              <div className="ui-input-wrap">
                <label className="ui-label">{t('inventory.amountLabel')}</label>
                <input type="number" className="ui-input" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="10" />
              </div>
            </div>

            <div className="ui-input-wrap">
              <label className="ui-label">{t('inventory.reasonLabel')}</label>
              <input className="ui-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder={t('inventory.reasonPlaceholder')} />
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

export default function Inventory() {
  const { t } = useTranslation()

  const [logs, setLogs] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { 
    loadLogs()
    loadProducts()
  }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await inventoryAPI.getAll(page, 20)
      setLogs(data.data)
      setTotalPages(data.totalPages)
    } catch {
      toast.error(t('inventory.loadError'))
    }
    setLoading(false)
  }

  const loadProducts = async () => {
    try {
      // Load all products for the dropdown (might need pagination or search for huge catalogs)
      const data = await productsAPI.getAll()
      setProducts(data.products || data || [])
    } catch {
      // error handled silently
    }
  }

  const handleSave = (newLog) => {
    // Optimistically prepend to list
    setLogs(prev => [newLog, ...prev].slice(0, 20))
    setModalOpen(false)
    loadLogs() // Reload to get product details (joins) properly formatted
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('inventory.title')}</h1>
          <p className="page-subtitle">{t('inventory.history')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> {t('inventory.addAction')}
        </button>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><Archive size={40} /><p>{t('common.loading')}</p></div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><Archive size={40} /><p>{t('inventory.noActions')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('common.date')}</th>
                  <th>{t('common.product')}</th>
                  <th>{t('common.type')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('common.reason')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(log.createdAt).toLocaleString('uz-UZ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{log.product?.name || t('inventory.deletedProduct')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.product?.category}</div>
                    </td>
                    <td>
                      {log.type === 'in' ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ArrowDownRight size={12} /> {t('inventory.incomeBadge')}
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ArrowUpRight size={12} /> {t('inventory.expenseBadge')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: log.type === 'in' ? 'var(--clr-success)' : 'var(--clr-danger)' }}>
                        {log.type === 'in' ? '+' : '-'}{log.quantity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{log.reason || '-'}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
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
          <InventoryModal
            products={products}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
