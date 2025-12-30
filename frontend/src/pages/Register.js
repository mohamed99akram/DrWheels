import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import SecureInput from '../components/SecureInput';
import { validateAndSanitize, validationSchemas } from '../utils/owaspValidator';
import { checkRateLimit, rateLimits } from '../utils/rateLimiter';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Check rate limit
    const rateLimit = checkRateLimit('register', rateLimits.auth);
    if (!rateLimit.allowed) {
      setError(`Too many registration attempts. Please wait ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`);
      return;
    }

    // Validate and sanitize input
    const validation = validateAndSanitize(
      { name, email, password },
      validationSchemas.register
    );

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError('Please fix the errors below');
      return;
    }

    try {
      await register(
        validation.sanitized.email,
        validation.sanitized.password,
        validation.sanitized.name
      );
      navigate('/cars');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <SecureInput
            fullWidth
            name="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            schema={validationSchemas.register}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name || '2-50 characters, letters only'}
          />
          <SecureInput
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            schema={validationSchemas.register}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
          />
          <SecureInput
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            schema={validationSchemas.register}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || 'Min 8 chars: uppercase, lowercase, number, special char (@$!%*?&)'}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
