const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

let bot = null;

if (token) {
  bot = new TelegramBot(token, { polling: false });
}

const sendOrderNotification = async (order, items, user) => {
  if (!bot || !adminChatId) {
    console.log('Telegram bot not configured. Order:', order.id);
    return;
  }

  try {
    const itemsList = items.map(i => `▫️ ${i.name} (x${i.quantity}) - ${i.price.toLocaleString()} UZS`).join('\n');
    
    // Attempt to parse payment if it's a string (since it's string in DB now)
    let paymentData = {};
    if (order.payment) {
        try { paymentData = JSON.parse(order.payment); } catch (e) {}
    }

    const message = `
📦 <b>Yangi Buyurtma!</b> #\u200E${order.txId || order.id.slice(-6)}

👤 <b>Mijoz:</b> ${paymentData.cardHolder || user?.username || 'Noma\\'lum'}
📞 <b>Telefon:</b> ${paymentData.phone || user?.phone || 'Kiritilmagan'}
📍 <b>Manzil:</b> ${order.shippingAddress || 'Kiritilmagan'}
📝 <b>Izoh:</b> ${order.note || '-'}

🛒 <b>Mahsulotlar:</b>
${itemsList}

💰 <b>Jami summa:</b> ${order.total.toLocaleString()} UZS
    `;

    await bot.sendMessage(adminChatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Telegramga xabar yuborishda xatolik:', error.message);
  }
};

module.exports = { bot, sendOrderNotification };
