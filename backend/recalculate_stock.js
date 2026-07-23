const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all products...');
  const products = await prisma.product.findMany({
    include: {
      inventoryLogs: true
    }
  });

  console.log(`Found ${products.length} products. Recalculating stock...`);

  let updatedCount = 0;

  for (const product of products) {
    let actualStock = 0;
    
    // Calculate stock from Inventory logs
    for (const log of product.inventoryLogs) {
      if (log.type === 'in') {
        actualStock += log.quantity;
      } else if (log.type === 'out') {
        actualStock -= log.quantity;
      }
    }
    
    // Ensure stock doesn't go below 0 for safety
    if (actualStock < 0) actualStock = 0;

    const inStock = actualStock > 0;

    if (product.stockCount !== actualStock || product.inStock !== inStock) {
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          stockCount: actualStock,
          inStock: inStock
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully recalculated stock for all products. Updated ${updatedCount} products.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
