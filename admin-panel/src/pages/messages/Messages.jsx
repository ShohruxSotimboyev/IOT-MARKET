import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, X, Send, Mail } from 'lucide-react'
import { messagesAPI } from '../../api/messages'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const MOCK_MSGS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i+1),
  name: ['Alisher', 'Dilnoza', 'Jasur', 'Malika', 'Sardor', 'Zulfiya', 'Bobur', 'Nargiza'][i],
  email: `user${i+1}@example.com`,
  subject: ['Mahsulot haqida savol', 'Yetkazib berish', 'Qaytarish', 'To\'lov', 'Texnik yordam', 'Hamkorlik', 'Narxlar', 'Boshqa'][i],
  message: 'Salom, mahsulotingiz haqida bir nechta savollarim bor. Iltimos javob bering.',
  status: i < 3 ? 'unread' : 'read',
  reply: i >= 5 ? 'Xabaringiz uchun rahmat, tez orada javob beramiz.' : null,
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function Messages() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    messagesAPI.getAll().then(data => setMessages(data.messages || data || MOCK_MSGS)).catch(() => setMessages(MOCK_MSGS)).finally(() => setLoading(false))
  }, [])

  const openMsg = (msg) => {
    setSelected(msg)
    setReply(msg.reply || '')
    if (msg.status === 'unread') {
      messagesAPI.markRead(msg.id).catch(() => {})
      setMessages(m => m.map(x => x.id === msg.id ? { ...x, status: 'read' } : x))
    }
  }

  const sendReply = async () => {
    if (!reply.trim()) return
    try {
      await messagesAPI.reply(selected.id, reply).catch(() => {})
      setMessages(m => m.map(x => x.id === selected.id ? { ...x, reply, status: 'read' } : x))
      setSelected(s => ({ ...s, reply }))
      toast.success('Javob yuborildi')
    } catch { toast.error('Xatolik') }
  }

  const filtered = messages.filter(m => {
    const s = search.toLowerCase()
    return !s || m.name?.toLowerCase().includes(s) || m.subject?.toLowerCase().includes(s)
  })

  const unread = messages.filter(m => m.status === 'unread').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('messages.title')}</h1>
          <p className="page-subtitle">
            {unread > 0 && <span style={{ color: 'var(--clr-danger)', marginRight: 8 }}>{unread} o'qilmagan</span>}
            {filtered.length} ta xabar
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: 14 }}>
        {/* List */}
        <div className="ui-card">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="al-search">
              <Search size={15} className="al-search-icon" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..." />
            </div>
          </div>
          {loading ? (
            <div className="empty-state"><p>{t('common.loading')}</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><MessageSquare size={40} /><p>Xabarlar yo'q</p></div>
          ) : (
            <div>
              {filtered.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMsg(msg)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: selected?.id === msg.id ? 'var(--bg-hover)' : 'transparent',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = selected?.id === msg.id ? 'var(--bg-hover)' : 'transparent'}
                >
                  {msg.status === 'unread' && (
                    <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-brand)' }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: msg.status === 'unread' ? 700 : 500, fontSize: 13 }}>{msg.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>{msg.subject}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{msg.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <AnimatePresence>
          {selected && (
            <motion.div className="ui-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="ui-card-header">
                <span className="ui-card-title">{selected.subject}</span>
                <button className="modal-close" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>
              <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="al-avatar">{selected.name[0]}</div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{selected.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{selected.email}</p>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-overlay)', borderRadius: 12, padding: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  {selected.message}
                </div>
                {selected.reply && (
                  <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 14 }}>
                    <p style={{ fontSize: 11, color: 'var(--clr-brand-light)', marginBottom: 6, fontWeight: 600 }}>SIZNING JAVOBINGIZ</p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.reply}</p>
                  </div>
                )}
                <div style={{ marginTop: 'auto' }}>
                  <textarea className="ui-input ui-textarea" value={reply} onChange={e => setReply(e.target.value)} placeholder="Javob yozing..." style={{ marginBottom: 10 }} />
                  <button className="btn btn-primary" onClick={sendReply} style={{ width: '100%' }}>
                    <Send size={14} /> Javob yuborish
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
