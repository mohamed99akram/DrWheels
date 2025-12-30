import {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  initCSRFProtection,
  addCSRFTokenToHeaders,
  verifyCSRFToken
} from '../csrfProtection';

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.sessionStorage = sessionStorageMock;

describe('CSRF Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  describe('generateCSRFToken', () => {
    it('should generate a token', () => {
      const token = generateCSRFToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('storeCSRFToken', () => {
    it('should store token in sessionStorage', () => {
      const token = 'test-token';
      storeCSRFToken(token);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('csrf_token', token);
    });
  });

  describe('getCSRFToken', () => {
    it('should retrieve token from sessionStorage', () => {
      sessionStorageMock.getItem.mockReturnValue('stored-token');
      const token = getCSRFToken();
      expect(token).toBe('stored-token');
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('csrf_token');
    });

    it('should return null if token does not exist', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      const token = getCSRFToken();
      expect(token).toBeNull();
    });
  });

  describe('initCSRFProtection', () => {
    it('should generate and store token if none exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      const token = initCSRFProtection();
      expect(token).toBeDefined();
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    it('should return existing token if one exists', () => {
      sessionStorageMock.getItem.mockReturnValue('existing-token');
      const token = initCSRFProtection();
      expect(token).toBe('existing-token');
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('addCSRFTokenToHeaders', () => {
    it('should add CSRF token to headers', () => {
      sessionStorageMock.getItem.mockReturnValue('test-token');
      const headers = addCSRFTokenToHeaders({ 'Content-Type': 'application/json' });
      expect(headers['X-CSRF-Token']).toBe('test-token');
    });

    it('should work with empty headers object', () => {
      sessionStorageMock.getItem.mockReturnValue('test-token');
      const headers = addCSRFTokenToHeaders();
      expect(headers['X-CSRF-Token']).toBe('test-token');
    });

    it('should not add token if none exists', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      const headers = addCSRFTokenToHeaders({ 'Content-Type': 'application/json' });
      expect(headers['X-CSRF-Token']).toBeUndefined();
    });
  });

  describe('verifyCSRFToken', () => {
    it('should verify matching token', () => {
      sessionStorageMock.getItem.mockReturnValue('stored-token');
      expect(verifyCSRFToken('stored-token')).toBe(true);
    });

    it('should reject non-matching token', () => {
      sessionStorageMock.getItem.mockReturnValue('stored-token');
      expect(verifyCSRFToken('different-token')).toBe(false);
    });

    it('should return false if no stored token', () => {
      sessionStorageMock.getItem.mockReturnValue(null);
      expect(verifyCSRFToken('any-token')).toBe(false);
    });
  });
});

