// models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  cart: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true }
    }
  ],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
