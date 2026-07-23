const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

const clientId = process.env.DIGIKEY_CLIENT_ID;
const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;

const USD_TO_UZS = 12600;

const delay = ms => new Promise(res => setTimeout(res, ms));

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

async function searchDigiKeyProducts(token, keyword) {
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
      Limit: 10 // Limit to 10 per keyword to avoid giant delays
    })
  });
  
  if (!searchRes.ok) throw new Error('API xatolik: ' + await searchRes.text());
  const data = await searchRes.json();
  return (data.ExactMatches && data.ExactMatches.length > 0) ? data.ExactMatches : (data.Products || []);
}

async function seedMassive() {
  try {
    console.log('1. DigiKey Token olinmoqda...');
    const token = await getDigiKeyToken();
    console.log('Token olindi.');

    let supplier = await prisma.supplier.findFirst({ where: { name: 'DigiKey Electronics' } });
    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: { name: 'DigiKey Electronics', contact: 'API Integration', phone: '+1 800-344-4539', address: 'USA' }
      });
    }

    const categoryName = 'Development Boards & Modules';
    let category = await prisma.category.findUnique({ where: { name: categoryName }});
    if (!category) category = await prisma.category.create({ data: { name: categoryName }});

    const rawKeywords = `
ESP32, ESP32-S3, ESP32-C3, ESP8266, Arduino Uno R4, Arduino Nano, Arduino Mega 2560, Raspberry Pi Pico, STM32F103, RP2040, ESP-WROOM-32, ESP-WROVER, HC-05 Bluetooth, HC-06 Bluetooth, nRF24L01, nRF52840, LoRa SX1278, LoRa RA-02, XBee ZigBee, CC1101 RF Module, SIM800L, SIM800C, SIM7600, A7670, Quectel EC25, BG95 LTE Cat M1, NEO-6M GPS, NEO-M8N GPS, L76 GNSS, SIM7070, DHT11, DHT22, SHT30, SHT31, BME280, BMP280, DS18B20, LM35, TMP36, AHT20, MQ-2, MQ-3, MQ-5, MQ-7, MQ-9, MQ-135, CCS811, SGP30, PMS5003, SDS011, IR HC-SR501, RCWL-0516, BH1750, TSL2561, LDR Photoresistor, VL53L0X, VL53L1X, HC-SR04, APDS9960, IR Obstacle Sensor, ACS712, ACS758, INA219, INA226, SCT-013, ZMPT101B, PZEM-004T, ADS1115, HX711, MAX31855, RFID RC522, PN532 NFC, Fingerprint R307, AS608 Fingerprint, MFRC522, RFID Tag, NFC Tag, Reed Switch, Vibration Sensor SW-420, Flame Sensor, SG90 Servo, MG996R Servo, Stepper 28BYJ-48, A4988 Driver, DRV8825, Relay 1 Channel, Relay 2 Channel, Relay 4 Channel, Solid State Relay, L298N Motor Driver, TP4056 Charger, XL4015 Buck Converter, LM2596, OLED SSD1306, TFT ILI9341, LCD1602, LCD2004, Nextion Display, E-Ink Display, MAX7219 LED Matrix
    `;
    
    // Split, trim, remove empty
    const keywords = rawKeywords.split(',').map(k => k.trim().replace(/\n/g, '')).filter(k => k.length > 0);
    
    console.log(`4. Jami ${keywords.length} ta kalit so'z bo'yicha qidiruv boshlandi...`);
    let addedCount = 0;

    for (const keyword of keywords) {
      console.log(`\n--> Qidirilmoqda: "${keyword}"...`);
      try {
        const products = await searchDigiKeyProducts(token, keyword);
        
        for (const p of products) {
          if (!p.UnitPrice || !p.PhotoUrl) continue;

          const name = p.Description?.ProductDescription || p.ManufacturerProductNumber;
          const description = p.DetailedDescription || 'DigiKey orqali import qilingan mahsulot.';
          
          const costUsd = p.UnitPrice;
          const costUzs = Math.round(costUsd * USD_TO_UZS);
          const sellUzs = Math.round(costUzs * 1.3); // +30% margin
          const stock = p.QuantityAvailable || 50;

          // Deduplicate
          const existing = await prisma.product.findFirst({ where: { name } });
          if (existing) continue;

          await prisma.product.create({
            data: {
              name: name.substring(0, 100),
              category: categoryName,
              price: sellUzs,
              costPrice: costUzs,
              image: p.PhotoUrl,
              description: description,
              inStock: stock > 0,
              stockCount: stock,
              supplierId: supplier.id,
              badge: 'NEW'
            }
          });
          
          addedCount++;
        }
        console.log(`[OK] Shu vaqtgacha ${addedCount} ta mahsulot qo'shildi.`);
        
        // Sleep to avoid rate limiting (e.g. 2 seconds per keyword)
        await delay(1000); 

      } catch(err) {
        console.log(`[XATO] "${keyword}" uchun xato: ${err.message}`);
        await delay(3000); // Wait longer on error
      }
    }

    console.log(`\nBajarildi! Jami ${addedCount} ta haqiqiy mahsulot bazaga qo'shildi.`);
  } catch (err) {
    console.error('\nSeed jarayonida xatolik:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedMassive();
