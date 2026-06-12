import { useState, useRef, useEffect } from 'react'
import { usePersistedState } from '../../hooks/usePersistedState'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Send, Bot } from 'lucide-react'

const BOT_REPLIES = {
  uz: 'Rahmat! Mutaxassisimiz tez orada javob beradi. Ish vaqti: 24/7 onlayn yordam.',
  en: 'Thanks! Our specialist will reply shortly. Support: 24/7 online assistance.',
  ru: 'Спасибо! Наш специалист скоро ответит. Поддержка: 24/7 онлайн.',
}

export default function Chat247() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([
    { from: 'bot', text: t('chat.welcome') },
  ])
  const [input, setInput, clearInput] = usePersistedState('iot_form_chat_draft', '')
  const messagesRef = useRef(null)
  const lang = (i18n.language || 'uz').split('-')[0]

  useEffect(() => {
    const box = messagesRef.current
    if (!box) return
    box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages((m) => [...m, { from: 'user', text }])
    clearInput()
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text: BOT_REPLIES[lang] || BOT_REPLIES.uz }])
    }, 700)
  }

  return (
    <div className="rounded-[15px] border border-white/12 bg-white/[0.06] overflow-hidden flex flex-col h-[min(480px,70vh)]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-primary/20 to-teal/15">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold">{t('chat.title')}</h3>
          <p className="text-teal text-xs font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            {t('chat.online')}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-teal/15 text-teal text-[10px] font-bold uppercase tracking-wider">
          24/7
        </span>
      </div>

      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.from === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-teal" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-gradient-to-r from-primary to-teal text-white rounded-br-md'
                  : 'bg-white/10 text-white/85 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.placeholder')}
          className="flex-1 h-11 px-4 rounded-xl bg-white/[0.07] border border-white/12 text-white text-sm placeholder-white/35 outline-none focus:border-teal/40 transition-colors"
        />
        <button
          type="submit"
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-teal text-white shrink-0 hover:opacity-90 transition-opacity"
          aria-label={t('chat.send')}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
