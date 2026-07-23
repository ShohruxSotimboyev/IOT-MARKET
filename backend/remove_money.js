const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeMoney() {
  await prisma.product.updateMany({
    data: { price: 0, costPrice: 0, oldPrice: null }
  });
  console.log('Barcha mahsulotlar narxi 0 ga tushirildi.');
}

removeMoney().finally(() => prisma.$disconnect());
