# E-Commerce AI Recommendation System


A full-stack web application featuring intelligent product recommendations powered by AI algorithms including collaborative filtering and content-based filtering.


## Features

### Core Functionality
- **User Authentication**: Secure registration and login system with JWT
- **Product Catalog**: Browse and search products with filtering and pagination
- **AI Recommendations**: Multiple recommendation algorithms:
  - **Personalized Recommendations**: Based on user behavior and preferences
  - **Content-Based Filtering**: Similar products based on features
  - **Collaborative Filtering**: Recommendations from users with similar tastes
  - **Trending Products**: Popular items based on recent interactions

### User Interactions
- **Product Interactions**: Like, view, and purchase tracking
- **Smart Analytics**: User preference analysis and statistics
- **Real-time Updates**: Dynamic recommendation updates based on user behavior

### Technical Features
- **RESTful API**: Comprehensive backend API with Express.js
- **Modern Frontend**: React with Material-UI for responsive design
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Comprehensive test suite with Jest and Supertest
- **Security**: JWT authentication, password hashing with bcrypt

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **Material-UI** for component library and styling
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

### Testing
- **Jest** for unit testing
- **Supertest** for API testing
- **MongoDB Memory Server** for test database

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AravindYuvraj/product-recommendation.git
   cd product-recommendation
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce-recommendation
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

4. **Start MongoDB**
   - Local MongoDB: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```
   The frontend will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=Electronics&search=phone
```

#### Get Featured Products
```http
GET /api/products/featured
```

#### Get Product Categories
```http
GET /api/products/categories
```

#### Track Product Interaction
```http
POST /api/products/:id/like
Authorization: Bearer <token>
```

### Recommendation Endpoints

#### Get Personalized Recommendations
```http
GET /api/recommendations/personalized?limit=10
Authorization: Bearer <token>
```

#### Get Trending Products
```http
GET /api/recommendations/trending?limit=10
```

#### Get Similar Products
```http
GET /api/recommendations/similar/:productId?limit=5
```

## AI Recommendation Algorithms

### 1. Content-Based Filtering
- Analyzes product features (category, manufacturer, price range)
- Recommends products similar to user's liked items
- Uses product metadata and user preferences

### 2. Collaborative Filtering
- Uses Jaccard similarity to find users with similar tastes
- Recommends products liked by similar users
- Implements user-based collaborative filtering

### 3. Hybrid Approach
- Combines content-based and collaborative filtering
- Weights different recommendation types for optimal results
- Provides diverse and accurate recommendations

### 4. Personalized Recommendations
- Analyzes complete user interaction history
- Weights different interaction types (purchases > likes > views)
- Calculates category and manufacturer preferences

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Authentication tests
npm test auth.test.js

# Recommendation engine tests
npm test recommendations.test.js
```

### Test Coverage
- Authentication flow (registration, login, token validation)
- Product CRUD operations
- Recommendation algorithms accuracy
- API endpoint functionality
- User interaction tracking

## Project Structure

```
ecommerce-recommendation-app/
├── server/
│   ├── controllers/
│   ├── data/
│   │   └── products.json
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── recommendations.js
│   │   └── users.js
│   ├── utils/
│   │   ├── recommendationEngine.js
│   │   └── seedDatabase.js
│   └── index.js
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Home/
│   │   │   ├── Layout/
│   │   │   ├── Products/
│   │   │   └── Recommendations/
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.js
├── tests/
│   ├── auth.test.js
│   └── recommendations.test.js
├── .env
├── package.json
└── README.md
```

## Usage Examples

### 1. User Registration and Login
1. Navigate to the registration page
2. Create an account with email and password
3. Login to access personalized features

### 2. Browse Products
1. Visit the products page
2. Use filters and search functionality
3. View product details and ratings

### 3. Get Recommendations
1. Login to your account
2. Interact with products (like, view, purchase)
3. Visit the recommendations page
4. Explore different recommendation types

### 4. Track User Behavior
1. Like products you're interested in
2. Browse products to build view history
3. Simulate purchases to improve recommendations
4. Check your user statistics and preferences

## Development Process

This application was developed using a systematic approach:

1. **Backend Development**
   - Set up Express.js server with MongoDB
   - Implemented user authentication with JWT
   - Created product and user models
   - Developed recommendation algorithms
   - Added comprehensive API endpoints

2. **Frontend Development**
   - Created React application with Material-UI
   - Implemented authentication flow
   - Built product browsing and recommendation UI
   - Added user interaction tracking

3. **AI Algorithm Implementation**
   - Researched and implemented collaborative filtering
   - Developed content-based filtering algorithm
   - Created hybrid recommendation system
   - Optimized for performance and accuracy

4. **Testing and Quality Assurance**
   - Wrote comprehensive test suites
   - Tested authentication and recommendation logic
   - Validated API endpoints and user flows


