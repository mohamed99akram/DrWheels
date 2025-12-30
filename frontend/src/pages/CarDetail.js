import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Divider,
  ImageList,
  ImageListItem,
  Alert,
} from '@mui/material';
import { Favorite, FavoriteBorder, ArrowBack, ShoppingCart } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import SecureInput from '../components/SecureInput';
import { validateAndSanitize, validationSchemas, sanitizeInput } from '../utils/owaspValidator';
import { checkRateLimit, rateLimits } from '../utils/rateLimiter';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [orderNotes, setOrderNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [reviewFieldErrors, setReviewFieldErrors] = useState({});

  useEffect(() => {
    fetchCar();
    fetchReviews();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchCar = async () => {
    try {
      const response = await api.get(`/cars/${id}`);
      setCar(response.data);
    } catch (error) {
      console.error('Error fetching car:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/car/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get(`/favorites/check/${id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { carId: id });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCreateOrder = async () => {
    setOrderError('');
    
    // Check rate limit
    const rateLimit = checkRateLimit('create_order', rateLimits.form);
    if (!rateLimit.allowed) {
      setOrderError(`Too many submissions. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`);
      return;
    }

    try {
      // Validate order notes
      const notesSchema = {
        notes: {
          required: false,
          validate: (value) => !value || validationSchemas.car.description.validate(value),
          sanitize: (value) => value ? sanitizeInput.text(value) : '',
          default: ''
        }
      };
      
      const validation = validateAndSanitize({ notes: orderNotes }, notesSchema);

      await api.post('/orders', { carId: id, notes: validation.sanitized.notes });
      setOrderDialogOpen(false);
      setOrderNotes('');
      setOrderError('');
      fetchCar();
    } catch (error) {
      setOrderError(error.response?.data?.error || error.message || 'Error creating order');
    }
  };

  const handleSubmitReview = async () => {
    setReviewError('');
    setReviewFieldErrors({});

    // Check rate limit
    const rateLimit = checkRateLimit('submit_review', rateLimits.form);
    if (!rateLimit.allowed) {
      setReviewError(`Too many submissions. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`);
      return;
    }

    // Validate and sanitize
    const validation = validateAndSanitize(reviewForm, validationSchemas.review);
    if (!validation.isValid) {
      setReviewFieldErrors(validation.errors);
      setReviewError('Please fix the errors below');
      return;
    }

    try {
      await api.post(`/reviews/car/${id}`, validation.sanitized);
      setReviewDialogOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      setReviewError('');
      fetchReviews();
      fetchCar();
    } catch (error) {
      setReviewError(error.response?.data?.error || error.message || 'Error submitting review');
    }
  };

  if (loading) {
    return <Container sx={{ mt: 4, textAlign: 'center' }}>Loading...</Container>;
  }

  if (!car) {
    return <Container sx={{ mt: 4 }}>Car not found</Container>;
  }

  const isOwner = user && car.seller?._id === user.id;
  const canPurchase = user && !isOwner && car.status === 'available';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate('/cars')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6">Back to Vehicles</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Images */}
          <Grid item xs={12} md={6}>
            {car.images && car.images.length > 0 ? (
              <ImageList cols={1} sx={{ width: '100%', height: 500 }}>
                {car.images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={image}
                      alt={`${car.make} ${car.model} ${index + 1}`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Box
                sx={{
                  height: 500,
                  backgroundColor: 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4">
                  {car.make} {car.model}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Box>
                <Typography variant="h3" component="h1" gutterBottom>
                  {car.make} {car.model} {car.year}
                </Typography>
                <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                  ${car.price.toLocaleString()}
                </Typography>
              </Box>
              {user && (
                <IconButton onClick={toggleFavorite} size="large">
                  {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
                </IconButton>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Chip label={car.status} color={car.status === 'available' ? 'success' : 'default'} sx={{ mr: 1 }} />
              {car.color && <Chip label={car.color} sx={{ mr: 1 }} />}
              {car.averageRating > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Rating value={car.averageRating} readOnly />
                  <Typography variant="body2" color="text.secondary">
                    ({car.reviewCount} reviews)
                  </Typography>
                </Box>
              )}
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Mileage
                </Typography>
                <Typography variant="h6">{car.mileage.toLocaleString()} miles</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Year
                </Typography>
                <Typography variant="h6">{car.year}</Typography>
              </Grid>
            </Grid>

            {car.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">{car.description}</Typography>
              </Box>
            )}

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Seller
              </Typography>
              <Typography variant="body1">
                {car.seller?.name || 'Unknown'}
              </Typography>
            </Box>

            {canPurchase && (
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={() => setOrderDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Purchase Vehicle
              </Button>
            )}

            {user && !isOwner && (
              <Button
                variant="outlined"
                onClick={() => setReviewDialogOpen(true)}
              >
                Write Review
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Reviews ({reviews.length})
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {reviews.length === 0 ? (
          <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
        ) : (
          <Box>
            {reviews.map((review) => (
              <Card key={review._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 2 }}>
                      {review.user?.name?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {review.user?.name || 'Anonymous'}
                      </Typography>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {review.comment && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.comment}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(e, newValue) => setReviewForm({ ...reviewForm, rating: newValue })}
            />
            {reviewError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {reviewError}
              </Alert>
            )}
            <SecureInput
              fullWidth
              multiline
              rows={4}
              name="comment"
              label="Comment"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              schema={validationSchemas.review}
              error={!!reviewFieldErrors.comment}
              helperText={reviewFieldErrors.comment}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)}>
        <DialogTitle>Purchase Vehicle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" gutterBottom>
              {car.make} {car.model} {car.year}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ${car.price.toLocaleString()}
            </Typography>
            {orderError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {orderError}
              </Alert>
            )}
            <SecureInput
              fullWidth
              multiline
              rows={4}
              name="notes"
              label="Additional Notes (Optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              schema={{
                notes: {
                  required: false,
                  validate: (value) => !value || validationSchemas.car.description.validate(value),
                  sanitize: (value) => value ? validationSchemas.car.description.sanitize(value) : '',
                  default: ''
                }
              }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOrder} variant="contained">Confirm Purchase</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarDetail;
