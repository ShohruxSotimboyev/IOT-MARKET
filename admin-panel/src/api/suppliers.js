import client from './client'

export const suppliersAPI = {
  getAll: async () => {
    const res = await client.get('/suppliers')
    return res.data
  },
  
  create: async (data) => {
    const res = await client.post('/suppliers', data)
    return res.data
  },
  
  update: async (id, data) => {
    const res = await client.put(`/suppliers/${id}`, data)
    return res.data
  },
  
  delete: async (id) => {
    const res = await client.delete(`/suppliers/${id}`)
    return res.data
  }
};
