const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Mock data
const users = [];
const products = require('./data/products.json');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple user storage (in-memory)
let userCounter = 1;
let currentUser = null;

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = {
    id: userCounter++,
    email,
    password, // In real app, this would be hashed
    interactions: { likes: [], views: [], purchases: [] }
  };
  
  users.push(user);
  const token = 'mock-jwt-token-' + user.id;
  
  res.status(201).json({
    message: 'User created successfully',
    token,
    user: { id: user.id, email: user.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = 'mock-jwt-token-' + user.id;
  currentUser = user;
  
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email }
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.json(currentUser);
});

// Product routes
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  
  let filteredProducts = [...products];
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    totalPages: Math.ceil(filteredProducts.length / limit),
    currentPage: parseInt(page),
    total: filteredProducts.length
  });
});

app.get('/api/products/featured', (req, res) => {
  const featuredProducts = products.filter(p => p.is_featured);
  res.json(featuredProducts.slice(0, 6));
});

app.get('/api/products/sale', (req, res) => {
  const saleProducts = products.filter(p => p.is_on_sale);
  res.json(saleProducts.slice(0, 10));
});

app.get('/api/products/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  const subcategories = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    if (!acc[p.category].includes(p.subcategory)) {
      acc[p.category].push(p.subcategory);
    }
    return acc;
  }, {});
  
  res.json({ categories, subcategories });
});

app.post('/api/products/:id/like', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const productId = req.params.id;
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    const isLiked = users[userIndex].interactions.likes.includes(productId);
    
    if (isLiked) {
      users[userIndex].interactions.likes = users[userIndex].interactions.likes.filter(id => id !== productId);
    } else {
      users[userIndex].interactions.likes.push(productId);
    }
    
    currentUser = users[userIndex];
    
    res.json({
      message: isLiked ? 'Product unliked' : 'Product liked',
      isLiked: !isLiked
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.post('/api/products/:id/view', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const productId = req.params.id;
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1 && !users[userIndex].interactions.views.includes(productId)) {
    users[userIndex].interactions.views.push(productId);
    currentUser = users[userIndex];
  }
  
  res.json({ message: 'View tracked successfully' });
});

app.post('/api/products/:id/purchase', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const productId = req.params.id;
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    users[userIndex].interactions.purchases.push(productId);
    currentUser = users[userIndex];
  }
  
  res.json({ message: 'Purchase recorded successfully' });
});

// Recommendation routes
app.get('/api/recommendations/trending', (req, res) => {
  const { limit = 10 } = req.query;
  
  // Simple trending logic - return featured and high-rated products
  const trending = products
    .filter(p => p.rating > 3.0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, parseInt(limit));
  
  res.json({
    type: 'trending',
    recommendations: trending,
    count: trending.length
  });
});

app.get('/api/recommendations/personalized', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { limit = 10 } = req.query;
  
  // Simple personalized logic based on liked categories
  const likedProducts = currentUser.interactions.likes.map(id => 
    products.find(p => p.product_id.toString() === id)
  ).filter(Boolean);
  
  const likedCategories = [...new Set(likedProducts.map(p => p.category))];
  
  let recommendations = [];
  if (likedCategories.length > 0) {
    recommendations = products.filter(p => 
      likedCategories.includes(p.category) && 
      !currentUser.interactions.likes.includes(p.product_id.toString())
    );
  } else {
    recommendations = products.filter(p => p.rating > 4.0);
  }
  
  res.json({
    type: 'personalized',
    recommendations: recommendations.slice(0, parseInt(limit)),
    count: recommendations.length
  });
});

app.get('/api/recommendations/content-based', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { limit = 10 } = req.query;
  
  // Content-based: similar to trending for simplicity
  const recommendations = products
    .filter(p => p.rating > 3.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, parseInt(limit));
  
  res.json({
    type: 'content-based',
    recommendations,
    count: recommendations.length
  });
});

app.get('/api/recommendations/collaborative', (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { limit = 10 } = req.query;
  
  // Collaborative: return popular products for simplicity
  const recommendations = products
    .filter(p => p.is_featured || p.rating > 4.0)
    .slice(0, parseInt(limit));
  
  res.json({
    type: 'collaborative',
    recommendations,
    count: recommendations.length
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce Recommendation API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using in-memory data store (no database required)');
});

module.exports = app;
