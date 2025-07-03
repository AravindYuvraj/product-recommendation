import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import ProductCard from '../Products/ProductCard';
import { recommendationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const RecommendationSection = () => {
  const [tabValue, setTabValue] = useState(0);
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const tabs = [
    { label: 'Personalized', key: 'personalized', requiresAuth: true },
    { label: 'Trending', key: 'trending', requiresAuth: false },
    { label: 'Content-Based', key: 'contentBased', requiresAuth: true },
    { label: 'Collaborative', key: 'collaborative', requiresAuth: true },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllRecommendations();
    } else {
      fetchTrendingRecommendations();
    }
  }, [isAuthenticated]);

  const fetchAllRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [personalized, trending, contentBased, collaborative] = await Promise.all([
        recommendationsAPI.getPersonalized(8),
        recommendationsAPI.getTrending(8),
        recommendationsAPI.getContentBased(8),
        recommendationsAPI.getCollaborative(8),
      ]);

      setRecommendations({
        personalized: personalized.data.recommendations,
        trending: trending.data.recommendations,
        contentBased: contentBased.data.recommendations,
        collaborative: collaborative.data.recommendations,
      });
    } catch (err) {
      setError('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingRecommendations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await recommendationsAPI.getTrending(8);
      setRecommendations({
        trending: response.data.recommendations,
      });
    } catch (err) {
      setError('Failed to fetch trending products');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getCurrentRecommendations = () => {
    const currentTab = tabs[tabValue];
    return recommendations[currentTab.key] || [];
  };

  const getTabDescription = () => {
    const descriptions = {
      personalized: 'Products tailored specifically for you based on your preferences and behavior',
      trending: 'Currently popular products that other users are viewing and purchasing',
      contentBased: 'Products similar to ones you\'ve liked, based on categories and features',
      collaborative: 'Products liked by users with similar tastes to yours',
    };
    
    return descriptions[tabs[tabValue].key];
  };

  if (!isAuthenticated && tabValue !== 1) {
    setTabValue(1); // Switch to trending tab for non-authenticated users
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom component="div" textAlign="center">
        AI-Powered Recommendations
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          {tabs.map((tab, index) => (
            <Tab
              key={tab.key}
              label={tab.label}
              disabled={tab.requiresAuth && !isAuthenticated}
            />
          ))}
        </Tabs>
      </Box>

      <Typography 
        variant="body1" 
        color="text.secondary" 
        textAlign="center" 
        sx={{ mb: 3 }}
      >
        {getTabDescription()}
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3}>
          {getCurrentRecommendations().map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard 
                product={product} 
                onProductInteraction={isAuthenticated ? fetchAllRecommendations : fetchTrendingRecommendations}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && getCurrentRecommendations().length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {isAuthenticated 
              ? 'No recommendations available. Try interacting with some products!'
              : 'Please login to see personalized recommendations.'
            }
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default RecommendationSection;
