import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SecureInput from '../SecureInput';
import { validationSchemas } from '../../utils/owaspValidator';

describe('SecureInput Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    render(
      <SecureInput
        name="test"
        label="Test Input"
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText('Test Input')).toBeInTheDocument();
  });

  it('should sanitize input on change', () => {
    render(
      <SecureInput
        name="test"
        label="Test Input"
        value=""
        onChange={mockOnChange}
        type="text"
      />
    );

    const input = screen.getByLabelText('Test Input');
    fireEvent.change(input, { target: { value: '<script>alert("xss")</script>Test' } });

    expect(mockOnChange).toHaveBeenCalled();
    const callArgs = mockOnChange.mock.calls[0][0];
    expect(callArgs.target.value).not.toContain('<script>');
  });

  it('should validate email input', () => {
    render(
      <SecureInput
        name="email"
        label="Email"
        value=""
        onChange={mockOnChange}
        type="email"
        schema={validationSchemas.auth.email}
      />
    );

    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.blur(input);

    // Should show validation error
    expect(screen.getByText(/invalid|email/i)).toBeInTheDocument();
  });

  it('should validate password input', () => {
    render(
      <SecureInput
        name="password"
        label="Password"
        value=""
        onChange={mockOnChange}
        type="password"
        schema={validationSchemas.auth.password}
        required
      />
    );

    const input = screen.getByLabelText('Password');
    fireEvent.change(input, { target: { value: 'weak' } });
    fireEvent.blur(input);

    // Should show validation error for weak password
    expect(screen.getByText(/password|strong|characters/i)).toBeInTheDocument();
  });

  it('should show helper text', () => {
    render(
      <SecureInput
        name="test"
        label="Test Input"
        value=""
        onChange={mockOnChange}
        helperText="This is helper text"
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should handle multiline input', () => {
    render(
      <SecureInput
        name="description"
        label="Description"
        value=""
        onChange={mockOnChange}
        multiline
        rows={4}
      />
    );

    const input = screen.getByLabelText('Description');
    expect(input.tagName).toBe('TEXTAREA');
  });

  it('should respect maxLength from schema', () => {
    const schema = {
      test: {
        maxLength: 10,
        validate: () => true,
      }
    };

    render(
      <SecureInput
        name="test"
        label="Test Input"
        value=""
        onChange={mockOnChange}
        schema={schema.test}
      />
    );

    const input = screen.getByLabelText('Test Input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('should handle required field validation', () => {
    render(
      <SecureInput
        name="required-field"
        label="Required Field"
        value=""
        onChange={mockOnChange}
        required
      />
    );

    const input = screen.getByLabelText('Required Field');
    expect(input).toBeRequired();
  });
});

