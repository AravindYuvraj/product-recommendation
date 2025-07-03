const express = require('express');
const auth = require('../middleware/auth');
const recommendationEngine = require('../utils/recommendationEngine');

const router = express.Router();

// Get personalized recommendations for authenticated user
router.get('/personalized', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationEngine.getPersonalizedRecommendations(
      req.user._id, 
      parseInt(limit)
    );
    
    res.json({
      type: 'personalized',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hybrid recommendations (content-based + collaborative filtering)
router.get('/hybrid', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationEngine.getHybridRecommendations(
      req.user._id, 
      parseInt(limit)
    );
    
    res.json({
      type: 'hybrid',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content-based recommendations
router.get('/content-based', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationEngine.getContentBasedRecommendations(
      req.user._id, 
      parseInt(limit)
    );
    
    res.json({
      type: 'content-based',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get collaborative filtering recommendations
router.get('/collaborative', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationEngine.getCollaborativeRecommendations(
      req.user._id, 
      parseInt(limit)
    );
    
    res.json({
      type: 'collaborative',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending products (public endpoint)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recommendations = await recommendationEngine.getTrendingProducts(parseInt(limit));
    
    res.json({
      type: 'trending',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get similar products for a specific product
router.get('/similar/:productId', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const recommendations = await recommendationEngine.getSimilarProducts(
      req.params.productId, 
      parseInt(limit)
    );
    
    res.json({
      type: 'similar',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all recommendation types for a user (dashboard endpoint)
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [personalized, trending, contentBased, collaborative] = await Promise.all([
      recommendationEngine.getPersonalizedRecommendations(req.user._id, 5),
      recommendationEngine.getTrendingProducts(5),
      recommendationEngine.getContentBasedRecommendations(req.user._id, 5),
      recommendationEngine.getCollaborativeRecommendations(req.user._id, 5)
    ]);

    res.json({
      personalized: {
        type: 'personalized',
        recommendations: personalized,
        count: personalized.length
      },
      trending: {
        type: 'trending',
        recommendations: trending,
        count: trending.length
      },
      contentBased: {
        type: 'content-based',
        recommendations: contentBased,
        count: contentBased.length
      },
      collaborative: {
        type: 'collaborative',
        recommendations: collaborative,
        count: collaborative.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
