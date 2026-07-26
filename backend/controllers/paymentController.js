const encodeBase64 = (data) => Buffer.from(data).toString('base64');
const { prisma } = require('../config/db');
const logger = require('../utils/logger');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { product, provider, orderId } = req.body; 
        
        const exchangeRate = parseFloat(process.env.EXCHANGE_RATE_USD_UZS) || 12600;
        const amountInSum = product.price * exchangeRate;
        const amountInTiyin = amountInSum * 100;

        const PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID;
        const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID;
        const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID;

        let paymentUrl = "";

        if (provider === 'payme') {
            const paymeOrderId = orderId || `order_${Date.now()}`;
            const params = `m=${PAYME_MERCHANT_ID};ac.order_id=${paymeOrderId};a=${amountInTiyin};c=${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?status=success`;
            paymentUrl = `https://checkout.payme.uz/${encodeBase64(params)}`;
        } 
        else if (provider === 'click') {
            const clickOrderId = orderId || `order_${Date.now()}`;
            paymentUrl = `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${amountInSum}&transaction_param=${clickOrderId}&return_url=${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?status=success`;
        }

        res.status(200).json({ url: paymentUrl });
    } catch (err) {
        logger.error("To'lov xatosi:", { error: err.message });
        res.status(500).json({ message: "To'lov linkini tayyorlashda texnik xatolik yuz berdi" });
    }
};

exports.paymeWebhook = async (req, res) => {
    try {
        const { method, params } = req.body;
        if (method === 'PerformTransaction') {
            const orderId = params.account.order_id;
            await prisma.order.update({
                where: { txId: orderId },
                data: { status: 'paid' }
            }).catch((err) => logger.error('Payme webhook order update failed', { error: err.message }));
        }
        res.json({ result: { state: 1 } });
    } catch (err) {
        res.json({ error: { code: -31008, message: { ru: "Ошибка" } } });
    }
};

exports.clickWebhook = async (req, res) => {
    try {
        const { merchant_trans_id, action, error } = req.body;
        if (action === 1 && error === 0) {
            await prisma.order.update({
                where: { txId: merchant_trans_id },
                data: { status: 'paid' }
            }).catch((err) => logger.error('Click webhook order update failed', { error: err.message }));
            res.json({ click_trans_id: req.body.click_trans_id, merchant_trans_id, merchant_prepare_id: req.body.merchant_prepare_id, error: 0, error_note: "Success" });
        } else if (action === 0) {
            res.json({ click_trans_id: req.body.click_trans_id, merchant_trans_id, merchant_prepare_id: merchant_trans_id, error: 0, error_note: "Success" });
        } else {
            res.json({ error: -1 });
        }
    } catch (err) {
        res.json({ error: -1 });
    }
};
