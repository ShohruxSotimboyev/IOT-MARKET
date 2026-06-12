import apiClient from './client'

export const bannersAPI = {
  // Barcha bannerlarni olish
  getAll: async () => {
    const response = await apiClient.get('/banners')
    return response.data
  },

  // Faol bannerlarni olish
  getActive: async () => {
    const response = await apiClient.get('/banners/active')
    return response.data
  },
}
