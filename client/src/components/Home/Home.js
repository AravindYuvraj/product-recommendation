import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ProductCard from '../Products/ProductCard';
import { productsAPI, recommendationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featured, sale, trending] = await Promise.all([
          productsAPI.getFeaturedProducts(),
          productsAPI.getSaleProducts(),
          recommendationsAPI.getTrending(4),
        ]);

        setFeaturedProducts(featured.data);
        setSaleProducts(sale.data);
        setTrendingProducts(trending.data.recommendations);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const ProductSection = ({ title, products, linkTo, linkText }) => (
    <Box sx={{ my: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2">
          {title}
        </Typography>
        {linkTo && (
          <Button component={Link} to={linkTo} variant="outlined">
            {linkText}
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {products.slice(0, 4).map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={3}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Container>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
          }}
        >
          <Typography component="h1" variant="h3" color="inherit" gutterBottom>
            AI-Powered E-Commerce
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Discover products tailored just for you with our intelligent recommendation system.
            Get personalized suggestions based on your preferences and behavior.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" color="secondary" component={Link} to="/products">
              Browse Products
            </Button>
            {isAuthenticated ? (
              <Button variant="outlined" color="inherit" component={Link} to="/recommendations">
                View Recommendations
              </Button>
            ) : (
              <Button variant="outlined" color="inherit" component={Link} to="/register">
                Get Started
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <ProductSection
          title="Featured Products"
          products={featuredProducts}
          linkTo="/products?featured=true"
          linkText="View All Featured"
        />
      )}

      <Divider sx={{ my: 4 }} />

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <ProductSection
          title="On Sale Now"
          products={saleProducts}
          linkTo="/products?sale=true"
          linkText="View All Sale Items"
        />
      )}

      <Divider sx={{ my: 4 }} />

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <ProductSection
          title="Trending Now"
          products={trendingProducts}
          linkTo="/recommendations"
          linkText="View All Trending"
        />
      )}

      {/* AI Features Section */}
      <Paper sx={{ p: 4, mt: 4, background: 'linear-gradient(45deg, #f5f5f5 30%, #e3f2fd 90%)' }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Why Choose Our AI Recommendations?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                🎯 Personalized
              </Typography>
              <Typography variant="body1">
                Our AI learns from your behavior to suggest products you'll love
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                🔍 Smart Discovery
              </Typography>
              <Typography variant="body1">
                Find products you never knew you wanted through intelligent algorithms
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                📈 Always Learning
              </Typography>
              <Typography variant="body1">
                Recommendations get better over time as we learn your preferences
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Home;
