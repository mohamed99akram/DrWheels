// Mock axios before importing api
const requestHandlers = [];
const responseHandlers = [];

jest.mock('axios', () => {
  const mockAxiosInstance = {
    defaults: {
      baseURL: 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        common: {}
      }
    },
    interceptors: {
      request: {
        use: jest.fn((fulfilled, rejected) => {
          requestHandlers.push({ fulfilled, rejected });
          return 0; // Return handler ID
        }),
        handlers: requestHandlers
      },
      response: {
        use: jest.fn((fulfilled, rejected) => {
          responseHandlers.push({ fulfilled, rejected });
          return 0; // Return handler ID
        }),
        handlers: responseHandlers
      }
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} }))
  };
  
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance),
      ...mockAxiosInstance
    }
  };
});

let api;
let secureStorage;
let checkRateLimit;

jest.mock('../../utils/security', () => ({
  secureStorage: {
    getItem: jest.fn(),
    removeItem: jest.fn(),
  }
}));

jest.mock('../../utils/csrfProtection', () => ({
  getCSRFToken: jest.fn(() => 'test-csrf-token'),
  addCSRFTokenToHeaders: jest.fn((headers) => {
    return { ...headers, 'X-CSRF-Token': 'test-csrf-token' };
  }),
}));

jest.mock('../../utils/rateLimiter', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, remaining: 10 })),
  rateLimits: {
    auth: { windowMs: 900000, max: 5 },
    api: { windowMs: 60000, max: 30 },
    search: { windowMs: 10000, max: 5 },
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset handlers and re-require api so interceptors are re-registered
    requestHandlers.length = 0;
    responseHandlers.length = 0;
    jest.resetModules();

    // Re-require mocked modules after resetModules so we share the same instances
    ({ secureStorage } = require('../../utils/security'));
    ({ checkRateLimit } = require('../../utils/rateLimiter'));

    secureStorage.getItem.mockReturnValue(null);

    const apiModule = require('../api');
    api = apiModule.default || apiModule;
  });

  it('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe(
      process.env.REACT_APP_API_URL || 'http://localhost:4000/api'
    );
  });

  it('should have timeout configured', () => {
    expect(api.defaults.timeout).toBe(10000);
  });

  it('should add Authorization header when token exists', () => {
    secureStorage.getItem.mockReturnValue('test-token');
    
    // Get the first request interceptor handler
    const handler = api.interceptors.request.handlers[0];
    const config = handler.fulfilled({
      headers: {},
      method: 'get',
      url: '/test'
    });

    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('should add CSRF token for POST requests', () => {
    const handler = api.interceptors.request.handlers[0];
    const config = handler.fulfilled({
      headers: {},
      method: 'post',
      url: '/test'
    });

    expect(config.headers['X-CSRF-Token']).toBe('test-csrf-token');
  });

  it('should check rate limit before requests', () => {
    const handler = api.interceptors.request.handlers[0];
    handler.fulfilled({
      headers: {},
      method: 'get',
      url: '/api/auth/login'
    });

    expect(checkRateLimit).toHaveBeenCalled();
  });

  it('should remove token on 401 response', async () => {
    const error = {
      response: {
        status: 401
      }
    };

    // Mock window.location
    delete window.location;
    window.location = { pathname: '/test', href: '' };

    const handler = api.interceptors.response.handlers[0];
    await handler.rejected(error).catch(() => {});

    expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should sanitize request data', () => {
    const handler = api.interceptors.request.handlers[0];
    const config = handler.fulfilled({
      headers: {},
      method: 'post',
      url: '/test',
      data: {
        name: '<script>alert("xss")</script>Test',
        email: 'test@example.com'
      }
    });

    expect(config.data.name).not.toContain('<script>');
    expect(config.data.email).toBe('test@example.com');
  });
});

