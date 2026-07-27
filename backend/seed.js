const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

const clientId = process.env.DIGIKEY_CLIENT_ID;
const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;

const USD_TO_UZS = 12600;
const MAX_PRODUCTS = 500;

const delay = ms => new Promise(res => setTimeout(res, ms));

// ─── IoT uchun asosiy 100 ta kalit so'z ────────────────────────────────────
const IOT_KEYWORDS = [
  // Development Boards (1-15)
  'Arduino Uno R3', 'ESP32 DevKit', 'Raspberry Pi 4', 'Arduino Nano',
  'Arduino Mega 2560', 'ESP8266 NodeMCU', 'STM32F103', 'RP2040',
  'ESP32-S3', 'ESP32-C3', 'Raspberry Pi Pico', 'Arduino Uno R4',
  'ESP-WROOM-32', 'Arduino Mega', 'Teensy 4.0',

  // Bluetooth & Wireless Modules (16-30)
  'HC-05 Bluetooth', 'HC-06 Bluetooth', 'nRF24L01', 'nRF52840',
  'XBee ZigBee', 'CC1101 RF', 'LoRa SX1278', 'LoRa RA-02',
  'ESP32 BLE', 'Bluetooth Low Energy Module', 'Nordic nRF52',
  'Si4463 RF', 'RFM69HCW', 'NRF905', 'HC-12 Wireless',

  // Cellular & GSM Modules (31-40)
  'SIM800L', 'SIM800C', 'SIM7600', 'A7670',
  'Quectel EC25', 'BG95 LTE', 'SIM7070', 'SIM800A',
  'SIM5360', 'SIM7600E',

  // GPS Modules (41-45)
  'NEO-6M GPS', 'NEO-M8N GPS', 'L76 GNSS', 'BN-220 GPS',
  'GPS Module Ublox',

  // Temperature & Humidity Sensors (46-55)
  'DHT11', 'DHT22', 'SHT30', 'SHT31',
  'BME280', 'BMP280', 'DS18B20', 'LM35',
  'TMP36', 'AHT20',

  // Gas & Air Quality Sensors (56-65)
  'MQ-2 Gas Sensor', 'MQ-3', 'MQ-5', 'MQ-7',
  'MQ-9', 'MQ-135', 'CCS811', 'SGP30',
  'PMS5003', 'SDS011',

  // Motion & Proximity Sensors (66-75)
  'HC-SR501 PIR', 'RCWL-0516', 'BH1750 Light', 'TSL2561',
  'LDR Photoresistor', 'VL53L0X', 'VL53L1X', 'HC-SR04',
  'APDS9960', 'IR Obstacle Sensor',

  // Current & Voltage Sensors (76-82)
  'ACS712', 'ACS758', 'INA219', 'INA226',
  'SCT-013', 'ZMPT101B', 'PZEM-004T',

  // ADC & Interface (83-87)
  'ADS1115', 'HX711', 'MAX31855', 'PCF8574', 'MCP23017',

  // RFID & NFC (88-93)
  'RC522 RFID', 'PN532 NFC', 'R307 Fingerprint', 'AS608 Fingerprint',
  'MFRC522', 'EM-18 RFID',

  // Motion & Miscellaneous Sensors (94-97)
  'SW-420 Vibration', 'Flame Sensor', 'Water Level Sensor', 'Soil Moisture Sensor',

  // Actuators & Motors (98-100)
  'SG90 Servo', 'MG996R Servo', '28BYJ-48 Stepper',
];

