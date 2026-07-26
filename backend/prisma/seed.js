const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding started...')

  // ── Superadmin user ─────────────────────────────────────────────────────────
  const existingSuper = await prisma.user.findFirst({ where: { email: 'superadmin@iotmarket.uz' } })
  if (!existingSuper) {
    const hash = await bcrypt.hash('SuperAdmin123!', 12)
    await prisma.user.create({
      data: {
        username: 'SuperAdmin',
        email: 'superadmin@iotmarket.uz',
        password: hash,
        role: 'superadmin',
        isVerified: true,
        phone: '+998901234568',
      },
    })
    console.log('✅ SuperAdmin yaratildi: superadmin@iotmarket.uz / SuperAdmin123!')
  } else {
    console.log('ℹ️  SuperAdmin allaqachon mavjud')
  }

  // ── Sample products ────────────────────────────────────────────────────────
  const count = await prisma.product.count()
  if (count === 0) {
    const products = [
      { name: 'Arduino Uno R3', category: 'Arduino', price: 89000, oldPrice: 120000, badge: 'HOT', inStock: true, rating: 4.8, reviews: 124, image: 'https://picsum.photos/seed/ard1/400/400', description: 'Arduino Uno R3 mikrokontroller', status: 'active' },
      { name: 'ESP32 DevKit V1', category: 'ESP Modullar', price: 145000, badge: 'NEW', inStock: true, rating: 4.9, reviews: 89, image: 'https://picsum.photos/seed/esp1/400/400', description: 'WiFi va Bluetooth ESP32', status: 'active' },
      { name: 'Raspberry Pi 4B 4GB', category: 'Raspberry Pi', price: 890000, badge: 'BEST', inStock: true, rating: 5.0, reviews: 56, image: 'https://picsum.photos/seed/rpi1/400/400', description: 'Raspberry Pi 4 Model B 4GB', status: 'active' },
      { name: 'DHT22 Sensor', category: 'Sensorlar', price: 32000, inStock: true, rating: 4.5, reviews: 201, image: 'https://picsum.photos/seed/dht1/400/400', description: 'Harorat va namlik sensori', status: 'active' },
      { name: 'SSD1306 OLED 0.96"', category: 'Displeylar', price: 67000, badge: 'SALE', inStock: true, rating: 4.7, reviews: 145, image: 'https://picsum.photos/seed/oled1/400/400', description: 'I2C OLED displej', status: 'active' },
      { name: 'L298N Motor Driver', category: 'Motorlar', price: 45000, inStock: true, rating: 4.6, reviews: 78, image: 'https://picsum.photos/seed/mot1/400/400', description: 'Dual H-Bridge motor drayver', status: 'active' },
      { name: 'HC-SR04 Ultrasonic', category: 'Sensorlar', price: 28000, inStock: true, rating: 4.4, reviews: 312, image: 'https://picsum.photos/seed/hcsr1/400/400', description: 'Masofa o\'lchash sensori', status: 'active' },
      { name: 'Arduino Nano', category: 'Arduino', price: 65000, inStock: true, rating: 4.7, reviews: 98, image: 'https://picsum.photos/seed/nano1/400/400', description: 'Kichik Arduino Nano', status: 'active' },
      { name: 'ESP8266 NodeMCU', category: 'ESP Modullar', price: 75000, inStock: true, rating: 4.5, reviews: 167, image: 'https://picsum.photos/seed/esp8/400/400', description: 'WiFi modul ESP8266', status: 'active' },
      { name: 'MPU6050 Gyroscope', category: 'Sensorlar', price: 38000, badge: 'HOT', inStock: true, rating: 4.6, reviews: 89, image: 'https://picsum.photos/seed/mpu1/400/400', description: '6-axis IMU sensor', status: 'active' },
    ]
    await prisma.product.createMany({ data: products })
    console.log(`✅ ${products.length} ta mahsulot qo'shildi`)
  } else {
    console.log(`ℹ️  ${count} ta mahsulot allaqachon mavjud`)
  }

  // ── Sample banner ──────────────────────────────────────────────────────────
  const bannerCount = await prisma.banner.count()
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        title: 'Arduino va ESP Modullari',
        description: "Eng yangi mikrokontrollerlar — 30% chegirma!",
        image: 'https://picsum.photos/seed/banner1/1920/600',
        link: '/products',
        status: 'active',
        order: 1,
      },
    })
    console.log('✅ Banner qo\'shildi')
  }

  console.log('\n🎉 Seed muvaffaqiyatli!')
  console.log('📧 SuperAdmin: superadmin@iotmarket.uz')
  console.log('🔑 Parol: SuperAdmin123!')
}

main()
  .catch((e) => { console.error('❌ Seed xatosi:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
