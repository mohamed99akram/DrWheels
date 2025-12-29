import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia, Rating } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState([]);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const response = await api.get('/cars', {
        params: { limit: 6, sortBy: 'averageRating', sortOrder: 'desc' }
      });
      const cars = Array.isArray(response.data) ? response.data : (response.data.cars || []);
      setFeaturedCars(cars.slice(0, 6));
    } catch (error) {
      console.error('Error fetching featured cars:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" py={8} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2, mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Dr Wheels
        </Typography>
        <Typography variant="h5" paragraph>
          Your Complete Vehicle Marketplace
        </Typography>
        <Box mt={4}>
          <Button
            variant="contained"
            size="large"
            sx={{ bgcolor: 'white', color: 'primary.main', mr: 2, '&:hover': { bgcolor: 'grey.100' } }}
            onClick={() => navigate('/cars')}
          >
            Browse Vehicles
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            component={Link}
            to="/register"
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Featured Vehicles */}
      {featuredCars.length > 0 && (
        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Vehicles
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {featuredCars.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car._id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                  onClick={() => navigate(`/cars/${car._id}`)}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      backgroundColor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <Typography variant="h6">{car.make} {car.model}</Typography>
                    )}
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" noWrap>
                      {car.make} {car.model} {car.year}
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1, mb: 1 }}>
                      ${car.price.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {car.mileage.toLocaleString()} miles
                      </Typography>
                      {car.averageRating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Rating value={car.averageRating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({car.reviewCount})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/cars')}
            >
              View All Vehicles
            </Button>
          </Box>
        </Box>
      )}

      {/* Features Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Why Choose DrWheels?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>🔍 Easy Search</Typography>
              <Typography variant="body1" color="text.secondary">
                Find your perfect vehicle with advanced filters and search options
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>⭐ Verified Reviews</Typography>
              <Typography variant="body1" color="text.secondary">
                Read authentic reviews from verified buyers and sellers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>💬 Direct Communication</Typography>
              <Typography variant="body1" color="text.secondary">
                Chat directly with sellers and negotiate deals
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
