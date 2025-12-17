import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  IconButton,
  Pagination,
  Slider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Cars = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    model: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    minMileage: '',
    maxMileage: '',
    color: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 12,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await api.get('/cars', { params });
      // Handle both old format (array) and new format (object with cars and pagination)
      if (Array.isArray(response.data)) {
        setCars(response.data);
      } else {
        setCars(response.data.cars || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      const favoriteIds = new Set(response.data.map(car => car._id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const toggleFavorite = async (e, carId) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const isFavorite = favorites.has(carId);
      if (isFavorite) {
        await api.delete(`/favorites/${carId}`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(carId);
          return newSet;
        });
      } else {
        await api.post('/favorites', { carId });
        setFavorites(prev => new Set(prev).add(carId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading && cars.length === 0) {
    return <Container sx={{ mt: 4, textAlign: 'center' }}>Loading...</Container>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vehicle Marketplace
        </Typography>
        {user && (
          <Button variant="contained" onClick={() => navigate('/cars/create')}>
            List Your Vehicle
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Make, model, or description"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Make"
              value={filters.make}
              onChange={(e) => handleFilterChange('make', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Model"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Min Year"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Max Year"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Color"
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="createdAt">Newest</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="year">Year</MenuItem>
                <MenuItem value="mileage">Mileage</MenuItem>
                <MenuItem value="averageRating">Rating</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setFilters({
                search: '',
                make: '',
                model: '',
                minYear: '',
                maxYear: '',
                minPrice: '',
                maxPrice: '',
                minMileage: '',
                maxMileage: '',
                color: '',
                sortBy: 'createdAt',
                sortOrder: 'desc'
              });
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* Cars Grid */}
      <Grid container spacing={3}>
        {cars.map((car) => (
          <Grid item xs={12} sm={6} md={4} key={car._id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6
                }
              }} 
              onClick={() => navigate(`/cars/${car._id}`)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    backgroundColor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
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
                {user && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                    onClick={(e) => toggleFavorite(e, car._id)}
                  >
                    {favorites.has(car._id) ? (
                      <Favorite color="error" />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" noWrap>
                  {car.make} {car.model} {car.year}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 1, mb: 1 }}>
                  ${car.price.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
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
                {car.color && (
                  <Chip label={car.color} size="small" sx={{ mt: 1 }} />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(e, value) => setPagination({ ...pagination, page: value })}
            color="primary"
          />
        </Box>
      )}

      {cars.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No vehicles found
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Cars;
