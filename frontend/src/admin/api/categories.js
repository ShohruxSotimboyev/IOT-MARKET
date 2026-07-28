import client from './client'

export const categoriesAPI = {
  getAll: async () => {
    const res = await client.get('/categories')
    return res.data
  },
  
  create: async (data) => {
    const res = await client.post('/categories', data)
    return res.data
  },
  
  update: async (id, data) => {
    const res = await client.put(`/categories/${id}`, data)
    return res.data
  },
  
  delete: async (id) => {
    const res = await client.delete(`/categories/${id}`)
    return res.data
  }
};
