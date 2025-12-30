import {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
  initCSRFProtection,
  addCSRFTokenToHeaders,
  verifyCSRFToken
} from '../csrfProtection';

// Use the sessionStorage mock from setupTests
const sessionStorageMock = global.sessionStorage;
const sessionStorageStore = global.sessionStorageStore;

describe('CSRF Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply storage mock implementations cleared by jest.clearAllMocks
    sessionStorageMock.getItem.mockImplementation((key) => sessionStorageStore[key] || null);
    sessionStorageMock.setItem.mockImplementation((key, value) => { sessionStorageStore[key] = value.toString(); });
    sessionStorageMock.removeItem.mockImplementation((key) => { delete sessionStorageStore[key]; });
    sessionStorageMock.clear.mockImplementation(() => {
      Object.keys(sessionStorageStore).forEach((key) => {
        delete sessionStorageStore[key];
      });
    });

    // Clear token store
    sessionStorage.clear();

    // Ensure crypto mock has a deterministic but changing output
    global.crypto.__counter = 0;
    global.crypto.getRandomValues.mockImplementation((arr) => {
      global.crypto.__counter = (global.crypto.__counter || 0) + 1;
      const c = global.crypto.__counter;
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (c + i) % 256;
      }
      return arr;
    });
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
      sessionStorage.setItem('csrf_token', 'stored-token');
      const token = getCSRFToken();
      expect(token).toBe('stored-token');
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('csrf_token');
    });

    it('should return null if token does not exist', () => {
      sessionStorage.clear();
      const token = getCSRFToken();
      expect(token).toBeNull();
    });
  });

  describe('initCSRFProtection', () => {
    it('should generate and store token if none exists', () => {
      sessionStorage.clear();
      const token = initCSRFProtection();
      expect(token).toBeDefined();
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    it('should return existing token if one exists', () => {
      sessionStorage.setItem('csrf_token', 'existing-token');

      // Clear call history from the setup above; we only want to assert what initCSRFProtection does.
      sessionStorageMock.setItem.mockClear();

      const token = initCSRFProtection();
      expect(token).toBe('existing-token');
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('addCSRFTokenToHeaders', () => {
    it('should add CSRF token to headers', () => {
      sessionStorage.setItem('csrf_token', 'test-token');
      const headers = addCSRFTokenToHeaders({ 'Content-Type': 'application/json' });
      expect(headers['X-CSRF-Token']).toBe('test-token');
    });

    it('should work with empty headers object', () => {
      sessionStorage.setItem('csrf_token', 'test-token');
      const headers = addCSRFTokenToHeaders();
      expect(headers['X-CSRF-Token']).toBe('test-token');
    });

    it('should not add token if none exists', () => {
      sessionStorage.clear();
      const headers = addCSRFTokenToHeaders({ 'Content-Type': 'application/json' });
      expect(headers['X-CSRF-Token']).toBeUndefined();
    });
  });

  describe('verifyCSRFToken', () => {
    it('should verify matching token', () => {
      sessionStorage.setItem('csrf_token', 'stored-token');
      expect(verifyCSRFToken('stored-token')).toBe(true);
    });

    it('should reject non-matching token', () => {
      sessionStorage.setItem('csrf_token', 'stored-token');
      expect(verifyCSRFToken('different-token')).toBe(false);
    });

    it('should return false if no stored token', () => {
      sessionStorage.clear();
      expect(verifyCSRFToken('any-token')).toBe(false);
    });
  });
});

