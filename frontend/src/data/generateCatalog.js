/** Unique Unsplash photo ids for IoT / electronics imagery */
const PHOTO_POOL = [
  '1608564697071-ddf911d81370',
  '1518770660439-4636190af475',
  '1563452965085-2e77e5bf2607',
  '1558618666-fcd25c85cd64',
  '1551808525-51a94da548ce',
  '1535378917042-10a22c95931a',
  '1607252650355-f7fd0460ccdb',
  '1581092160562-40aa08e78837',
  '1555668260-2206e6d90385',
  '1558002038-1055907df827',
  '1581091226825-a6a2a5aee158',
  '1581092918056-0c4c3acd378c',
  '1587825140708-dfaf72ae4b06',
  '1558494949-ef010cbdcc31',
  '1620712947505-76e0d3b3e3e3',
  '1633356122544-f134324a6cee',
  '1550757783-54a7b752122a',
  '1614624532983-1e8a1f1e2b0e',
  '1597852696525-3459d4b0c0e1',
  '1504384308090-c894fdcc538d',
  '1526374965328-7a61d55dc638',
  '1555949963-ff9fe0c870eb',
  '1460925895917-afdab827c52f',
  '1551288049-bebda4e38f71',
  '1485827404703-89b54fcc596e',
  '1516321318423-f06f85e884b0',
  '1558611848-73f962c986e6',
  '1582719478250-c89cae4dc85b',
  '1572981778208-38408b08fbb6',
  '1593508511116-86f42d668dc2',
]

const BADGES = ['HOT', 'NEW', 'SALE', null, null, null]

const CATALOG = [
  {
    cat: 'Arduino',
    tags: ['arduino', 'mikrokontroller', 'mcu', 'avr', 'uno'],
    names: [
      'Arduino UNO R4 WiFi', 'Arduino Nano 33 IoT', 'Arduino Leonardo', 'Arduino Pro Mini 5V',
      'Arduino Due', 'Arduino MKR WiFi 1010', 'Arduino Ethernet Shield', 'Arduino Motor Shield R3',
      'Arduino Sensor Shield V5', 'Arduino Proto Shield', 'Arduino LCD Keypad Shield', 'Arduino CNC Shield V3',
      'Arduino ISP Programmer', 'Arduino Cable USB-A to B', 'Arduino Starter Bundle Pro',
    ],
  },
  {
    cat: 'ESP Modullar',
    tags: ['esp32', 'esp8266', 'wifi', 'bluetooth', 'iot', 'nodemcu'],
    names: [
      'ESP32-S3 DevKitC-1', 'ESP32-C3 SuperMini', 'ESP32-CAM OV2640', 'ESP32 WROOM-32U',
      'ESP8266 ESP-01S', 'Wemos D1 Mini Pro', 'ESP32 LoRa SX1278', 'ESP32 Touch LCD 2.8"',
      'ESP32 Audio Kit', 'ESP32 Ethernet Kit', 'ESP32 Relay Module 4ch', 'ESP32 Battery Shield',
      'ESP-Prog Debugger', 'ESP32 Antenna 2.4GHz', 'TTGO T-Display ESP32',
    ],
  },
  {
    cat: 'Raspberry Pi',
    tags: ['raspberry', 'rpi', 'linux', 'sbc', 'pi'],
    names: [
      'Raspberry Pi 5 8GB', 'Raspberry Pi 4 2GB', 'Raspberry Pi 400', 'Raspberry Pi Pico W',
      'Raspberry Pi Camera Module 3', 'Raspberry Pi Official Case', 'Raspberry Pi Active Cooler',
      'Raspberry Pi PoE+ HAT', 'Raspberry Pi Sense HAT', 'Raspberry Pi Touch Display 7"',
      'Raspberry Pi SSD Kit', 'Raspberry Pi Power Supply 27W', 'Raspberry Pi GPIO Extension',
      'Raspberry Pi High Quality Camera', 'Raspberry Pi Compute Module 4 IO',
    ],
  },
  {
    cat: 'Sensorlar',
    tags: ['sensor', 'dht', 'pir', 'mq', 'ultrasonic', 'temperature', 'humidity'],
    names: [
      'BME280 I2C Sensor', 'DS18B20 Waterproof Probe', 'HC-SR04 Ultrasonic', 'MQ-2 Gas Sensor',
      'MQ-7 CO Sensor', 'MQ-135 Air Quality', 'BH1750 Light Sensor', 'MPU6050 Gyro Accel',
      'HCSR501 PIR Module', 'Soil Moisture Sensor', 'Rain Drop Sensor', 'Sound Detection Module',
      'Flame Sensor IR', 'TDS Water Quality', 'Hall Effect Sensor A3144',
      'Color Sensor TCS3200', 'Heart Rate MAX30102', 'GPS NEO-6M Module',
    ],
  },
  {
    cat: 'Displeylar',
    tags: ['display', 'oled', 'lcd', 'tft', 'screen', 'e-ink'],
    names: [
      'OLED 1.3" I2C White', 'TFT 2.4" ILI9341', 'TFT 3.5" Resistive Touch', 'LCD 16x2 I2C Blue',
      'LCD 20x4 Green Backlight', 'E-Ink 2.9" Waveshare', 'E-Ink 4.2" Tri-color', 'LED Matrix 8x8 MAX7219',
      'Segment Display 4-digit TM1637', 'Nextion 2.8" HMI', 'IPS 5" HDMI Display', 'Round LCD GC9A01',
      'OLED 0.91" 128x32', 'TFT 1.8" ST7735', 'Dual OLED Module',
    ],
  },
  {
    cat: 'Motorlar',
    tags: ['motor', 'servo', 'stepper', 'driver', 'robot'],
    names: [
      'MG996R Metal Servo', 'DS3218 20kg Servo', 'NEMA 17 Stepper 1.8°', '28BYJ-48 Stepper 5V',
      'A4988 Stepper Driver', 'DRV8825 Driver Module', 'L298N Motor Driver', 'TB6612FNG Driver',
      'N20 DC Motor 12V', 'TT Motor Dual Gearbox', 'JGA25-370 DC Encoder', 'Brushless ESC 30A',
      'Motor Wheel 65mm', 'Omni Wheel 48mm', 'Linear Actuator 12V 100mm',
    ],
  },
  {
    cat: 'Smart Home',
    tags: ['smart', 'home', 'zigbee', 'relay', 'automation', 'wifi'],
    names: [
      'Zigbee Gateway Hub', 'Zigbee Door Sensor', 'Zigbee Temperature Sensor', 'Smart Bulb RGBW E27',
      'Smart Curtain Motor', 'WiFi Relay 2 Channel', 'Smart Doorbell Camera', 'Smart Thermostat',
      'RF Remote 433MHz 4ch', 'Smart Water Leak Sensor', 'Smart Gas Detector WiFi', 'Smart IR Blaster',
      'Smart Lock Zigbee', 'Smart Power Strip 4', 'Voice Assistant Speaker Dock',
      'Matter Thread Border Router', 'Smart Blinds Controller', 'Garage Door WiFi Controller',
    ],
  },
  {
    cat: 'Asboblar',
    tags: ['tool', 'solder', 'multimeter', 'power', 'lab'],
    names: [
      'Soldering Station 936', 'Solder Wire 0.8mm 50g', 'Flux Pen No-Clean', 'Desoldering Pump',
      'Helping Hands Stand', 'PCB Holder Magnifier', 'Wire Stripper Automatic', 'Heat Shrink Kit',
      'Oscilloscope DSO138 Kit', 'Logic Analyzer 24MHz', 'Lab PSU 30V 5A', 'USB Power Meter',
      'Precision Screwdriver Set', 'ESD Mat 60x40cm', 'Component Storage Box',
      'Hot Air Rework Station', 'Tweezers ESD Safe Set', 'Breadboard 830 Tie Points',
    ],
  },
]

