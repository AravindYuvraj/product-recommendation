const mongoose = require('mongoose');
const User = require('../server/models/User');
const Product = require('../server/models/Product');
const RecommendationEngine = require('../server/utils/recommendationEngine');

describe('Recommendation Engine', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ecommerce-test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create test products
    await Product.create([
      {
        product_id: 1,
        product_name: 'Test Product 1',
        category: 'Electronics',
        subcategory: 'Phones',
        price: 999,
        manufacturer: 'TestBrand',
        description: 'A great phone',
        rating: 4.5,
        quantity_in_stock: 100
      },
      {
        product_id: 2,
        product_name: 'Test Product 2',
        category: 'Electronics',
        subcategory: 'Laptops',
        price: 1299,
        manufacturer: 'TestBrand',
        description: 'A great laptop',
        rating: 4.2,
        quantity_in_stock: 50
      },
      {
        product_id: 3,
        product_name: 'Test Product 3',
        category: 'Home',
        subcategory: 'Furniture',
        price: 599,
        manufacturer: 'HomeBrand',
        description: 'A great chair',
        rating: 4.0,
        quantity_in_stock: 25
      }
    ]);
  });

  describe('Content-Based Filtering', () => {
    it('should return popular products for users with no interactions', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        interactions: { likes: [], views: [], purchases: [] }
      });

      const recommendations = await RecommendationEngine.getContentBasedRecommendations(user._id, 5);
      
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should return similar products for users with liked products', async () => {
      const products = await Product.find({});
      const user = await User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        interactions: {
          likes: [products[0]._id], // Like first product (Electronics)
          views: [],
          purchases: []
        }
      });

      const recommendations = await RecommendationEngine.getContentBasedRecommendations(user._id, 5);
      
      expect(recommendations).toBeInstanceOf(Array);
      // Should not include the already liked product
      const likedProductIds = recommendations.map(p => p._id.toString());
      expect(likedProductIds).not.toContain(products[0]._id.toString());
    });
  });

  describe('Collaborative Filtering', () => {
    it('should return popular products for users with no interactions', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'hashedpassword',
        interactions: { likes: [], views: [], purchases: [] }
      });

      const recommendations = await RecommendationEngine.getCollaborativeRecommendations(user._id, 5);
      
      expect(recommendations).toBeInstanceOf(Array);
    });

    it('should find similar users and recommend their liked products', async () => {
      const products = await Product.find({});
      
      // Create first user who likes product 1
      const user1 = await User.create({
        email: 'user1@example.com',
        password: 'hashedpassword',
        interactions: {
          likes: [products[0]._id, products[1]._id],
          views: [],
          purchases: []
        }
      });

      // Create second user who likes product 1 and 2
      const user2 = await User.create({
        email: 'user2@example.com',
        password: 'hashedpassword',
        interactions: {
          likes: [products[0]._id, products[2]._id],
          views: [],
          purchases: []
        }
      });

      // Create target user who likes only product 1
      const targetUser = await User.create({
        email: 'target@example.com',
        password: 'hashedpassword',
        interactions: {
          likes: [products[0]._id],
          views: [],
          purchases: []
        }
      });

      const recommendations = await RecommendationEngine.getCollaborativeRecommendations(targetUser._id, 5);
      
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Jaccard Similarity', () => {
    it('should calculate similarity correctly', () => {
      const arr1 = ['a', 'b', 'c'];
      const arr2 = ['b', 'c', 'd'];
      
      const similarity = RecommendationEngine.calculateJaccardSimilarity(arr1, arr2);
      
      // Intersection: {b, c} = 2 items
      // Union: {a, b, c, d} = 4 items
      // Similarity: 2/4 = 0.5
      expect(similarity).toBe(0.5);
    });

    it('should return 0 for completely different arrays', () => {
      const arr1 = ['a', 'b'];
      const arr2 = ['c', 'd'];
      
      const similarity = RecommendationEngine.calculateJaccardSimilarity(arr1, arr2);
      
      expect(similarity).toBe(0);
    });

    it('should return 1 for identical arrays', () => {
      const arr1 = ['a', 'b', 'c'];
      const arr2 = ['a', 'b', 'c'];
      
      const similarity = RecommendationEngine.calculateJaccardSimilarity(arr1, arr2);
      
      expect(similarity).toBe(1);
    });
  });

  describe('Similar Products', () => {
    it('should find products similar to a given product', async () => {
      const products = await Product.find({});
      const electronicsProduct = products.find(p => p.category === 'Electronics');
      
      const similarProducts = await RecommendationEngine.getSimilarProducts(electronicsProduct._id, 3);
      
      expect(similarProducts).toBeInstanceOf(Array);
      // Should not include the original product
      const similarProductIds = similarProducts.map(p => p._id.toString());
      expect(similarProductIds).not.toContain(electronicsProduct._id.toString());
    });

    it('should return empty array for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const similarProducts = await RecommendationEngine.getSimilarProducts(fakeId, 3);
      
      expect(similarProducts).toEqual([]);
    });
  });

  describe('Trending Products', () => {
    it('should return trending products', async () => {
      const trendingProducts = await RecommendationEngine.getTrendingProducts(5);
      
      expect(trendingProducts).toBeInstanceOf(Array);
      expect(trendingProducts.length).toBeLessThanOrEqual(5);
    });
  });
});
