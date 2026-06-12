import client from './client'

export const ordersAPI = {
  getAll: (params) => client.get('/orders/admin/all', { params }).then(r => {
    const d = r.data
    return { orders: d.orders || d.data || [], total: d.total || 0 }
  }),
  getById: (id) => client.get(`/orders/${id}`).then(r => r.data.data || r.data),
  updateStatus: (id, status) => client.patch(`/orders/${id}/status`, { status }).then(r => r.data),
}
