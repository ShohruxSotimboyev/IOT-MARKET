import { generateCatalog } from './generateCatalog'

const u = (id, sig) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&q=80${sig != null ? `&sig=${sig}` : ''}`

/** Six distinct gallery URLs from different photo ids */
function gallery(...photoIds) {
  return photoIds.slice(0, 6).map((pid, i) => u(pid, i + 1))
}

const BASE_PRODUCTS = [
  {
    id: 1, name: 'Arduino UNO R3', price: 89000, oldPrice: 120000,
    img: u('1608564697071-ddf911d81370', 0),
    images: gallery(
      '1608564697071-ddf911d81370',
      '1555668260-2206e6d90385',
      '1581091226825-a6a2a5aee158',
      '1518770660439-4636190af475',
      '1551808525-51a94da548ce',
      '1581092918056-0c4c3acd378c'
    ),
    cat: 'Arduino', badge: 'HOT', rating: 4.8, reviews: 128, inStock: true,
    tags: ['arduino', 'uno', 'avr', 'mikrokontroller'],
    desc: 'Arduino UNO R3 - eng mashhur mikrokontroller. ATmega328P asosida qurilgan, 14 ta raqamli va 6 ta analog pin. USB orqali dasturlash va keng hamjamiyat qo\'llab-quvvatlashi.',
  },
  {
    id: 2, name: 'ESP32 DevKit V1', price: 65000, oldPrice: null,
    img: u('1518770660439-4636190af475', 0),
    images: gallery(
      '1518770660439-4636190af475',
      '1607252650355-f7fd0460ccdb',
      '1633356122544-f134324a6cee',
      '1558494949-ef010cbdcc31',
      '1581092160562-40aa08e78837',
      '1526374965328-7a61d55dc638'
    ),
    cat: 'ESP Modullar', badge: 'NEW', rating: 4.9, reviews: 89, inStock: true,
    tags: ['esp32', 'wifi', 'bluetooth', 'devkit'],
    desc: 'ESP32 - WiFi va Bluetooth bilan jihozlangan kuchli mikrokontroller. IoT loyihalari uchun ideal. Dual-core 240MHz protsessor.',
  },
  {
    id: 3, name: 'Raspberry Pi 4 4GB', price: 750000, oldPrice: 850000,
    img: u('1563452965085-2e77e5bf2607', 0),
    images: gallery(
      '1563452965085-2e77e5bf2607',
      '1581092160562-40aa08e78837',
      '1597852696525-3459d4b0c0e1',
      '1614624532983-1e8a1f1e2b0e',
      '1550757783-54a7b752122a',
      '1485827404703-89b54fcc596e'
    ),
    cat: 'Raspberry Pi', badge: 'SALE', rating: 4.7, reviews: 245, inStock: true,
    tags: ['raspberry', 'pi', 'linux', 'sbc'],
    desc: 'Raspberry Pi 4 Model B 4GB RAM. Linux, Python va boshqa dasturlar uchun kuchli kompyuter. Gigabit Ethernet va USB 3.0.',
  },
  {
    id: 4, name: 'DHT22 Sensor', price: 28000, oldPrice: null,
    img: u('1558618666-fcd25c85cd64', 0),
    images: gallery(
      '1558618666-fcd25c85cd64',
      '1581091226825-a6a2a5aee158',
      '1558611848-73f962c986e6',
      '1572981778208-38408b08fbb6',
      '1582719478250-c89cae4dc85b',
      '1551288049-bebda4e38f71'
    ),
    cat: 'Sensorlar', badge: null, rating: 4.5, reviews: 67, inStock: true,
    tags: ['dht22', 'sensor', 'harorat', 'namlik'],
    desc: 'DHT22 - harorat va namlik sensori. -40 dan +80°C gacha o\'lchash imkoni. Yuqori aniqlik — ±0.5°C.',
  },
  {
    id: 5, name: 'OLED Display 0.96"', price: 32000, oldPrice: 45000,
    img: u('1551808525-51a94da548ce', 0),
    images: gallery(
      '1551808525-51a94da548ce',
      '1555949963-ff9fe0c870eb',
      '1587825140708-dfaf72ae4b06',
      '1460925895917-afdab827c52f',
      '1516321318423-f06f85e884b0',
      '1593508511116-86f42d668dc2'
    ),
    cat: 'Displeylar', badge: 'HOT', rating: 4.6, reviews: 156, inStock: true,
    tags: ['oled', 'display', 'i2c', 'ekran'],
    desc: '128x64 pixel OLED ekran. I2C interfeysi, juda oz quvvat sarflaydi. Arduino va ESP bilan mos.',
  },
  {
    id: 6, name: 'SG90 Servo Motor', price: 22000, oldPrice: null,
    img: u('1535378917042-10a22c95931a', 0),
    images: gallery(
      '1535378917042-10a22c95931a',
      '1558618666-fcd25c85cd64',
      '1581092918056-0c4c3acd378c',
      '1608564697071-ddf911d81370',
      '1555668260-2206e6d90385',
      '1504384308090-c894fdcc538d'
    ),
    cat: 'Motorlar', badge: null, rating: 4.4, reviews: 92, inStock: false,
    tags: ['servo', 'motor', 'sg90', 'robot'],
    desc: 'SG90 micro servo motor. Robotika va modellash uchun ideal. 180° aylanish diapazoni.',
  },
  {
    id: 7, name: 'NodeMCU ESP8266', price: 45000, oldPrice: 55000,
    img: u('1607252650355-f7fd0460ccdb', 0),
    images: gallery(
      '1607252650355-f7fd0460ccdb',
      '1518770660439-4636190af475',
      '1633356122544-f134324a6cee',
      '1620712947505-76e0d3b3e3e3',
      '1558494949-ef010cbdcc31',
      '1526374965328-7a61d55dc638'
    ),
    cat: 'ESP Modullar', badge: 'SALE', rating: 4.7, reviews: 203, inStock: true,
    tags: ['esp8266', 'nodemcu', 'wifi'],
    desc: 'NodeMCU ESP8266 - WiFi moduli. Arduino IDE bilan dasturlash mumkin. Built-in USB-UART.',
  },
  {
    id: 8, name: 'Raspberry Pi Zero 2 W', price: 280000, oldPrice: null,
    img: u('1581092160562-40aa08e78837', 0),
    images: gallery(
      '1581092160562-40aa08e78837',
      '1563452965085-2e77e5bf2607',
      '1597852696525-3459d4b0c0e1',
      '1614624532983-1e8a1f1e2b0e',
      '1550757783-54a7b752122a',
      '1485827404703-89b54fcc596e'
    ),
    cat: 'Raspberry Pi', badge: 'NEW', rating: 4.8, reviews: 44, inStock: true,
    tags: ['raspberry', 'zero', 'wifi'],
    desc: 'Raspberry Pi Zero 2W - kichik va arzon. WiFi va Bluetooth o\'rnatilgan. Quad-core 1GHz.',
  },
  {
    id: 9, name: 'Arduino Mega 2560', price: 145000, oldPrice: 180000,
    img: u('1555668260-2206e6d90385', 0),
    images: gallery(
      '1555668260-2206e6d90385',
      '1608564697071-ddf911d81370',
      '1581091226825-a6a2a5aee158',
      '1518770660439-4636190af475',
      '1581092918056-0c4c3acd378c',
      '1551808525-51a94da548ce'
    ),
    cat: 'Arduino', badge: null, rating: 4.6, reviews: 78, inStock: true,
    tags: ['arduino', 'mega', '2560'],
    desc: 'Arduino Mega 2560 - katta loyihalar uchun. 54 ta raqamli pin va 16 ta analog kirish.',
  },
  {
    id: 10, name: 'PIR Motion Sensor', price: 18000, oldPrice: null,
    img: u('1558618666-fcd25c85cd64', 'pir'),
    images: gallery(
      '1558618666-fcd25c85cd64',
      '1581091226825-a6a2a5aee158',
      '1518770660439-4636190af475',
      '1608564697071-ddf911d81370',
      '1535378917042-10a22c95931a',
      '1551808525-51a94da548ce'
    ),
    cat: 'Sensorlar', badge: null, rating: 4.3, reviews: 134, inStock: true,
    tags: ['pir', 'motion', 'sensor', 'harakat'],
    desc: 'PIR harakat sensori. Smart home uchun ideal. 7m masofani aniqlaydi. 5V quvvat.',
  },
  {
    id: 11, name: 'Smart Plug WiFi', price: 95000, oldPrice: 120000,
    img: u('1558002038-1055907df827', 0),
    images: gallery(
      '1558002038-1055907df827',
      '1593508511116-86f42d668dc2',
      '1572981778208-38408b08fbb6',
      '1551288049-bebda4e38f71',
      '1582719478250-c89cae4dc85b',
      '1460925895917-afdab827c52f'
    ),
    cat: 'Smart Home', badge: 'HOT', rating: 4.5, reviews: 312, inStock: true,
    tags: ['smart', 'plug', 'wifi', 'alexa'],
    desc: 'WiFi smart plug. Alexa va Google Home bilan mos keladi. Ilova orqali boshqarish.',
  },
  {
    id: 12, name: 'Digital Multimeter', price: 185000, oldPrice: 220000,
    img: u('1581092160562-40aa08e78837', 'mm'),
    images: gallery(
      '1581092160562-40aa08e78837',
      '1581092918056-0c4c3acd378c',
      '1587825140708-dfaf72ae4b06',
      '1558611848-73f962c986e6',
      '1551288049-bebda4e38f71',
      '1504384308090-c894fdcc538d'
    ),
    cat: 'Asboblar', badge: 'SALE', rating: 4.7, reviews: 89, inStock: true,
    tags: ['multimeter', 'asbob', 'o\'lchov'],
    desc: 'Professional raqamli multimetr. Kuchlanish, tok va qarshilikni o\'lchaydi. Auto-range.',
  },
]

export const PRODUCTS = [...BASE_PRODUCTS, ...generateCatalog(13)]

export const KITS = [
  { id: 101, name: 'Arduino Starter Kit', price: 250000, img: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=300&fit=crop', items: 32, badge: 'BEST' },
  { id: 102, name: 'ESP32 IoT Kit', price: 320000, img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop', items: 28, badge: 'NEW' },
  { id: 103, name: 'Smart Home Kit', price: 450000, img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop', items: 15, badge: 'HOT' },
  { id: 104, name: 'Robotics Kit', price: 380000, img: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=300&fit=crop', items: 45, badge: null },
]
