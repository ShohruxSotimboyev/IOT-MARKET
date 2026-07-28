import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Star, CheckCircle, XCircle } from 'lucide-react'
import client from '../../api/client'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function Reviews() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await client.get('/reviews')
      setReviews(res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.message || t('reviews.loadError', "Sharhlarni yuklashda xatolik"))
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('reviews.deleteConfirm', "Bu sharhni o'chirmoqchimisiz?"))) return
    try {
      await client.delete(`/reviews/${id}`)
      toast.success(t('reviews.deleted', "Sharh o'chirildi"))
      load()
    } catch {
      toast.error(t('reviews.deleteError', "O'chirishda xatolik"))
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('reviews.title', 'Sharhlar')}</h1>
          <p className="page-subtitle">{t('reviews.subtitle', 'Mahsulotlarga yozilgan sharhlarni boshqarish')}</p>
        </div>
      </div>

      <div className="ui-card">
        {loading ? (
          <div className="empty-state"><p>{t('common.loading', 'Yuklanmoqda...')}</p></div>
        ) : reviews.length === 0 ? (
           <div className="empty-state"><p>{t('reviews.noReviews', 'Sharhlar mavjud emas.')}</p></div>
        ) : (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>{t('reviews.product', 'Mahsulot')}</th>
                  <th>{t('reviews.customer', 'Mijoz')}</th>
                  <th>{t('reviews.rating', 'Baho')}</th>
                  <th>{t('reviews.comment', 'Sharh')}</th>
                  <th>{t('common.date', 'Sana')}</th>
                  <th>{t('common.actions', 'Amallar')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {r.product?.image && <img src={r.product.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.product?.name || t('reviews.unknownProduct', 'Noma\'lum mahsulot')}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.user?.username || t('reviews.user', 'Foydalanuvchi')}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', color: '#FFB800' }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} size={14} fill={idx < r.rating ? 'currentColor' : 'none'} opacity={idx < r.rating ? 1 : 0.3} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <p style={{ fontSize: 13, maxWidth: 300, whiteSpace: 'normal', color: 'var(--text-secondary)' }}>
                        {r.comment}
                      </p>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--clr-danger)' }} onClick={() => handleDelete(r.id)} title={t('common.delete', 'O\'chirish')}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
