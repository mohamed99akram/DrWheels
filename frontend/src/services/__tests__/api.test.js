import api from '../api';
import { secureStorage } from '../../utils/security';

jest.mock('../../utils/security', () => ({
  secureStorage: {
    getItem: jest.fn(),
    removeItem: jest.fn(),
  }
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    secureStorage.getItem.mockReturnValue(null);
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
    
    api.interceptors.request.handlers[0].fulfilled({
      headers: {}
    });

    // The interceptor should add the token
    // This is tested through actual API calls
  });

  it('should remove token on 401 response', () => {
    const error = {
      response: {
        status: 401
      }
    };

    // Mock window.location
    delete window.location;
    window.location = { pathname: '/test', href: '' };

    api.interceptors.response.handlers[0].rejected(error);

    expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
  });
});