function imgUrl(photoId, sig) {
  const s = sig != null ? `&sig=${sig}` : ''
  return `https://images.unsplash.com/photo-${photoId}?w=800&h=600&fit=crop&q=80${s}`
}

function uniquePhotos(seed, count = 6) {
  const picked = []
  let n = seed
  while (picked.length < count) {
    const id = PHOTO_POOL[n % PHOTO_POOL.length]
    if (!picked.includes(id)) picked.push(id)
    n += 5
  }
  return picked
}

function priceFor(cat, index) {
  const base = {
    Arduino: 45000,
    'ESP Modullar': 35000,
    'Raspberry Pi': 180000,
    Sensorlar: 15000,
    Displeylar: 28000,
    Motorlar: 22000,
    'Smart Home': 75000,
    Asboblar: 95000,
  }[cat] || 40000
  return base + (index % 17) * 3500 + (seedHash(cat, index) % 12000)
}

function seedHash(a, b) {
  return (a.length * 7 + b * 13) % 997
}

function badgeFor(i) {
  return BADGES[i % BADGES.length]
}

export function generateCatalog(startId = 13) {
  const products = []
  let id = startId
  let globalIndex = 0

  for (const group of CATALOG) {
    group.names.forEach((name, i) => {
      const photos = uniquePhotos(id + i * 3, 6)
      const price = priceFor(group.cat, i)
      const hasSale = badgeFor(globalIndex) === 'SALE'
      products.push({
        id,
        name,
        price,
        oldPrice: hasSale ? Math.round(price * 1.22) : null,
        img: imgUrl(photos[0], 0),
        images: photos.map((pid, idx) => imgUrl(pid, idx + 1)),
        cat: group.cat,
        badge: badgeFor(globalIndex),
        rating: 4.2 + (globalIndex % 8) * 0.1,
        reviews: 12 + (globalIndex * 17) % 400,
        inStock: globalIndex % 11 !== 0,
        tags: group.tags,
        desc: `${name} — ${group.cat} bo'limidagi professional IoT komponent. Arduino, ESP32 va smart home loyihalari uchun mos.`,
      })
      id += 1
      globalIndex += 1
    })
  }

  return products
}
