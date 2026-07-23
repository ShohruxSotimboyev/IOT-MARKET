const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function categorizeProducts() {
  const products = await prisma.product.findMany();
  
  let updated = 0;
  
  for (const p of products) {
    let newCat = 'Accessories';
    const name = p.name.toLowerCase();
    
    if (name.includes('arduino') || name.includes('uno') || name.includes('mega') || name.includes('nano')) {
      newCat = 'Arduino';
    } else if (name.includes('raspberry') || name.includes('pi') || name.includes('rp2040')) {
      newCat = 'Raspberry Pi';
    } else if (name.includes('esp32') || name.includes('esp8266') || name.includes('nodemcu') || name.includes('esp-')) {
      newCat = 'ESP Modullar';
    } else if (name.includes('sensor') || name.includes('dht') || name.includes('mq-') || name.includes('hc-sr') || name.includes('sht') || name.includes('bmp') || name.includes('bme') || name.includes('ds18b20')) {
      newCat = 'Sensorlar';
    } else if (name.includes('motor') || name.includes('servo') || name.includes('stepper') || name.includes('sg90') || name.includes('mg996') || name.includes('l298n')) {
      newCat = 'Motorlar';
    } else if (name.includes('display') || name.includes('oled') || name.includes('tft') || name.includes('lcd') || name.includes('e-ink') || name.includes('matrix')) {
      newCat = 'Displeylar';
    } else if (name.includes('relay') || name.includes('zigbee') || name.includes('smart') || name.includes('lora')) {
      newCat = 'Smart Home';
    } else if (name.includes('multimeter') || name.includes('soldering') || name.includes('tester')) {
      newCat = 'Asboblar';
    }

    if (p.category !== newCat) {
      await prisma.product.update({
        where: { id: p.id },
        data: { category: newCat }
      });
      updated++;
    }
  }
  
  // Create these categories in DB if they don't exist
  const uniqueCats = ['Arduino', 'Raspberry Pi', 'ESP Modullar', 'Sensorlar', 'Motorlar', 'Displeylar', 'Smart Home', 'Asboblar', 'Accessories'];
  for (const c of uniqueCats) {
    await prisma.category.upsert({
      where: { name: c },
      update: {},
      create: { name: c }
    });
  }

  console.log(`Bajarildi! ${updated} ta mahsulot kategoriyasi to'g'rilandi.`);
}

categorizeProducts().finally(() => prisma.$disconnect());