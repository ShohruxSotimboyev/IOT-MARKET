const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function reset() {
  const r = await prisma.product.updateMany({
    data: {
      price: 0,
      costPrice: 0,
      oldPrice: null,
      rating: 0,
      reviews: 0,
      stockCount: 0,
      inStock: false,
      badge: null,
    }
  });
  console.log(`${r.count} ta mahsulot narxi/reytingi/soni 0 ga tushirildi`);
  await prisma.$disconnect();
}

reset();
