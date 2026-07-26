import client from './client'

export const inventoryAPI = {
  getAll: async (page = 1, limit = 50, search = '') => {
    const res = await client.get(`/inventory?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
    return res.data
  },
  
  addLog: async (data) => {
    const res = await client.post('/inventory', data)
    return res.data
  },

  exportInventory: async (params = {}) => {
    const query = new URLSearchParams()
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    if (params.type) query.set('type', params.type)
    const res = await client.get(`/inventory/export?${query.toString()}`)
    return res.data
  }
};
