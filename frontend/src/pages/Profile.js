import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [myCars, setMyCars] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
      fetchMyCars();
    }
  }, [user]);

  const fetchMyCars = async () => {
    try {
      const response = await api.get('/cars/my-cars');
      setMyCars(response.data);
    } catch (error) {
      console.error('Error fetching my cars:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/cars/${carId}`);
        setMyCars(myCars.filter(car => car._id !== carId));
        setMessage('Car listing deleted successfully!');
      } catch (error) {
        setMessage('Error deleting car listing');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Form */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Profile Information
            </Typography>
            {message && (
              <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                disabled
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3 }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* My Listings */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                My Vehicle Listings ({myCars.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/cars/create')}
              >
                List New Vehicle
              </Button>
            </Box>

            {myCars.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven&apos;t listed any vehicles yet.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate('/cars/create')}
                  sx={{ mt: 2 }}
                >
                  List Your First Vehicle
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {myCars.map((car) => (
                  <Grid item xs={12} sm={6} key={car._id}>
                    <Card>
                      <CardMedia
                        component="div"
                        sx={{
                          height: 150,
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
                          <Typography variant="body1">{car.make} {car.model}</Typography>
                        )}
                      </CardMedia>
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {car.make} {car.model} {car.year}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${car.price.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => navigate(`/cars/${car._id}`)}
                          >
                            View
                          </Button>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteCar(car._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
