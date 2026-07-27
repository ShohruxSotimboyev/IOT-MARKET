const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function clear() {
  console.log('🗑️  Barcha ma\'lumotlar tozalanmoqda...\n');

  // 1. Bog'liq jadvallardan boshlaymiz (foreign key tartibi)
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

  await prisma.product.deleteMany();
  console.log('✅ Mahsulotlar o\'chirildi');

  await prisma.readyProduct.deleteMany();
  console.log('✅ Tayyor mahsulotlar o\'chirildi');

  await prisma.banner.deleteMany();
  console.log('✅ Bannerlar o\'chirildi');

  await prisma.supplier.deleteMany();
  console.log('✅ Postavshiklar o\'chirildi');

  await prisma.category.deleteMany();
  console.log('✅ Kategoriyalar o\'chirildi');

  // 2. Foydalanuvchilarni tozalash (SuperAdmin qoldiriladi)
  const superAdmin = await prisma.user.findFirst({ where: { role: 'superadmin' } });
  if (superAdmin) {
    // SuperAdminning ham buyurtmalari, xabarlari, sharhlari o'chiriladi
    await prisma.user.deleteMany({ where: { id: { not: superAdmin.id } } });
    console.log('✅ Barcha foydalanuvchilar o\'chirildi (SuperAdmin qoldirildi)');

    // SuperAdminni reset qilish
    const hash = await bcrypt.hash('SuperAdmin123!', 12);
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: {
        loginCount: 0,
        lastLogin: null,
        refreshToken: null,
      }
    });
    console.log('✅ SuperAdmin reset qilindi');
  } else {
    // SuperAdmin yo'q - yangi yaratish
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
  console.log('📊 Mahsulotlar: 0');
  console.log('📦 Buyurtmalar: 0');
  console.log('💬 Xabarlar: 0');
  console.log('⭐ Sharhlar: 0');
  console.log('📋 Ombor loglari: 0');
  console.log('👥 Foydalanuvchilar: 1 (SuperAdmin)');
}

clear()
  .catch(e => {
    console.error('❌ Xato:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
