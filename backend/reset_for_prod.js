const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function reset() {
  console.log('🔄  Ma\'lumotlar tozalanmoqda (products saqlanadi)...\n');

  await prisma.orderItem.deleteMany();
  console.log('✅ OrderItemlar o\'chirildi');

  await prisma.order.deleteMany();
  console.log('✅ Buyurtmalar o\'chirildi');

  await prisma.message.deleteMany();
  console.log('✅ Xabarlar o\'chirildi');

  await prisma.review.deleteMany();
  console.log('✅ Sharhlar o\'chirildi');

  await prisma.inventoryLog.deleteMany();
  console.log('✅ Ombor loglari o\'chirildi');

  const updateProducts = await prisma.product.updateMany({
    data: { stockCount: 0, inStock: false }
  });
  console.log(`✅ Mahsulotlar stocki 0 ga tushirildi (${updateProducts.count} ta)`);

  await prisma.readyProduct.updateMany({
    data: { stockCount: 0, inStock: false }
  });
  console.log('✅ Tayyor mahsulotlar stocki 0 ga tushirildi');

  const superAdmin = await prisma.user.findFirst({ where: { role: 'superadmin' } });
  if (superAdmin) {
    await prisma.user.deleteMany({ where: { id: { not: superAdmin.id } } });
    console.log('✅ Barcha foydalanuvchilar o\'chirildi (SuperAdmin qoldirildi)');

    const hash = await bcrypt.hash('SuperAdmin123!', 12);
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        password: hash,
        loginCount: 0,
        lastLogin: null,
        refreshToken: null,
      }
    });
    console.log('✅ SuperAdmin reset qilindi');
  } else {
    const hash = await bcrypt.hash('SuperAdmin123!', 12);
    await prisma.user.create({
      data: {
        username: 'SuperAdmin',
        email: 'superadmin@iotmarket.uz',
        password: hash,
        role: 'superadmin',
        isVerified: true,
        phone: '+998901234568',
      },
    });
    console.log('✅ SuperAdmin yaratildi: superadmin@iotmarket.uz / SuperAdmin123!');
  }

  console.log('\n🎉 Barcha ma\'lumotlar tozalandi!');
  console.log('📦 Buyurtmalar: 0');
  console.log('👥 Mijozlar: 0');
  console.log('📋 Ombor loglari: 0');
  console.log('💬 Xabarlar: 0');
  console.log('⭐ Sharhlar: 0');
  console.log('📊 Mahsulotlar stocki: 0 (saqlab qolindi)');
  console.log('🔑 SuperAdmin: superadmin@iotmarket.uz / SuperAdmin123!');
}

reset()
  .catch(e => {
    console.error('❌ Xato:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
