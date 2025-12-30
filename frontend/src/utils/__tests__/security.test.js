import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  secureStorage,
  isSecureContext,
  sanitizeUrl,
  escapeHtml
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('should sanitize XSS attempts', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(malicious);
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@invalid.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('SecurePass123!@#');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject weak passwords', () => {
      const result1 = validatePassword('short');
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThan(0);

      const result2 = validatePassword('nouppercase123!');
      expect(result2.isValid).toBe(false);

      const result3 = validatePassword('NOLOWERCASE123!');
      expect(result3.isValid).toBe(false);

      const result4 = validatePassword('NoNumbers!');
      expect(result4.isValid).toBe(false);

      const result5 = validatePassword('NoSpecial123');
      expect(result5.isValid).toBe(false);
    });
  });

  describe('secureStorage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Reset localStorage mock
      localStorage.getItem.mockReturnValue(null);
      localStorage.setItem.mockClear();
      localStorage.removeItem.mockClear();
      localStorage.clear.mockClear();
    });

    it('should set item in localStorage', () => {
      secureStorage.setItem('test', 'value');
      expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value');
    });

    it('should get item from localStorage', () => {
      localStorage.getItem.mockReturnValue('value');
      const result = secureStorage.getItem('test');
      expect(localStorage.getItem).toHaveBeenCalledWith('test');
      expect(result).toBe('value');
    });

    it('should remove item from localStorage', () => {
      secureStorage.removeItem('test');
      expect(localStorage.removeItem).toHaveBeenCalledWith('test');
    });

    it('should clear localStorage', () => {
      secureStorage.clear();
      expect(localStorage.clear).toHaveBeenCalled();
    });
  });

  describe('isSecureContext', () => {
    it('should detect secure context', () => {
      const originalProtocol = window.location.protocol;
      Object.defineProperty(window, 'location', {
        value: { protocol: 'https:' },
        writable: true
      });
      
      expect(isSecureContext()).toBe(true);
      
      Object.defineProperty(window, 'location', {
        value: { protocol: originalProtocol },
        writable: true
      });
    });
  });

  describe('sanitizeUrl', () => {
    beforeEach(() => {
      // Mock window.location.origin for tests
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          protocol: 'http:',
          host: 'localhost:3000'
        },
        writable: true
      });
    });

    it('should allow same origin URLs', () => {
      const url = 'http://localhost:3000/test';
      const result = sanitizeUrl(url);
      expect(result).toBeTruthy();
      expect(result).toContain('/test');
    });

    it('should allow API URL', () => {
      const url = 'http://localhost:4000/api/test';
      const result = sanitizeUrl(url);
      expect(result).toBeTruthy();
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
      expect(sanitizeUrl('')).toBeNull();
      expect(sanitizeUrl(null)).toBeNull();
    });

    it('should reject external URLs', () => {
      expect(sanitizeUrl('https://evil.com')).toBeNull();
      expect(sanitizeUrl('http://malicious.com')).toBeNull();
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quotes"')).toBe('&quot;quotes&quot;');
      expect(escapeHtml("'apostrophe'")).toBe('&#039;apostrophe&#039;');
      expect(escapeHtml('&ampersand&')).toBe('&amp;ampersand&amp;');
    });
  });
});

