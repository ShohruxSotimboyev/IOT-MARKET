export const CATEGORIES = [
  {
    id: 1, key: 'arduino', name: 'Arduino', icon: 'Cpu',
    sub: [
      { id: 11, name: 'Arduino UNO', items: ['Arduino UNO R3', 'Arduino UNO R4', 'Arduino Mini'] },
      { id: 12, name: 'Arduino Mega', items: ['Mega 2560', 'Mega ADK', 'Mega Pro'] },
      { id: 13, name: 'Arduino Nano', items: ['Nano 33 BLE', 'Nano Every', 'Nano Classic'] },
    ],
  },
  {
    id: 2, key: 'raspberry', name: 'Raspberry Pi', icon: 'CircuitBoard',
    sub: [
      { id: 21, name: 'Raspberry Pi 5', items: ['RPi 5 4GB', 'RPi 5 8GB', 'RPi 5 Case'] },
      { id: 22, name: 'Raspberry Pi 4', items: ['RPi 4 2GB', 'RPi 4 4GB', 'RPi 4 8GB'] },
      { id: 23, name: 'Pi Zero', items: ['Pi Zero W', 'Pi Zero 2W', 'Pi Zero Kit'] },
    ],
  },
  {
    id: 3, key: 'smart_home', name: 'Smart Home', icon: 'Home',
    sub: [
      { id: 31, name: 'Zigbee', items: ['Zigbee Hub', 'Zigbee Sensor', 'Zigbee Bulb'] },
      { id: 32, name: 'Z-Wave', items: ['Z-Wave Switch', 'Z-Wave Plug', 'Z-Wave Lock'] },
      { id: 33, name: 'WiFi Devices', items: ['Smart Plug', 'Smart Bulb', 'Smart Camera'] },
    ],
  },
  {
    id: 4, key: 'sensors', name: 'Sensorlar', icon: 'Radio',
    sub: [
      { id: 41, name: 'Harorat', items: ['DHT11', 'DHT22', 'DS18B20'] },
      { id: 42, name: 'Harakat', items: ['PIR Sensor', 'Ultrasonic', 'IR Sensor'] },
      { id: 43, name: 'Gaz', items: ['MQ-2', 'MQ-7', 'MQ-135'] },
    ],
  },
  {
    id: 5, key: 'esp', name: 'ESP Modullar', icon: 'Wifi',
    sub: [
      { id: 51, name: 'ESP32', items: ['ESP32 DevKit', 'ESP32-CAM', 'ESP32 WROOM'] },
      { id: 52, name: 'ESP8266', items: ['NodeMCU', 'Wemos D1', 'ESP-01'] },
      { id: 53, name: 'ESP-IDF', items: ['ESP32-S3', 'ESP32-C3', 'ESP32-H2'] },
    ],
  },
  {
    id: 6, key: 'motors', name: 'Motorlar', icon: 'Cog',
    sub: [
      { id: 61, name: 'Servo', items: ['SG90', 'MG996R', 'DS3218'] },
      { id: 62, name: 'Stepper', items: ['NEMA 17', '28BYJ-48', 'NEMA 23'] },
      { id: 63, name: 'DC Motor', items: ['N20 Motor', 'TT Motor', 'JGA25-370'] },
    ],
  },
  {
    id: 7, key: 'displays', name: 'Displeylar', icon: 'Monitor',
    sub: [
      { id: 71, name: 'OLED', items: ['0.96" OLED', '1.3" OLED', '2.42" OLED'] },
      { id: 72, name: 'TFT LCD', items: ['1.8" TFT', '2.4" TFT', '3.5" TFT'] },
      { id: 73, name: 'E-Paper', items: ['2.9" E-Ink', '4.2" E-Ink', '7.5" E-Ink'] },
    ],
  },
  {
    id: 8, key: 'tools', name: 'Asboblar', icon: 'Wrench',
    sub: [
      { id: 81, name: 'Lehimlash', items: ['Lehim qalam', 'Flux', 'Desolder pump'] },
      { id: 82, name: 'O\'lchov', items: ['Multimeter', 'Oscilloscope', 'Logic Analyzer'] },
      { id: 83, name: 'Quvvat', items: ['Lab Power Supply', 'USB Tester', 'Battery Charger'] },
    ],
  },
  {
    id: 9, key: 'accessories', name: 'Accessories', icon: 'Package',
    sub: [
      { id: 91, name: 'Kabellar va ulagichlar', items: [] },
      { id: 92, name: 'Quvvat va batareyalar', items: [] },
      { id: 93, name: 'LED va yorug\'lik', items: [] },
    ],
  },
]
