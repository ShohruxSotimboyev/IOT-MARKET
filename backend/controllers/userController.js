const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

exports.createManager = async (req, res) => {
  try {
    const { username, email, password, permissions } = req.body;
    
    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Ism kiritilishi shart." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email kiritilishi shart." });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Parol kamida 8 ta belgi bo'lishi kerak." });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ message: "Bu email bilan foydalanuvchi mavjud." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const manager = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'manager',
        permissions: permissions || [],
        isVerified: true
      }
    });

    res.status(201).json({ message: "Menejer muvaffaqiyatli yaratildi", manager });
  } catch (error) {
    res.status(500).json({ message: "Menejer yaratishda xatolik", error: error.message });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'manager' },
      select: { id: true, username: true, email: true, phone: true, permissions: true, createdAt: true, isVerified: true }
    });
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: "Xatolik", error: error.message });
  }
};

exports.updateManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, permissions } = req.body;

    const data = { username, email, permissions };
    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data
    });

    res.json({ message: "Muvaffaqiyatli yangilandi", manager: updated });
  } catch (error) {
    res.status(500).json({ message: "Xatolik", error: error.message });
  }
};

exports.deleteManager = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) {
      return res.status(400).json({ message: "O'zingizni o'chira olmaysiz." });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: "Superadminni o'chirish mumkin emas." });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: "O'chirildi" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    res.status(500).json({ message: "Xatolik", error: error.message });
  }
};
