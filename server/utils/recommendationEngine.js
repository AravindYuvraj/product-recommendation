const Product = require('../models/Product');
const User = require('../models/User');

class RecommendationEngine {
  
  // Content-based filtering: recommend products similar to ones user liked
  async getContentBasedRecommendations(userId, limit = 5) {
    try {
      const user = await User.findById(userId).populate('interactions.likes');
      const likedProducts = user.interactions.likes;
      
      if (likedProducts.length === 0) {
        // If user hasn't liked anything, return popular products
        return await Product.find().sort({ like_count: -1, view_count: -1 }).limit(limit);
      }

      // Get categories and manufacturers of liked products
      const likedCategories = [...new Set(likedProducts.map(p => p.category))];
      const likedManufacturers = [...new Set(likedProducts.map(p => p.manufacturer))];
      const likedProductIds = likedProducts.map(p => p._id);

      // Find similar products based on category, manufacturer, and price range
      const avgPrice = likedProducts.reduce((sum, p) => sum + p.price, 0) / likedProducts.length;
      const priceRange = avgPrice * 0.5; // 50% price variance

      const recommendations = await Product.find({
        _id: { $nin: likedProductIds }, // Exclude already liked products
        $or: [
          { category: { $in: likedCategories } },
          { manufacturer: { $in: likedManufacturers } },
          { 
            price: { 
              $gte: avgPrice - priceRange, 
              $lte: avgPrice + priceRange 
            } 
          }
        ]
      })
      .sort({ rating: -1, like_count: -1 })
      .limit(limit);

      return recommendations;
    } catch (error) {
      console.error('Content-based recommendation error:', error);
      return [];
    }
  }

  // Collaborative filtering: recommend products liked by similar users
  async getCollaborativeRecommendations(userId, limit = 5) {
    try {
      const currentUser = await User.findById(userId);
      const currentUserLikes = currentUser.interactions.likes.map(id => id.toString());
      
      if (currentUserLikes.length === 0) {
        return await Product.find().sort({ purchase_count: -1, like_count: -1 }).limit(limit);
      }

      // Find users with similar preferences (Jaccard similarity)
      const allUsers = await User.find({ _id: { $ne: userId } });
      const similarUsers = [];

      for (const user of allUsers) {
        const userLikes = user.interactions.likes.map(id => id.toString());
        const similarity = this.calculateJaccardSimilarity(currentUserLikes, userLikes);
        
        if (similarity > 0.1) { // Minimum similarity threshold
          similarUsers.push({ user, similarity });
        }
      }

      // Sort by similarity
      similarUsers.sort((a, b) => b.similarity - a.similarity);

      // Get products liked by similar users but not by current user
      const recommendedProductIds = new Set();
      
      for (const { user } of similarUsers.slice(0, 10)) { // Top 10 similar users
        for (const productId of user.interactions.likes) {
          const productIdStr = productId.toString();
          if (!currentUserLikes.includes(productIdStr)) {
            recommendedProductIds.add(productIdStr);
          }
        }
      }

      const recommendations = await Product.find({
        _id: { $in: Array.from(recommendedProductIds) }
      })
      .sort({ like_count: -1, rating: -1 })
      .limit(limit);

      return recommendations;
    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  // Hybrid approach: combine content-based and collaborative filtering
  async getHybridRecommendations(userId, limit = 10) {
    try {
      const contentBased = await this.getContentBasedRecommendations(userId, Math.ceil(limit * 0.6));
      const collaborative = await this.getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4));

      // Combine and remove duplicates
      const allRecommendations = [...contentBased, ...collaborative];
      const uniqueRecommendations = allRecommendations.filter((product, index, self) => 
        index === self.findIndex(p => p._id.toString() === product._id.toString())
      );

      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Hybrid recommendation error:', error);
      return [];
    }
  }

  // Get trending products based on recent interactions
  async getTrendingProducts(limit = 10) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await Product.find({
        updatedAt: { $gte: thirtyDaysAgo }
      })
      .sort({ 
        view_count: -1, 
        like_count: -1, 
        purchase_count: -1,
        rating: -1 
      })
      .limit(limit);
    } catch (error) {
      console.error('Trending products error:', error);
      return [];
    }
  }

  // Get personalized recommendations based on user's purchase/view history
  async getPersonalizedRecommendations(userId, limit = 10) {
    try {
      const user = await User.findById(userId).populate([
        'interactions.likes',
        'interactions.views',
        'interactions.purchases'
      ]);

      // Weight different interactions
      const interactionWeights = {
        purchases: 3,
        likes: 2,
        views: 1
      };

      // Calculate category preferences
      const categoryScores = {};
      const manufacturerScores = {};

      // Process all interactions
      const allInteractions = [
        ...user.interactions.purchases.map(p => ({ product: p, weight: interactionWeights.purchases })),
        ...user.interactions.likes.map(p => ({ product: p, weight: interactionWeights.likes })),
        ...user.interactions.views.map(p => ({ product: p, weight: interactionWeights.views }))
      ];

      allInteractions.forEach(({ product, weight }) => {
        // Category scoring
        categoryScores[product.category] = (categoryScores[product.category] || 0) + weight;
        // Manufacturer scoring
        manufacturerScores[product.manufacturer] = (manufacturerScores[product.manufacturer] || 0) + weight;
      });

      // Get top categories and manufacturers
      const topCategories = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      const topManufacturers = Object.entries(manufacturerScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([manufacturer]) => manufacturer);

      // Get interacted product IDs to exclude
      const interactedProductIds = [
        ...user.interactions.purchases.map(p => p._id),
        ...user.interactions.likes.map(p => p._id),
        ...user.interactions.views.map(p => p._id)
      ];

      // Find recommendations
      const recommendations = await Product.find({
        _id: { $nin: interactedProductIds },
        $or: [
          { category: { $in: topCategories } },
          { manufacturer: { $in: topManufacturers } }
        ]
      })
      .sort({ rating: -1, like_count: -1, view_count: -1 })
      .limit(limit);

      return recommendations;
    } catch (error) {
      console.error('Personalized recommendation error:', error);
      return [];
    }
  }

  // Calculate Jaccard similarity between two arrays
  calculateJaccardSimilarity(arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  // Get similar products based on content features
  async getSimilarProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);
      if (!product) return [];

      const similarProducts = await Product.find({
        _id: { $ne: productId },
        $or: [
          { category: product.category },
          { subcategory: product.subcategory },
          { manufacturer: product.manufacturer },
          { 
            price: { 
              $gte: product.price * 0.7, 
              $lte: product.price * 1.3 
            } 
          }
        ]
      })
      .sort({ rating: -1, like_count: -1 })
      .limit(limit);

      return similarProducts;
    } catch (error) {
      console.error('Similar products error:', error);
      return [];
    }
  }
}

module.exports = new RecommendationEngine();
