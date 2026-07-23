import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Archive, X, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react'
import { inventoryAPI } from '../../api/inventory'
import { productsAPI } from '../../api/products'
import toast from 'react-hot-toast'
import Select from 'react-select'

function InventoryModal({ products, onClose, onSave }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ productId: '', type: 'in', quantity: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)

  const productOptions = products.map(p => ({ value: p.id, label: p.name }))

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
            <div className="ui-input-wrap">
              <label className="ui-label">{t('inventory.productLabel')}</label>
              <Select
                options={productOptions}
                value={productOptions.find(o => o.value === form.productId) || null}
                onChange={selected => setForm({ ...form, productId: selected ? selected.value : '' })}
                placeholder="-- Tanlang yoki qidiring --"
                isSearchable
                noOptionsMessage={() => "Topilmadi"}
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    borderRadius: '8px',
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--bg-input, transparent)',
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: 'var(--clr-primary)'
                    }
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  menu: (base) => ({
                    ...base,
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }),
                  option: (base, state) => ({
                    ...base,
                    background: state.isFocused ? '#f3f4f6' : '#ffffff',
                    color: state.isFocused ? 'var(--clr-primary)' : '#1f2937',
                    cursor: 'pointer'
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: 'var(--text-primary)'
                  }),
                  input: (base) => ({
                    ...base,
                    color: 'var(--text-primary)'
                  })
                }}
              />
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
  const [globalSearch, setGlobalSearch] = useState('')

  useEffect(() => { 
    const debounceTimeout = setTimeout(() => {
      setPage(1)
      loadLogs()
    }, 500)
    return () => clearTimeout(debounceTimeout)
  }, [globalSearch])

  useEffect(() => {
    loadLogs()
    if (products.length === 0) loadProducts()
  }, [page])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await inventoryAPI.getAll(page, 20, globalSearch)
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('inventory.title')}</h1>
          <p className="page-subtitle">{t('inventory.history')}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="ui-input-wrap" style={{ margin: 0, position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="ui-input" 
              placeholder="Qidirish..." 
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px' }}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)} style={{ height: '40px' }}>
            <Plus size={16} /> {t('inventory.addAction')}
          </button>
        </div>
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
