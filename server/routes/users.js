const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's interactions (likes, views, purchases)
router.get('/interactions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('interactions.likes')
      .populate('interactions.views')
      .populate('interactions.purchases');

    res.json({
      likes: user.interactions.likes,
      views: user.interactions.views,
      purchases: user.interactions.purchases
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's liked products
router.get('/likes', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('interactions.likes');
    res.json(user.interactions.likes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's viewed products
router.get('/views', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('interactions.views');
    res.json(user.interactions.views);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's purchased products
router.get('/purchases', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('interactions.purchases');
    res.json(user.interactions.purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's interaction stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get category preferences
    const likedProducts = await Product.find({ _id: { $in: user.interactions.likes } });
    const viewedProducts = await Product.find({ _id: { $in: user.interactions.views } });
    const purchasedProducts = await Product.find({ _id: { $in: user.interactions.purchases } });

    // Calculate category stats
    const categoryStats = {};
    const manufacturerStats = {};

    [...likedProducts, ...viewedProducts, ...purchasedProducts].forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1;
      manufacturerStats[product.manufacturer] = (manufacturerStats[product.manufacturer] || 0) + 1;
    });

    res.json({
      totalLikes: user.interactions.likes.length,
      totalViews: user.interactions.views.length,
      totalPurchases: user.interactions.purchases.length,
      topCategories: Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
      topManufacturers: Object.entries(manufacturerStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([manufacturer, count]) => ({ manufacturer, count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear user interaction history
router.delete('/interactions/clear', auth, async (req, res) => {
  try {
    const { type } = req.query; // 'likes', 'views', 'purchases', or 'all'
    
    const user = await User.findById(req.user._id);
    
    if (type === 'all') {
      user.interactions.likes = [];
      user.interactions.views = [];
      user.interactions.purchases = [];
    } else if (type && user.interactions[type]) {
      user.interactions[type] = [];
    } else {
      return res.status(400).json({ message: 'Invalid interaction type' });
    }

    await user.save();
    res.json({ message: `${type} interactions cleared successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
