// categorize.js
// Foydalanish: node categorize.js
// "Umumiy" kategoriyasidagi mahsulotlarni nomidagi kalit so'zlarga qarab
// mavjud kategoriyalarga (Arduino, Raspberry Pi, Sensorlar, ESP Modullar,
// Motorlar, Displeylar, Asboblar, Smart Home, Accessories) ajratadi.

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Tartib MUHIM — yuqoridagi qoida birinchi mos kelganda ishlatiladi.
// updateMany faqat hali 'Umumiy' bo'lib qolgan mahsulotlarni o'zgartiradi,
// shu sababli keyingi qoidalar avvalgilarga tegmaydi.
const RULES = [
  {
    target: 'Raspberry Pi',
    keywords: ['raspberry pi', 'rpi ', ' rpi', 'pi zero', 'pi 5', 'pi 4', 'pi pico', 'picowbell', 'pi cow', ' pico'],
  },
  {
    target: 'Arduino',
    keywords: ['arduino'],
  },
  {
    target: 'ESP Modullar',
    keywords: ['esp32', 'esp8266', 'esp-01', 'nodemcu', 'wemos', 'esp-idf', 'esp32-s3', 'esp32-c3'],
  },
  {
    target: 'Motorlar',
    keywords: ['servo', 'stepper', 'dc motor', 'nema 17', 'nema 23', 'gear motor', ' motor'],
  },
  {
    target: 'Displeylar',
    keywords: ['display', 'oled', 'tft', ' lcd', 'e-ink', 'eink', 'epaper', 'e-paper', 'led matrix', 'segment display', 'matrix display'],
  },
  {
    target: 'Sensorlar',
    keywords: ['sensor', 'bme68', 'bme28', 'bno0', 'dht11', 'dht22', ' imu', 'gps', 'rtc', 'temperature', 'humidity', 'pressure', 'gas sensor', 'orientation'],
  },
  {
    target: 'Smart Home',
    keywords: ['zigbee', 'z-wave', 'smart plug', 'smart bulb', 'smart switch', 'smart lock', 'smart home', 'smart camera'],
  },
  {
    target: 'Asboblar',
    keywords: ['multimeter', 'oscilloscope', 'solder', 'desolder', 'flux', 'logic analyzer'],
  },
]

// Qolgan barchasi shu kategoriyaga tushadi
const FALLBACK_CATEGORY = 'Accessories'

async function run() {
  let totalUpdated = 0

  for (const rule of RULES) {
    const result = await prisma.product.updateMany({
      where: {
        category: 'Umumiy',
        OR: rule.keywords.map((kw) => ({
          name: { contains: kw, mode: 'insensitive' },
        })),
      },
      data: { category: rule.target },
    })
    console.log(`${rule.target}: ${result.count} ta mahsulot yangilandi`)
    totalUpdated += result.count
  }

  // Qolganlarini fallback kategoriyaga o'tkazamiz
  const fallbackResult = await prisma.product.updateMany({
    where: { category: 'Umumiy' },
    data: { category: FALLBACK_CATEGORY },
  })
  console.log(`${FALLBACK_CATEGORY} (qolganlari): ${fallbackResult.count} ta mahsulot yangilandi`)
  totalUpdated += fallbackResult.count

  console.log(`\nJami yangilandi: ${totalUpdated} ta mahsulot`)

  // Yakuniy holatni ko'rsatamiz
  const summary = await prisma.product.groupBy({
    by: ['category'],
    _count: true,
  })
  console.log('\nYangi kategoriyalar bo\'yicha taqsimot:')
  console.log(summary)

  await prisma.$disconnect()
}

run().catch((e) => {
  console.error(e)
  prisma.$disconnect()
})