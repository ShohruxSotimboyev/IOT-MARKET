const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const onLimitReached = (req, res, options) => {
  logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
};

// OTP so'rov: 5 marta / 10 daqiqa
exports.otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: "Juda ko'p urinish. 10 daqiqadan keyin qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

// Login: 10 urinish / 15 daqiqa
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Juda ko'p kirish urinishi. 15 daqiqadan keyin qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    onLimitReached(req, res, options);
    res.status(429).json(options.message);
  },
});

// Register: 5 marta / soat
exports.registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: "Juda ko'p ro'yxatdan o'tish urinishi. 1 soatdan keyin qayta urinib ko'ring." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Umumiy API: 100 / daqiqa
exports.generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: "Juda ko'p so'rov. Biroz kuting." },
  standardHeaders: true,
  legacyHeaders: false,
});
