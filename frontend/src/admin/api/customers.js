import client from './client'

export const customersAPI = {
  getAll: (params) => client.get('/auth/users', { params }).then(r => {
    const d = r.data
    return { users: d.data || d.users || d, total: d.total || 0 }
  }),
}