// ─── IoT kategoriyalari ─────────────────────────────────────────────────────
function categorizeProduct(name) {
  const n = name.toLowerCase();
  if (/arduino|uno|nano mega|due|leonardo|micro/.test(n)) return 'Arduino';
  if (/esp32|esp8266|nodemcu|wemos|d1 mini|esp-wroom|esp-wrover/.test(n)) return 'ESP Modullar';
  if (/raspberry|pi pico|pico w/.test(n)) return 'Raspberry Pi';
  if (/stm32|teensy|rp2040|nrf52|nrf24|atmega/.test(n)) return 'Development Boards';
  if (/dht|sht|bme|bmp|ds18b20|lm35|tmp36|aht|temperature|humidity/.test(n)) return 'Sensorlar';
  if (/mq-|ccs811|sgp30|pms5003|sds011|gas|air quality/.test(n)) return 'Sensorlar';
  if (/pir|hc-sr04|ultrasonic|infrared|ir obstacle|apds|proximity|motion|rcwl|reed|vibration|sw-420/.test(n)) return 'Sensorlar';
  if (/bh1750|tsl2561|ldr|light|photoresistor/.test(n)) return 'Sensorlar';
  if (/vl53l0x|vl53l1x|tof|lidar/.test(n)) return 'Sensorlar';
  if (/acs712|acs758|ina219|ina226|sct-013|zmpt|pzem|current|voltage/.test(n)) return 'Sensorlar';
  if (/soil moisture|water level|ph sensor/.test(n)) return 'Sensorlar';
  if (/flame|fire|smoke/.test(n)) return 'Sensorlar';
  if (/servo|sg90|mg996|stepper|28byj|a4988|drv8825/.test(n)) return 'Motorlar';
  if (/l298|l293|motor driver/.test(n)) return 'Motorlar';
  if (/relay|rele/.test(n)) return 'Boshqa';
  if (/bluetooth|hc-05|hc-06|nrf.*l01|nrf.*l02|xbee|zigbee|cc1101|rf module|wireless|nrf905|si4463|rfm69/.test(n)) return 'Wireless';
  if (/lora|sx1276|sx1278|ra-02/.test(n)) return 'Wireless';
  if (/sim800|sim7600|sim7070|a7670|quectel|bg95|gsm|lte|cellular/.test(n)) return 'Wireless';
  if (/gps|gnss|neo-6|neo-m8|bn-220|ublox/.test(n)) return 'GPS';
  if (/oled|ssd1306|lcd|tft|ili9341|nextion|display|ekran|displey/.test(n)) return 'Displeylar';
  if (/rc522|rfid|pn532|nfc|fingerprint|as608|r307|em-18/.test(n)) return 'RFID & NFC';
  if (/ads1115|hx711|max31855|adc|mcp23017|pcf8574|i2c|spi/.test(n)) return 'Boshqa';
  if (/raspberry|pi 4|pi 3|pi zero/.test(n)) return 'Raspberry Pi';
  return 'Boshqa';
}

// ─── Narxni hisoblash ───────────────────────────────────────────────────────
function calculatePrices(costUsd) {
  const costUzs = Math.round(costUsd * USD_TO_UZS);
  const sellUzs = Math.round(costUzs * 1.3); // 30% marja
  return { costUzs, sellUzs };
}

// ─── Badge aniqlash ─────────────────────────────────────────────────────────
function getBadge(product) {
  const name = (product.Description?.ProductDescription || '').toLowerCase();
  if (/new|latest|2024|2025/.test(name)) return 'NEW';
  if (/best|popular|top/.test(name)) return 'BEST';
  return null;
}

// ─── DigiKey Token olish ────────────────────────────────────────────────────
async function getDigiKeyToken() {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'client_credentials');

  const tokenRes = await fetch('https://api.digikey.com/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!tokenRes.ok) throw new Error('Token olishda xatolik: ' + await tokenRes.text());
  const data = await tokenRes.json();
  return data.access_token;
}

// ─── DigiKey API da qidirish ────────────────────────────────────────────────
async function searchDigiKeyProducts(token, keyword, limit = 10) {
  const searchRes = await fetch('https://api.digikey.com/products/v4/search/keyword', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-DIGIKEY-Client-Id': clientId,
      'X-DIGIKEY-Locale-Site': 'US',
      'X-DIGIKEY-Locale-Language': 'en',
      'X-DIGIKEY-Locale-Currency': 'USD',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      Keywords: keyword,
      Limit: limit
    })
  });

  if (!searchRes.ok) throw new Error(`API xatolik (${keyword}): ${searchRes.status}`);
  const data = await searchRes.json();
  return (data.ExactMatches && data.ExactMatches.length > 0) ? data.ExactMatches : (data.Products || []);
}

