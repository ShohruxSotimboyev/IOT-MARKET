const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  await prisma.product.deleteMany();
  console.log('Products deleted');
  await prisma.$disconnect();
}

clear();
