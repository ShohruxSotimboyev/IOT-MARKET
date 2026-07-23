const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Avtorizatsiya talab etiladi." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'refresh') {
      return res.status(401).json({ message: "Noto'g'ri token turi." });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Foydalanuvchi topilmadi." });
    if (!user.isVerified) return res.status(403).json({ message: "Hisob tasdiqlanmagan." });
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token muddati tugagan.", tokenExpired: true });
    }
    logger.warn('Invalid token', { ip: req.ip });
    return res.status(401).json({ message: "Token yaroqsiz." });
  }
};

// Admin panel uchun - faqat adminlar kirishi mumkin
const adminProtect = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Admin avtorizatsiyasi talab etiladi." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'refresh') {
      return res.status(401).json({ message: "Noto'g'ri token turi." });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Admin topilmadi." });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: "Sizda admin huquqi yo'q." });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token muddati tugagan.", tokenExpired: true });
    }
    logger.warn('Invalid admin token', { ip: req.ip });
    return res.status(401).json({ message: "Admin token yaroqsiz." });
  }
};

// Superadmin panel uchun - faqat superadminlar kirishi mumkin
const superadminProtect = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Superadmin avtorizatsiyasi talab etiladi." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'refresh') {
      return res.status(401).json({ message: "Noto'g'ri token turi." });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Foydalanuvchi topilmadi." });
    if (user.role !== 'superadmin') {
      return res.status(403).json({ message: "Faqat superadminlar uchun ruxsat berilgan." });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token muddati tugagan.", tokenExpired: true });
    }
    logger.warn('Invalid superadmin token', { ip: req.ip });
    return res.status(401).json({ message: "Superadmin token yaroqsiz." });
  }
};

// Frontend uchun - adminlar kirishi mumkin emas
const userProtect = async (req, res, next) => {
  let token = req.cookies?.accessToken;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  if (!token) {
    return res.status(401).json({ message: "Avtorizatsiya talab etiladi." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'refresh') {
      return res.status(401).json({ message: "Noto'g'ri token turi." });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Foydalanuvchi topilmadi." });
    if (!user.isVerified) return res.status(403).json({ message: "Hisob tasdiqlanmagan." });
    // Adminlar frontend orqali kirish mumkin emas
    if (user.role === 'admin' || user.role === 'superadmin') {
      return res.status(403).json({ message: "Adminlar frontend orqali kirish mumkin emas." });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token muddati tugagan.", tokenExpired: true });
    }
    logger.warn('Invalid user token', { ip: req.ip });
    return res.status(401).json({ message: "Token yaroqsiz." });
  }
};

module.exports = { protect, adminProtect, superadminProtect, userProtect };
