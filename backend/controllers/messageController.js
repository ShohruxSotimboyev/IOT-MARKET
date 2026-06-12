const { prisma } = require('../config/db')

// Barcha xabarlarni olish
exports.getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = status ? { status } : {}

    const messages = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } },
    })

    const total = await prisma.message.count({ where })

    res.json({
      success: true,
      data: messages,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Bitta xabarni olish
exports.getMessageById = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { username: true, email: true } } },
    })

    if (!message) {
      return res.status(404).json({ success: false, message: 'Xabar topilmadi' })
    }

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabar yaratish
exports.createMessage = async (req, res) => {
  try {
    const { userId, name, email, phone, subject, message } = req.body

    const newMessage = await prisma.message.create({
      data: {
        userId,
        name,
        email,
        phone,
        subject,
        message,
      },
    })

    res.status(201).json({ success: true, data: newMessage })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabarni o'qish
exports.markAsRead = async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { status: 'read' },
    })

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabarga javob berish
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body

    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { reply, status: 'replied' },
    })

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabarni o'chirish
exports.deleteMessage = async (req, res) => {
  try {
    await prisma.message.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true, message: 'Xabar o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
