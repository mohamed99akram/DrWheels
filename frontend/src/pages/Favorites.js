import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  IconButton,
  Rating,
  Chip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (e, carId) => {
    e.stopPropagation();
    try {
      await api.delete(`/favorites/${carId}`);
      setFavorites(favorites.filter(car => car._id !== carId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Please login to view your favorites</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Favorites
      </Typography>

      {loading ? (
        <Box textAlign="center" py={4}>Loading...</Box>
      ) : favorites.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No favorites yet. Start adding vehicles to your favorites!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((car) => (
            <Grid item xs={12} sm={6} md={4} key={car._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
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
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                    }}
                    onClick={(e) => removeFavorite(e, car._id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {car.make} {car.model} {car.year}
                  </Typography>
                  <Typography variant="h5" color="primary" sx={{ mt: 1, mb: 1 }}>
                    ${car.price.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
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
                  {car.color && <Chip label={car.color} size="small" />}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites;

