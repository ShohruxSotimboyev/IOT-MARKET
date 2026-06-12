/** Kategoriya nomi — mahsulot filtri `name` bilan, ko‘rinishi tarjima orqali */
export function categoryLabel(t, cat) {
  if (!cat) return ''
  const key = cat.key || cat.id
  return t(`categoryNames.${key}`, { defaultValue: cat.name })
}

export function featuredLabel(t, cat, field = 'name') {
  const key = cat.key || cat.id
  return t(`featured.${key}.${field}`, { defaultValue: cat[field] })
}

export function formatPrice(n, locale = 'uz-UZ') {
  return `${Number(n).toLocaleString(locale)}`
}
