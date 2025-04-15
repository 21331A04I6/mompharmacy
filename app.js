// app.js

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const app = express();
const Order = require('./models/Order');  // Import the Order model

// MongoDB connection
// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/mompharmacy';  // Update with your MongoDB URI
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Home Route
app.get('/', (req, res) => {
  res.render('home');
});

// Cart Route: Show cart page
app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart', { cart, total });
});

// Add to Cart Route
app.post('/add-to-cart', (req, res) => {
  const { id, name, price, image, quantity } = req.body;
  if (!req.session.cart) {
    req.session.cart = [];
  }
  
  const existingItem = req.session.cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    req.session.cart.push({ id, name, price, image, quantity });
  }

  res.redirect('/cart');
});

// Remove from Cart Route
app.post('/remove-from-cart', (req, res) => {
  const { id } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== id);
  }
  res.redirect('/cart');
});



// Show Checkout Page
app.get('/checkout', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart'); // Redirect to cart if empty
  }
  res.render('checkout');
});

// Place Order Route
app.post('/place-order', (req, res) => {
  const { name, address, phone } = req.body;
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const newOrder = new Order({ name, address, phone, cart, total });
  newOrder.save()
    .then(() => {
      req.session.cart = [];  // Clear the cart after placing the order
      res.redirect('/order-confirmation');
    })
    .catch(err => {
      console.log('Error saving order:', err);
      res.status(500).send('Internal server error');
    });
});

// Order Confirmation Route
app.get('/order-confirmation', (req, res) => {
  Order.findOne().sort({ date: -1 }).limit(1)  // Get the most recent order
    .then(order => {
      res.render('order-confirmation', { order });
    })
    .catch(err => {
      console.log('Error fetching order:', err);
      res.status(500).send('Internal server error');
    });
});


// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
