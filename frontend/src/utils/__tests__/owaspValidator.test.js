import {
  owaspRules,
  sanitizeInput,
  validateAndSanitize,
  validationSchemas
} from '../owaspValidator';

describe('OWASP Validator', () => {
  describe('Email Validation', () => {
    it('should validate correct email', () => {
      expect(owaspRules.email('test@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(owaspRules.email('invalid')).toBe(false);
      expect(owaspRules.email('test@')).toBe(false);
      expect(owaspRules.email('<script>test@example.com</script>')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      expect(owaspRules.password('SecurePass123!@#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(owaspRules.password('weak')).toBe(false);
      expect(owaspRules.password('NoSpecial123')).toBe(false);
      expect(owaspRules.password('password123!')).toBe(false); // common pattern
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should detect SQL injection patterns', () => {
      expect(owaspRules.text("'; DROP TABLE users; --")).toBe(false);
      expect(owaspRules.text("1' OR '1'='1")).toBe(false);
      expect(owaspRules.text("UNION SELECT * FROM users")).toBe(false);
    });

    it('should allow safe text', () => {
      expect(owaspRules.text('Safe text content')).toBe(true);
    });
  });

  describe('XSS Prevention', () => {
    it('should detect XSS patterns', () => {
      expect(owaspRules.text('<script>alert("xss")</script>')).toBe(false);
      expect(owaspRules.text('javascript:alert(1)')).toBe(false);
      expect(owaspRules.text('<img onerror="alert(1)">')).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML', () => {
      const malicious = '<script>alert("xss")</script>Safe text';
      const sanitized = sanitizeInput.html(malicious);
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize text', () => {
      const malicious = '<script>test</script>';
      const sanitized = sanitizeInput.text(malicious);
      expect(sanitized).not.toContain('<script>');
    });

    it('should sanitize URLs', () => {
      expect(sanitizeInput.url('javascript:alert(1)')).toBe('');
      expect(sanitizeInput.url('https://example.com')).toBe('https://example.com');
    });
  });

  describe('Form Validation', () => {
    it('should validate login form', () => {
      const result = validateAndSanitize(
        { email: 'test@example.com', password: 'password' },
        validationSchemas.login
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid login form', () => {
      const result = validateAndSanitize(
        { email: 'invalid', password: '' },
        validationSchemas.login
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should validate car form', () => {
      const result = validateAndSanitize(
        {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          price: 25000
        },
        validationSchemas.car
      );
      expect(result.isValid).toBe(true);
    });
  });
});

