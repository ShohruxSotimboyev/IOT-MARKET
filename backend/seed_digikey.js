const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

require('dotenv').config();

const clientId = process.env.DIGIKEY_CLIENT_ID;
const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;

// UZS Exchange Rate (approximate)
const USD_TO_UZS = 12600;

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
      Limit: 15 // Limit per keyword to not overload db initially
    })
  });
  
  if (!searchRes.ok) throw new Error('API qidiruvida xatolik: ' + await searchRes.text());
  const data = await searchRes.json();
  return (data.ExactMatches && data.ExactMatches.length > 0) ? data.ExactMatches : (data.Products || []);
}

async function seed() {
  try {
    console.log('1. DigiKey Token olinmoqda...');
    const token = await getDigiKeyToken();
    console.log('Token olindi.');

    console.log('2. DigiKey postavshigini yaratish yoki topish...');
    let supplier = await prisma.supplier.findFirst({
      where: { name: 'DigiKey Electronics' }
    });

    if (!supplier) {
      supplier = await prisma.supplier.create({
        data: {
          name: 'DigiKey Electronics',
          contact: 'API Integration',
          phone: '+1 800-344-4539',
          address: '701 Brooks Avenue South, Thief River Falls, MN 56701 USA'
        }
      });
      console.log('Yangi postavshik yaratildi:', supplier.name);
    } else {
      console.log('Postavshik topildi:', supplier.name);
    }

    console.log('3. Kategoriyalar tayyorlanmoqda...');
    const categoryName = 'Development Boards';
    let category = await prisma.category.findUnique({ where: { name: categoryName }});
    if (!category) {
      category = await prisma.category.create({ data: { name: categoryName }});
    }

    const keywords = ['arduino uno', 'esp32 devkit', 'raspberry pi 4'];
    
    console.log('4. Mahsulotlarni qidirish va saqlash boshlandi...');
    let addedCount = 0;

    for (const keyword of keywords) {
      console.log(`Qidirilmoqda: "${keyword}"...`);
      const products = await searchDigiKeyProducts(token, keyword);
      if (products.length > 0) {
        console.log('Sample product keys:', Object.keys(products[0]));
        console.log('UnitPrice:', products[0].UnitPrice, 'PhotoUrl:', products[0].PhotoUrl);
      }
      
      for (const p of products) {
        // Skip if no price or image
        if (!p.UnitPrice || !p.PhotoUrl) continue;

        const name = p.Description?.ProductDescription || p.ManufacturerProductNumber;
        const description = p.DetailedDescription || 'DigiKey orqali import qilingan mahsulot.';
        
        // Price logic:
        const costUsd = p.UnitPrice;
        const costUzs = Math.round(costUsd * USD_TO_UZS);
        const sellUzs = Math.round(costUzs * 1.3); // +30% margin
        
        // Stock logic:
        const stock = p.QuantityAvailable || 50;

        // Ensure unique names (or handle duplicates gracefully)
        const existing = await prisma.product.findFirst({ where: { name } });
        if (existing) {
          console.log(` - O'tkazib yuborildi (Mavjud): ${name}`);
          continue;
        }

        await prisma.product.create({
          data: {
            name: name.substring(0, 100), // Max length safety
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
        
        console.log(` + Qo'shildi: ${name.substring(0, 40)}... | Zakupka: ${costUzs} UZS | Sotish: ${sellUzs} UZS`);
        addedCount++;
      }
    }

    console.log(`\nBajarildi! Jami ${addedCount} ta haqiqiy mahsulot bazaga qo'shildi.`);
  } catch (err) {
    console.error('\nSeed jarayonida xatolik:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
