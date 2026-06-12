// Backward compatibility - always use config/db prisma instance
const { prisma } = require('../config/db')
module.exports = prisma
