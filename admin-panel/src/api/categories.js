const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const getHeaders = () => {
  const token = localStorage.getItem('admin-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const categoriesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/categories`);
    if (!res.ok) throw new Error('Kategoriyalarni yuklashda xatolik');
    return res.json();
  },
  
  create: async (data) => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Xatolik yuz berdi');
    }
    return res.json();
  },
  
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Xatolik yuz berdi');
    }
    return res.json();
  },
  
  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Xatolik yuz berdi');
    }
    return res.json();
  }
};
