import client from './client'

export const bannersAPI = {
  getAll: () => client.get('/banners').then(r => {
    const d = r.data
    return { banners: d.data || d.banners || d }
  }),
  create: (data) => client.post('/banners', data).then(r => r.data.data || r.data),
  update: (id, data) => client.put(`/banners/${id}`, data).then(r => r.data.data || r.data),
  delete: (id) => client.delete(`/banners/${id}`).then(r => r.data),
}
