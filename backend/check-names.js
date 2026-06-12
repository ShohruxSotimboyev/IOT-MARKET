// check-names.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.product.findMany({
  where: { category: 'Umumiy' },
  take: 40,
  select: { name: true },
}).then(r => {
  r.forEach(p => console.log(p.name))
  return prisma.$disconnect()
})