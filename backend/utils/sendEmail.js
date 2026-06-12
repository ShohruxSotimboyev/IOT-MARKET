const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
});

const sendOtpEmail = async ({ email, otp, type = 'verify' }) => {
  const isLogin = type === 'login';
  const subject = isLogin
    ? "IOT Market — Kirish kodi"
    : "IOT Market — Hisobni tasdiqlash";

  const mailOptions = {
    from: `"IOT Market" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
<!DOCTYPE html>
<html lang="uz">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
        <tr>
          <td style="background:linear-gradient(135deg,#4F46E5,#0ea5e9);padding:32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">⚡ IOT Market</h1>
            <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;">${isLogin ? "Tizimga kirish so'rovi" : "Hisobni tasdiqlash"}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <h2 style="color:#f1f5f9;font-size:20px;margin:0 0 12px;">Tasdiqlash kodi</h2>
            <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
              ${isLogin ? "Hisobingizga kirish uchun" : "Hisobingizni tasdiqlash uchun"} quyidagi 6 xonali kodni kiriting:
            </p>
            <div style="background:#0f172a;border:2px dashed #4F46E5;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
              <span style="font-size:44px;font-weight:900;color:#818cf8;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</span>
            </div>
            <div style="background:#1e3a5f;border-left:4px solid #0ea5e9;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:28px;">
              <p style="color:#7dd3fc;font-size:13px;margin:0;line-height:1.5;">
                ⏱ Bu kod <strong>90 soniya</strong> davomida amal qiladi.<br>
                🔒 Kodni hech kimga bermang — xodimlarimiz hech qachon bu kodni so'ramaydi.
              </p>
            </div>
            <p style="color:#64748b;font-size:12px;margin:0;">
              Agar bu so'rovni siz jo'natmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#0f172a;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
            <p style="color:#475569;font-size:12px;margin:0;">© ${new Date().getFullYear()} IOT Market. Barcha huquqlar himoyalangan.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('OTP email sent', { email: email.replace(/(.{2}).+(@.+)/, '$1***$2'), type });
  } catch (err) {
    logger.error('Failed to send OTP email', { error: err.message });
    throw new Error('Email yuborishda xatolik');
  }
};

module.exports = { sendOtpEmail };
