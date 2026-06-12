const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username kiritilishi shart'],
    trim: true,
    minlength: [3, 'Username kamida 3 ta belgi'],
    maxlength: [50, 'Username 50 ta belgidan oshmasin'],
  },
  email: {
    type: String,
    required: [true, 'Email kiritilishi shart'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email formati noto'g'ri"],
  },
  phone: {
    type: String,
    default: 'Kiritilmagan',
    trim: true,
  },
  password: {
    type: String,
    minlength: [8, 'Parol kamida 8 ta belgi'],
    select: false,
  },
  isVerified: { type: Boolean, default: false },

  // OTP — bcrypt bilan hash qilib saqlaymiz
  otpHash:     { type: String,  select: false },
  otpExpires:  { type: Date,    select: false },
  // ✅ TUZATILGAN: otpAttempts da select:false YO'Q
  // Sabab: verifyOTP da bu field har doim kerak,
  // va select:false bo'lsa .select('+otpAttempts') yozishni unutganda
  // brute-force himoyasi ishlamay qoladi.
  otpAttempts: { type: Number,  default: 0 },

  // Refresh token
  refreshToken: { type: String, select: false },

  // OAuth
  googleId: { type: String },

  // Login tarixi
  lastLogin:  { type: Date },
  loginCount: { type: Number, default: 0 },

}, { timestamps: true });

// ─── OTP metodlari ───────────────────────────────────────────────────────────
userSchema.methods.setOtp = async function (plainOtp) {
  this.otpHash    = await bcrypt.hash(plainOtp, 8);
  this.otpExpires = new Date(Date.now() + 90 * 1000); // 90 soniya
  this.otpAttempts = 0;
};

// ✅ TUZATILGAN: verifyOtp endi save() chaqirmaydi
// otpAttempts yangilashni controller o'zi $inc bilan qiladi
userSchema.methods.verifyOtp = async function (plainOtp) {
  if (!this.otpHash || !this.otpExpires) return false;
  if (this.otpExpires < new Date())       return false;
  if (this.otpAttempts >= 5)              return false;
  return bcrypt.compare(plainOtp, this.otpHash);
};

userSchema.methods.clearOtp = function () {
  this.otpHash     = undefined;
  this.otpExpires  = undefined;
  this.otpAttempts = 0;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
