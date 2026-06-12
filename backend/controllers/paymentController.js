/**
 * Payme uchun ma'lumotlarni Base64 formatiga o'tkazish funksiyasi
 */
const encodeBase64 = (data) => Buffer.from(data).toString('base64');

exports.createCheckoutSession = async (req, res) => {
    try {
        const { product, provider } = req.body; 
        
        // Hozirgi dollar kursi (masalan, 12600 so'm)
        const exchangeRate = 12600;
        const amountInSum = product.price * exchangeRate; // So'mdagi qiymati
        const amountInTiyin = amountInSum * 100; // Payme sent/tiyinlarda hisoblaydi

        // Test uchun Merchant ID va Service ID (Keyinchalik real kabinetdan olinadi)
        const PAYME_MERCHANT_ID = "664b360775d794358a9e223b"; // Namuna ID
        const CLICK_SERVICE_ID = "33445"; // Namuna Service ID
        const CLICK_MERCHANT_ID = "22334"; // Namuna Merchant ID

        let paymentUrl = "";

        if (provider === 'payme') {
            /** 
             * Payme Checkout Link:
             * a - summa (tiyinlarda)
             * ac.order_id - buyurtma raqami
             * c - muvaffaqiyatli to'lovdan keyin qaytish manzili
             */
            const orderId = `order_${Date.now()}`;
            const params = `m=${PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${amountInTiyin};c=${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?status=success`;
            paymentUrl = `https://checkout.payme.uz/${encodeBase64(params)}`;
        } 
        else if (provider === 'click') {
            /** 
             * Click Checkout Link:
             * service_id - Click kabinetdan olinadi
             * merchant_id - Click kabinetdan olinadi
             * amount - so'mdagi summa
             * return_url - qaytish manzili
             */
            paymentUrl = `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}&merchant_id=${CLICK_MERCHANT_ID}&amount=${amountInSum}&transaction_param=${Date.now()}&return_url=${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?status=success`;
        }

        res.status(200).json({ url: paymentUrl });
    } catch (err) {
        console.error("To'lov xatosi:", err);
        res.status(500).json({ message: "To'lov linkini tayyorlashda texnik xatolik yuz berdi" });
    }
};