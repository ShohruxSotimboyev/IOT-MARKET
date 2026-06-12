const logger = require('../utils/logger')
const { PrismaClient } = require('@prisma/client')

// Singleton - bitta instance
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma

const connectDB = async () => {
  try {
    await prisma.$connect()
    logger.info('PostgreSQL (Prisma) ulandi.')
  } catch (error) {
    logger.error(`DB ulanish xatosi: ${error.message}`)
    process.exit(1)
  }
}

module.exports = { connectDB, prisma }
