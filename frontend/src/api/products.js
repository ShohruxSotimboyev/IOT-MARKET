import apiClient from './client'

export const productsAPI = {
  // Barcha mahsulotlarni olish
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  // Bitta mahsulotni olish
  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Mahsulotlarni qidirish
  search: async (query) => {
    const response = await apiClient.get('/products/search', { params: { q: query } })
    return response.data
  },

  // Kategoriya bo'yicha mahsulotlar
  getByCategory: async (category) => {
    const response = await apiClient.get(`/products/category/${category}`)
    return response.data
  },

  // Ommabop mahsulotlar
  getPopular: async () => {
    const response = await apiClient.get('/products/popular')
    return response.data
  },

  // Yangi mahsulotlar
  getNew: async () => {
    const response = await apiClient.get('/products/new')
    return response.data
  },
}
