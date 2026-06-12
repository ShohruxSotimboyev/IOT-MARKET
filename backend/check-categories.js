const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.product.groupBy({
  by: ['category'],
  _count: true,
}).then(r => {
  console.log(r)
  return prisma.$disconnect()
}).catch(e => {
  console.error(e)
  prisma.$disconnect()
})