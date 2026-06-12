const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId:   { type: String, required: true },
  name:        { type: String, required: true, trim: true },
  price:       { type: Number, required: true, min: 0 },
  quantity:    { type: Number, required: true, default: 1, min: 1 },
  image:       { type: String, default: '' },
  category:    { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Mahsulotlar ro'yxati
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: 'Buyurtmada kamida 1 ta mahsulot bo\'lishi shart',
    },
  },

  // To'lov summasi
  subtotal:   { type: Number, required: true, min: 0 },
  commission: { type: Number, required: true, min: 0 },
  discount:   { type: Number, default: 0, min: 0 },
  total:      { type: Number, required: true, min: 0 },
  currency:   { type: String, default: 'UZS' },

  // Karta ma'lumotlari (minimal — xavfsiz)
  payment: {
    cardLast4:   { type: String, maxlength: 4 },
    cardScheme:  { type: String, enum: ['uzcard', 'humo', 'visa', 'mastercard', 'unknown'], default: 'unknown' },
    cardHolder:  { type: String, trim: true },
    method:      { type: String, default: 'card' },
  },

  // Buyurtma holati
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'paid',
    index: true,
  },

  // Tranzaksiya
  txId: {
    type: String,
    required: true,
  },

  // Yetkazib berish manzili (kelajak uchun)
  shippingAddress: {
    fullName:  { type: String },
    address:   { type: String },
    city:      { type: String },
    phone:     { type: String },
  },

  // Izoh
  note: { type: String, maxlength: 500 },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: mahsulotlar soni
orderSchema.virtual('itemsCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual: qisqa tavsif
orderSchema.virtual('summary').get(function() {
  if (!this.items || this.items.length === 0) return 'Bo\'sh buyurtma';
  const first = this.items[0].name;
  return this.items.length === 1
    ? first
    : `${first} va yana ${this.items.length - 1} ta mahsulot`;
});

// Index: foydalanuvchi bo'yicha sanaga qarab saralash
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ txId: 1 }, { unique: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
