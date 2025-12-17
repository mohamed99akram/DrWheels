import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
} from '@mui/material';
import api from '../services/api';

const CreateCar = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    color: '',
    description: '',
    images: []
  });
  const [imageUrls, setImageUrls] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setFormData({ ...formData, images: newUrls.filter(url => url.trim() !== '') });
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/cars', formData);
      navigate('/cars');
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating car listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          List Your Vehicle
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Make"
                name="make"
                value={formData.make}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Price ($)"
                name="price"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images (URLs)
              </Typography>
              {imageUrls.map((url, index) => (
                <TextField
                  key={index}
                  fullWidth
                  label={`Image URL ${index + 1}`}
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  sx={{ mb: 2 }}
                />
              ))}
              <Button onClick={addImageField} variant="outlined" sx={{ mb: 2 }}>
                Add Image URL
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'List Vehicle'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/cars')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateCar;

