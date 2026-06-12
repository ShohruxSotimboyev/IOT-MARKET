// backend/scripts/importFromAdafruit.js
require('dotenv').config()
const { prisma } = require('../config/db')

const UZS_RATE = 12800 // 1 USD = 12800 so'm

async function importFromAdafruit() {
  console.log('⏳ Adafruit dan mahsulotlar yuklanmoqda...')

  try {
    // 1. Barcha mahsulotlarni bir marta yuklab olish
    console.log('📡 Mahsulotlar ro\'yhati olinmoqda...')
    const res = await fetch('https://www.adafruit.com/api/products')
    const allProducts = await res.json()
    console.log(`📦 Jami API dan: ${allProducts.length} ta mahsulot`)

    // 2. Kategoriyalarni olish (nomlari uchun)
    const catRes  = await fetch('https://www.adafruit.com/api/categories')
    const catList = await catRes.json()

    // category_id → category_name mapping
    const catMap = {}
    for (const c of catList) {
      catMap[c.category_id] = c.category_name || c.name || 'Umumiy'
    }

    // 3. Faqat kerakli mahsulotlarni filtr qilish
    const filtered = allProducts.filter(p => {
      const name  = p.product_name
      const price = parseFloat(p.product_price || 0)
      const disc  = p.discontinue_status

      return (
        name &&
        price > 0 &&
        disc !== 'Discontinued' &&         // o'chirilganlarni o'tkazib yuborish
        p.products_coming_soon !== '1' &&  // kelayotganlarni o'tkazib yuborish
        p.products_virtual   !== '1'       // virtual mahsulotlarni o'tkazib yuborish
      )
    })

    console.log(`✅ Filtrdan o'tgan: ${filtered.length} ta (${allProducts.length - filtered.length} ta skip)`)

    // 4. DB ga saqlash
    let added   = 0
    let updated = 0
    let errors  = 0

    for (let i = 0; i < filtered.length; i++) {
      const p = filtered[i]

      // ✅ To'g'ri field nomlar
      const productName = p.product_name
      const priceUSD    = parseFloat(p.product_price || 0)
      const priceUZS    = Math.round(priceUSD * UZS_RATE)
      const imageUrl    = p.product_image || 'https://picsum.photos/400/400'
      const isInStock   = parseInt(p.product_stock || 0) > 0
      const categoryId  = p.product_master_category
      const catName     = catMap[categoryId] || 'Umumiy'

      // Badge
      let badge = null
      if (priceUSD < 5)  badge = 'HOT'
      if (priceUSD > 50) badge = null

      try {
        const existing = await prisma.product.findFirst({
          where: { name: productName }
        })

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data:  { price: priceUZS, image: imageUrl, inStock: isInStock }
          })
          updated++
        } else {
          await prisma.product.create({
            data: {
              name:        productName,
              category:    catName,
              price:       priceUZS,
              oldPrice:    null,
              image:       imageUrl,
              description: '',
              inStock:     isInStock,
              rating:      4.0 + Math.random(),
              reviews:     Math.floor(Math.random() * 120) + 5,
              status:      'active',
              badge:       badge,
            }
          })
          added++
        }
      } catch (e) {
        errors++
      }

      // Progress har 50 ta da ko'rsatish
      if ((i + 1) % 50 === 0) {
        console.log(`  ⏳ ${i + 1}/${filtered.length} — qo'shildi: ${added}, yangilandi: ${updated}`)
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ TUGADI!`)
    console.log(`   ➕ Yangi qo'shildi : ${added} ta`)
    console.log(`   🔄 Yangilandi      : ${updated} ta`)
    console.log(`   ❌ Xatolik         : ${errors} ta`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (err) {
    console.error('❌ Umumiy xatolik:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

importFromAdafruit()