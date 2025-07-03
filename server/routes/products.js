const express = require('express');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, search, page = 1, limit = 10, sort = 'createdAt' } = req.query;
    
    // Build query
    let query = {};
    if (category) query.category = new RegExp(category, 'i');
    if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
    if (search) {
      query.$or = [
        { product_name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { manufacturer: new RegExp(search, 'i') }
      ];
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ is_featured: true }).limit(6);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products on sale
router.get('/sale', async (req, res) => {
  try {
    const products = await Product.find({ is_on_sale: true }).limit(10);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const subcategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          subcategories: { $addToSet: '$subcategory' }
        }
      }
    ]);
    
    res.json({ categories, subcategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track product view (authenticated users)
router.post('/:id/view', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Update product view count
    await Product.findByIdAndUpdate(productId, { $inc: { view_count: 1 } });

    // Add to user's viewed products if not already viewed
    const user = await User.findById(userId);
    if (!user.interactions.views.includes(productId)) {
      user.interactions.views.push(productId);
      await user.save();
    }

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike product
router.post('/:id/like', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isLiked = user.interactions.likes.includes(productId);

    if (isLiked) {
      // Unlike
      user.interactions.likes = user.interactions.likes.filter(id => id.toString() !== productId);
      await Product.findByIdAndUpdate(productId, { $inc: { like_count: -1 } });
    } else {
      // Like
      user.interactions.likes.push(productId);
      await Product.findByIdAndUpdate(productId, { $inc: { like_count: 1 } });
    }

    await user.save();

    res.json({ 
      message: isLiked ? 'Product unliked' : 'Product liked',
      isLiked: !isLiked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase product
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    // Update product purchase count
    await Product.findByIdAndUpdate(productId, { $inc: { purchase_count: 1 } });

    // Add to user's purchased products
    const user = await User.findById(userId);
    user.interactions.purchases.push(productId);
    await user.save();

    res.json({ message: 'Purchase recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
