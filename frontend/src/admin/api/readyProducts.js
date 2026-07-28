import client from './client'

export const readyProductsAPI = {
  getAll: (params) => client.get('/ready-products', { params }).then(r => r.data),
  getById: (id) => client.get(`/ready-products/${id}`).then(r => r.data.data),
  create: (data) => client.post('/ready-products', data).then(r => r.data.data),
  update: (id, data) => client.put(`/ready-products/${id}`, data).then(r => r.data.data),
  delete: (id) => client.delete(`/ready-products/${id}`).then(r => r.data),
  updateStatus: (id, status) => client.patch(`/ready-products/${id}/status`, { status }).then(r => r.data),
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await client.post('/ready-products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
}
