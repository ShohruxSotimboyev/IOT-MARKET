const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({ where: { role: 'admin' }, data: { role: 'superadmin' } });
  console.log('Promoted admins to superadmin');
}
main().finally(() => prisma.$disconnect());
