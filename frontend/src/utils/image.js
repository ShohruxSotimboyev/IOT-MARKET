const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

export const getImageUrl = (product) => {
  if (!product) return 'https://placehold.co/400x400/1a1a1a/cccccc?text=No+Image'
  
  // images massiv bo'lsa birinchisini ol
  let imgPath = null
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    imgPath = product.images[0]
  } else {
    imgPath = product.img || product.image
    // comma-separated bo'lsa birinchisini ol
    if (imgPath && imgPath.includes(',')) imgPath = imgPath.split(',')[0].trim()
  }
  
  if (!imgPath) return 'https://placehold.co/400x400/1a1a1a/cccccc?text=No+Image'
  if (imgPath.startsWith('http') || imgPath.startsWith('blob') || imgPath.startsWith('data:')) return imgPath
  return `${API_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
}

export const getAllImageUrls = (product) => {
  if (!product) return []
  
  let images = []
  if (product.images && Array.isArray(product.images)) {
    images = product.images
  } else if (product.image && product.image.includes(',')) {
    images = product.image.split(',').map(s => s.trim()).filter(Boolean)
  } else if (product.img) {
    images = [product.img]
  } else if (product.image) {
    images = [product.image]
  }
  
  return images.map(imgPath => {
    if (imgPath.startsWith('http') || imgPath.startsWith('blob') || imgPath.startsWith('data:')) return imgPath
    return `${API_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`
  }).filter(Boolean)
}