// ─── Asosiy seed funksiyasi ────────────────────────────────────────────────
async function seed() {
  try {
    console.log('🔌 DigiKey API ga ulanmoqda...\n');

    // 1. SuperAdmin
    let superAdmin = await prisma.user.findFirst({ where: { email: 'superadmin@iotmarket.uz' } });
    if (!superAdmin) {
      const hash = await bcrypt.hash('SuperAdmin123!', 12);
      superAdmin = await prisma.user.create({
        data: {
          username: 'SuperAdmin',
          email: 'superadmin@iotmarket.uz',
          password: hash,
          role: 'superadmin',
          isVerified: true,
          phone: '+998901234568',
        },
      });
      console.log('✅ SuperAdmin yaratildi');
    }

    // 2. DigiKey Token
    const token = await getDigiKeyToken();
    console.log('✅ Token olindi\n');

    // 3. Postavshik
    let supplier = await prisma.supplier.findFirst({ where: { name: 'DigiKey Electronics' } });
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'DigiKey Electronics',
          contact: 'API Integration',
          phone: '+1 800-344-4539',
          address: '701 Brooks Avenue South, Thief River Falls, MN 56701 USA'
        }
      });
    }
    console.log('✅ Postavshik tayyor:', supplier.name);

    // 4. Kategoriyalar
    const categoryNames = [
      'Arduino', 'ESP Modullar', 'Raspberry Pi', 'Development Boards',
      'Sensorlar', 'Motorlar', 'Displeylar', 'Wireless', 'GPS',
      'RFID & NFC', 'Boshqa'
    ];
    const categories = {};
    for (const name of categoryNames) {
      let cat = await prisma.category.findUnique({ where: { name } });
      if (!cat) cat = await prisma.category.create({ data: { name } });
      categories[name] = cat;
    }
    console.log('✅ Kategoriyalar tayyor\n');

    // 5. Mahsulotlarni qidirish va saqlash
    console.log(`🔍 ${IOT_KEYWORDS.length} ta kalit so'z bo'yicha qidiruv boshlandi...\n`);
    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < IOT_KEYWORDS.length; i++) {
      const keyword = IOT_KEYWORDS[i];

      if (addedCount >= MAX_PRODUCTS) {
        console.log(`\n⚠️  ${MAX_PRODUCTS} ta mahsulot limitiga yetildi! Qidiruv to'xtatildi.`);
        break;
      }

      process.stdout.write(`[${i + 1}/${IOT_KEYWORDS.length}] "${keyword}" qidirilmoqda...`);

      try {
        const products = await searchDigiKeyProducts(token, keyword, 5);

        let foundForThis = 0;
        for (const p of products) {
          if (addedCount >= MAX_PRODUCTS) break;

          const name = (p.Description?.ProductDescription || p.ManufacturerProductNumber || '').trim();
          if (!name || name.length < 3) continue;

          // Takroriy tekshirish
          const existing = await prisma.product.findFirst({ where: { name } });
          if (existing) { skippedCount++; continue; }

          const category = categorizeProduct(name + ' ' + (p.Description?.ProductDescription || ''));

          await prisma.product.create({
            data: {
              name: name.substring(0, 100),
              category,
              price: 0,
              costPrice: 0,
              oldPrice: null,
              image: p.PhotoUrl || `https://picsum.photos/seed/${encodeURIComponent(name.substring(0, 20))}/400/400`,
              description: p.DetailedDescription || `${name} - DigiKey orqali import qilingan IoT komponent.`,
              inStock: false,
              stockCount: 0,
              supplierId: supplier.id,
              badge: null,
              status: 'active',
              rating: 0,
              reviews: 0,
            }
          });

          addedCount++;
          foundForThis++;
        }

        console.log(` → +${foundForThis} (jami: ${addedCount})`);

        // Rate limiting - har 2 sekund kutish
        await delay(2000);

      } catch (err) {
        errorCount++;
        console.log(` → ❌ Xato: ${err.message}`);
        // Xatolik bo'lsa biroz ko'proq kutish
        if (err.message.includes('429') || err.message.includes('rate')) {
          console.log('   ⏳ Rate limit - 10 sekund kutish...');
          await delay(10000);
        } else {
          await delay(3000);
        }
      }
    }

    // 6. Banner
    const bannerCount = await prisma.banner.count();
    if (bannerCount === 0) {
      await prisma.banner.create({
        data: {
          title: 'IoT Komponentlari Do\'koni',
          description: 'Eng sifatli Arduino, ESP32, sensor va boshqa IoT komponentlari!',
          image: 'https://picsum.photos/seed/iotbanner/1920/600',
          link: '/products',
          status: 'active',
          order: 1,
        },
      });
    }

    // 7. Natijalar
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.product.groupBy({ by: ['category'], _count: true });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED MUVAFFAQIYATLI BAJARILDI!');
    console.log('='.repeat(60));
    console.log(`📊 Jami mahsulotlar: ${totalProducts}`);
    console.log(`✅ Qo'shildi: ${addedCount}`);
    console.log(`⏭️  O'tkazildi (takroriy): ${skippedCount}`);
    console.log(`❌ Xatoliklar: ${errorCount}`);
    console.log(`📦 Max limit: ${MAX_PRODUCTS}`);
    console.log('\n📁 Kategoriyalar:');
    totalCategories.forEach(c => {
      console.log(`   ${c.category}: ${c._count} ta`);
    });
    console.log('\n📧 SuperAdmin: superadmin@iotmarket.uz');
    console.log('🔑 Parol: SuperAdmin123!');

  } catch (err) {
    console.error('\n❌ Seed jarayonida xatolik:', err.message);
    console.error(err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
