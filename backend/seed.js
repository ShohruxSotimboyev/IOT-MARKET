const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  {
    name: 'Arduino UNO R3 Original',
    category: 'Arduino',
    price: 110000,
    oldPrice: 130000,
    badge: 'HOT',
    inStock: true,
    stockCount: 50,
    rating: 4.9,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80',
    description: 'Eng mashhur mikrokontroller. ATmega328P asosida qurilgan. O\'rganish va DIY loyihalar uchun eng yaxshi tanlov.',
    status: 'active'
  },
  {
    name: 'ESP32 DevKit V1 (Wi-Fi + Bluetooth)',
    category: 'ESP Modullar',
    price: 65000,
    oldPrice: 75000,
    badge: 'NEW',
    inStock: true,
    stockCount: 200,
    rating: 4.8,
    reviews: 85,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    description: 'IoT loyihalari uchun ideal mikrokontroller. Dual-core 240MHz, Wi-Fi va Bluetooth o\'rnatilgan.',
    status: 'active'
  },
  {
    name: 'Raspberry Pi 4 Model B - 4GB',
    category: 'Raspberry Pi',
    price: 750000,
    oldPrice: 800000,
    badge: 'SALE',
    inStock: true,
    stockCount: 15,
    rating: 5.0,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1563452965085-2e77e5bf2607?auto=format&fit=crop&w=800&q=80',
    description: 'Mini kompyuter. Broadcom BCM2711, Quad core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5GHz.',
    status: 'active'
  },
  {
    name: 'DHT22 Harorat va Namlik Sensori',
    category: 'Sensorlar',
    price: 35000,
    oldPrice: null,
    badge: null,
    inStock: true,
    stockCount: 100,
    rating: 4.5,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    description: 'Yuqori aniqlikdagi harorat va namlik sensori. DHT11 dan aniqroq ishlaydi.',
    status: 'active'
  },
  {
    name: '0.96 inch OLED Display I2C',
    category: 'Displeylar',
    price: 45000,
    oldPrice: 55000,
    badge: 'HOT',
    inStock: true,
    stockCount: 80,
    rating: 4.7,
    reviews: 90,
    image: 'https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80',
    description: '128x64 pikselli kichik OLED ekran. I2C interfeysi orqali ulanadi, faqat 4 ta sim kerak.',
    status: 'active'
  },
  {
    name: 'SG90 Micro Servo Motor',
    category: 'Motorlar',
    price: 22000,
    oldPrice: 25000,
    badge: null,
    inStock: true,
    stockCount: 150,
    rating: 4.6,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80',
    description: 'Kichik va yengil servo motor. Robotika va Arduino loyihalari uchun juda qulay.',
    status: 'active'
  },
  {
    name: 'L298N Motor Driver',
    category: 'Motorlar',
    price: 30000,
    oldPrice: null,
    badge: null,
    inStock: true,
    stockCount: 60,
    rating: 4.4,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd378c?auto=format&fit=crop&w=800&q=80',
    description: 'Ikki tomonlama DC motor drayveri. 2 ta DC motor yoki 1 ta stepper motor boshqarish mumkin.',
    status: 'active'
  },
  {
    name: 'HC-SR04 Ultratovushli Masofa Sensori',
    category: 'Sensorlar',
    price: 18000,
    oldPrice: 22000,
    badge: 'SALE',
    inStock: true,
    stockCount: 300,
    rating: 4.8,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b06?auto=format&fit=crop&w=800&q=80',
    description: '2cm dan 400cm gacha masofani kontaktsiz o\'lchash imkonini beradi.',
    status: 'active'
  },
  {
    name: 'NodeMCU ESP8266 v3',
    category: 'ESP Modullar',
    price: 45000,
    oldPrice: 50000,
    badge: null,
    inStock: true,
    stockCount: 120,
    rating: 4.7,
    reviews: 75,
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=800&q=80',
    description: 'CH340G USB to TTL chipi bilan. Wi-Fi orqali IoT loyihalar qilish uchun.',
    status: 'active'
  },
  {
    name: 'Relay Modul - 4 Kanal 5V',
    category: 'Boshqa',
    price: 38000,
    oldPrice: null,
    badge: 'NEW',
    inStock: true,
    stockCount: 40,
    rating: 4.5,
    reviews: 32,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    description: '5V kuchlanishda ishlovchi 4 kanalli oqim o\'chirgich (Rele). 220V qurilmalarni boshqarish mumkin.',
    status: 'active'
  }
];

async function main() {
  console.log('Seeding products to PostgreSQL...');
  for (const p of products) {
    const created = await prisma.product.create({ data: p });
    console.log(`Created product: ${created.name}`);
  }
  console.log('Successfully seeded database!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
