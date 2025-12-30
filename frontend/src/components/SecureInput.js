/**
 * Secure Input Component
 * Implements OWASP input validation and XSS prevention
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { getValidationError, sanitizeInput } from '../utils/owaspValidator';

const SecureInput = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  schema,
  required = false,
  multiline = false,
  rows = 1,
  helperText,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched && schema) {
      const validationError = getValidationError(name, value, schema);
      setError(validationError || '');
    }
  }, [value, touched, name, schema]);

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Sanitize based on input type
    if (type === 'email') {
      newValue = sanitizeInput.email(newValue);
    } else if (type === 'url') {
      newValue = sanitizeInput.url(newValue);
    } else if (type !== 'password' && type !== 'number') {
      newValue = sanitizeInput.text(newValue);
    }

    // Call original onChange
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: newValue,
          name
        }
      });
    }

    // Validate on change
    if (touched && schema) {
      const validationError = getValidationError(name, newValue, schema);
      setError(validationError || '');
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (schema) {
      const validationError = getValidationError(name, value, schema);
      setError(validationError || '');
    }
  };

  return (
    <TextField
      {...props}
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={!!error}
      helperText={error || helperText}
      required={required}
      multiline={multiline}
      rows={rows}
      inputProps={{
        ...props.inputProps,
        maxLength: schema?.[name]?.maxLength || undefined
      }}
    />
  );
};

SecureInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  schema: PropTypes.object,
  required: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  helperText: PropTypes.string,
  inputProps: PropTypes.object,
};

SecureInput.defaultProps = {
  type: 'text',
  required: false,
  multiline: false,
  rows: 1,
  schema: null,
  helperText: '',
  inputProps: {},
};

export default SecureInput;

