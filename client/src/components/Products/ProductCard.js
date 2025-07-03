import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Rating,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ProductCard = ({ product, onProductInteraction }) => {
  const [liked, setLiked] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { isAuthenticated } = useAuth();

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to like products', severity: 'warning' });
      return;
    }

    try {
      const response = await productsAPI.likeProduct(product._id);
      setLiked(response.data.isLiked);
      setSnackbar({ 
        open: true, 
        message: response.data.message, 
        severity: 'success' 
      });
      if (onProductInteraction) onProductInteraction();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to like product', 
        severity: 'error' 
      });
    }
  };

  const handleView = async () => {
    if (!isAuthenticated) return;

    try {
      await productsAPI.viewProduct(product._id);
      if (onProductInteraction) onProductInteraction();
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handlePurchase = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setSnackbar({ open: true, message: 'Please login to purchase products', severity: 'warning' });
      return;
    }

    try {
      await productsAPI.purchaseProduct(product._id);
      setSnackbar({ 
        open: true, 
        message: 'Purchase recorded successfully!', 
        severity: 'success' 
      });
      if (onProductInteraction) onProductInteraction();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to record purchase', 
        severity: 'error' 
      });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            transition: 'transform 0.2s',
          }
        }}
        onClick={handleView}
      >
        <CardMedia
          component="img"
          height="200"
          image={product.image_url || '/placeholder-image.jpg'}
          alt={product.product_name}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {product.product_name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {product.manufacturer}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={product.rating} precision={0.1} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              ({product.rating})
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}
          >
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
            <Chip label={product.category} size="small" color="primary" />
            {product.is_featured && (
              <Chip label="Featured" size="small" color="secondary" />
            )}
            {product.is_on_sale && (
              <Chip label="Sale" size="small" color="error" />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" color="primary" component="span">
                {formatPrice(product.is_on_sale ? product.sale_price : product.price)}
              </Typography>
              {product.is_on_sale && (
                <Typography 
                  variant="body2" 
                  sx={{ textDecoration: 'line-through', ml: 1 }}
                  component="span"
                >
                  {formatPrice(product.price)}
                </Typography>
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Stock: {product.quantity_in_stock}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            <IconButton onClick={handleLike} color={liked ? 'error' : 'default'}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton>
              <VisibilityIcon />
            </IconButton>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<ShoppingCartIcon />}
            onClick={handlePurchase}
            disabled={product.quantity_in_stock === 0}
            size="small"
          >
            {product.quantity_in_stock === 0 ? 'Out of Stock' : 'Buy'}
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
