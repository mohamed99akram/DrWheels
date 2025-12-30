import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Alert,
} from '@mui/material';
import api from '../services/api';
import SecureInput from '../components/SecureInput';
import { validateAndSanitize, validationSchemas } from '../utils/owaspValidator';
import { checkRateLimit, rateLimits } from '../utils/rateLimiter';

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
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
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
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Check rate limit
    const rateLimit = checkRateLimit('create_car', rateLimits.form);
    if (!rateLimit.allowed) {
      setError(`Too many submissions. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`);
      setLoading(false);
      return;
    }

    // Validate and sanitize input
    const validation = validateAndSanitize(formData, validationSchemas.car);

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please fix the errors below');
      setLoading(false);
      return;
    }

    try {
      await api.post('/cars', validation.sanitized);
      navigate('/cars');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error creating car listing');
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                required
                name="make"
                label="Make"
                value={formData.make}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.make}
                helperText={fieldErrors.make}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                required
                name="model"
                label="Model"
                value={formData.model}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.model}
                helperText={fieldErrors.model}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                required
                type="number"
                name="year"
                label="Year"
                value={formData.year}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.year}
                helperText={fieldErrors.year}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                required
                type="number"
                name="price"
                label="Price ($)"
                value={formData.price}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.price}
                helperText={fieldErrors.price}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                type="number"
                name="mileage"
                label="Mileage"
                value={formData.mileage}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.mileage}
                helperText={fieldErrors.mileage}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SecureInput
                fullWidth
                name="color"
                label="Color"
                value={formData.color}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.color}
                helperText={fieldErrors.color}
              />
            </Grid>
            <Grid item xs={12}>
              <SecureInput
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                schema={validationSchemas.car}
                error={!!fieldErrors.description}
                helperText={fieldErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images (URLs)
              </Typography>
              {imageUrls.map((url, index) => (
                <SecureInput
                  key={index}
                  fullWidth
                  name={`image_${index}`}
                  label={`Image URL ${index + 1}`}
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  schema={validationSchemas.car}
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

