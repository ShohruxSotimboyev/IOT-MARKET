import client from './client'

export const messagesAPI = {
  getAll: (params) => client.get('/messages', { params }).then(r => {
    const d = r.data
    return { messages: d.data || d.messages || d, total: d.total || 0 }
  }),
  markRead: (id) => client.patch(`/messages/${id}/read`).then(r => r.data),
  reply: (id, reply) => client.post(`/messages/${id}/reply`, { reply }).then(r => r.data),
}
