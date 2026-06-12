import client from './client'

export const productsAPI = {
  // Admin - hamma statusdagi mahsulotlarni ko'rish
  getAll: (params) => client.get('/products', {
    params: { ...params, status: undefined, limit: 200 }  // status filter yo'q - admin barchasini ko'radi
  }).then(r => {
    const d = r.data
    return { products: d.data || d.products || (Array.isArray(d) ? d : []), total: d.total || 0 }
  }),
  getById: (id) => client.get(`/products/${id}`).then(r => r.data.data || r.data),
  create: (data) => client.post('/products', data).then(r => r.data.data || r.data),
  update: (id, data) => client.put(`/products/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => client.delete(`/products/${id}`).then(r => r.data),
  updateStatus: (id, status) => client.patch(`/products/${id}/status`, { status }).then(r => r.data),
}
