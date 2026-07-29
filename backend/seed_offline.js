const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const IOT_KEYWORDS = [
  'Arduino Uno R3', 'ESP32 DevKit', 'Raspberry Pi 4', 'Arduino Nano',
  'Arduino Mega 2560', 'ESP8266 NodeMCU', 'STM32F103', 'RP2040',
  'ESP32-S3', 'ESP32-C3', 'Raspberry Pi Pico', 'Arduino Uno R4',
  'ESP-WROOM-32', 'Arduino Mega', 'Teensy 4.0',
  'HC-05 Bluetooth', 'HC-06 Bluetooth', 'nRF24L01', 'nRF52840',
  'XBee ZigBee', 'CC1101 RF', 'LoRa SX1278', 'LoRa RA-02',
  'ESP32 BLE', 'Bluetooth Low Energy Module', 'Nordic nRF52',
  'Si4463 RF', 'RFM69HCW', 'NRF905', 'HC-12 Wireless',
  'SIM800L', 'SIM800C', 'SIM7600', 'A7670',
  'Quectel EC25', 'BG95 LTE', 'SIM7070', 'SIM800A',
  'SIM5360', 'SIM7600E',
  'NEO-6M GPS', 'NEO-M8N GPS', 'L76 GNSS', 'BN-220 GPS',
  'GPS Module Ublox',
  'DHT11', 'DHT22', 'SHT30', 'SHT31',
  'BME280', 'BMP280', 'DS18B20', 'LM35',
  'TMP36', 'AHT20',
  'MQ-2 Gas Sensor', 'MQ-3', 'MQ-5', 'MQ-7',
  'MQ-9', 'MQ-135', 'CCS811', 'SGP30',
  'PMS5003', 'SDS011',
  'HC-SR501 PIR', 'RCWL-0516', 'BH1750 Light', 'TSL2561',
  'LDR Photoresistor', 'VL53L0X', 'VL53L1X', 'HC-SR04',
  'APDS9960', 'IR Obstacle Sensor',
  'ACS712', 'ACS758', 'INA219', 'INA226',
  'SCT-013', 'ZMPT101B', 'PZEM-004T',
  'ADS1115', 'HX711', 'MAX31855', 'PCF8574', 'MCP23017',
  'RC522 RFID', 'PN532 NFC', 'R307 Fingerprint', 'AS608 Fingerprint',
  'MFRC522', 'EM-18 RFID',
  'SW-420 Vibration', 'Flame Sensor', 'Water Level Sensor', 'Soil Moisture Sensor',
  'SG90 Servo', 'MG996R Servo', '28BYJ-48 Stepper',
];

function categorizeProduct(name) {
  const n = name.toLowerCase();
  if (/arduino|uno|nano|mega|due|leonardo|micro/.test(n)) return 'Arduino';
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
  if (/bluetooth|hc-05|hc-06|nrf|xbee|zigbee|cc1101|rf|wireless|si4463|rfm69/.test(n)) return 'Wireless';
  if (/lora|sx1276|sx1278|ra-02/.test(n)) return 'Wireless';
  if (/sim800|sim7600|sim7070|a7670|quectel|bg95|gsm|lte|cellular/.test(n)) return 'Wireless';
  if (/gps|gnss|neo-6|neo-m8|bn-220|ublox/.test(n)) return 'GPS';
  if (/oled|ssd1306|lcd|tft|ili9341|nextion|display|ekran|displey/.test(n)) return 'Displeylar';
  if (/rc522|rfid|pn532|nfc|fingerprint|as608|r307|em-18/.test(n)) return 'RFID & NFC';
  if (/ads1115|hx711|max31855|adc|mcp23017|pcf8574|i2c|spi/.test(n)) return 'Boshqa';
  if (/raspberry|pi 4|pi 3|pi zero/.test(n)) return 'Raspberry Pi';
  return 'Boshqa';
}

async function main() {
  console.log('🌱 Katta Offline Seeding boshlanmoqda (DigiKeysiz)...');

  const productsToInsert = IOT_KEYWORDS.map((name, index) => {
    return {
      name,
      category: categorizeProduct(name),
      price: 0,
      oldPrice: 0,
      stockCount: 0,
      inStock: false,
      rating: 5.0,
      reviews: 0,
      image: `https://picsum.photos/seed/${index + 100}/400/400`,
      description: `${name} moduli. Sklad va narxlarni Admin paneldan kiriting.`,
      status: 'active'
    };
  });

  console.log(`⏳ ${productsToInsert.length} ta mahsulot bazaga yozilmoqda...`);
  
  await prisma.product.createMany({
    data: productsToInsert,
    skipDuplicates: true
  });

  const bannerCount = await prisma.banner.count()
  if (bannerCount === 0) {
    await prisma.banner.create({
      data: {
        title: 'Barcha Elektronika Modullari',
        description: "Eng zo'r sensorlar va platalar",
        image: 'https://picsum.photos/seed/banner2/1920/600',
        link: '/products',
        status: 'active',
        order: 1,
      },
    })
  }

  console.log(`✅ Hammasi tayyor! ${productsToInsert.length} ta tovar qo'shildi! Narx va sklad: 0.`);
}

main()
  .catch(e => { console.error('❌ Xato:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
