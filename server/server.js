const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/sweet_delights', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to local MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define schemas and models
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  featured: { type: Boolean, default: false }
});

const orderSchema = new mongoose.Schema({
  customerDetails: {
      name: String,
      address: String,
      phone: String,
      paymentMethod: String
  },
  products: [{
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      quantity: Number
  }],
  totalPrice: Number,
  status: String,
  date: { type: Date, default: Date.now }
});

const wishlistSchema = new mongoose.Schema({
  userId: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: req.body.image,
    featured: req.body.featured || false
  });
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, 
      {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.body.image,
        featured: req.body.featured
      }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/wishlist/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const { productId } = req.body;
      
      let wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
          wishlist = new Wishlist({ userId, products: [productId] });
      } else {
          if (wishlist.products.includes(productId)) {
              wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
          } else {
              wishlist.products.push(productId);
          }
      }
      
      await wishlist.save();
      res.json(wishlist);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

app.get('/api/wishlist/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const wishlist = await Wishlist.findOne({ userId }).populate('products');
      res.json(wishlist ? wishlist.products : []);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.put('/api/products/:id/toggle-featured', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.featured = !product.featured;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('products');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
      const order = new Order({
          customerDetails: req.body.customerDetails,
          products: req.body.products,
          totalPrice: req.body.totalPrice,
          status: req.body.status
      });
      const newOrder = await order.save();
      res.status(201).json(newOrder);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
      const order = await Order.findByIdAndDelete(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      res.json({ message: 'Order deleted' });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

app.get('/api/wishlist', async (req, res) => {
  try {
    const wishlists = await Wishlist.find().populate('products');
    res.json(wishlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  const wishlist = new Wishlist(req.body);
  try {
    const newWishlist = await wishlist.save();
    res.status(201).json(newWishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/wishlist/:id', async (req, res) => {
  try {
    const wishlist = await Wishlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    res.json(wishlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/featured-treats', async (req, res) => {
  try {
      const featuredProducts = await Product.find({ featured: true });
      const featuredTreats = {};

      featuredProducts.forEach(product => {
          if (!featuredTreats[product.category.toLowerCase()]) {
              featuredTreats[product.category.toLowerCase()] = product;
          }
      });

      res.json({ featuredTreats });
  } catch (error) {
      console.error('Error fetching featured treats:', error);
      res.status(500).json({ message: 'Error fetching featured treats', error: error.message });
  }
});

app.put('/api/products/:id/toggle-featured', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.featured = !product.featured;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});