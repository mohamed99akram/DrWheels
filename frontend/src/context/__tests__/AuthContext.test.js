// Mock axios before importing api
jest.mock('axios', () => {
  const mockAxiosInstance = {
    defaults: {
      baseURL: 'http://localhost:4000/api',
      timeout: 10000,
      headers: {}
    },
    interceptors: {
      request: {
        use: jest.fn(),
        handlers: []
      },
      response: {
        use: jest.fn(),
        handlers: []
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

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import api from '../../services/api';
import { secureStorage } from '../../utils/security';

jest.mock('../../services/api');
jest.mock('../../utils/security', () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }
}));

const TestComponent = () => {
  const { user, loading, login, register, logout } = React.useContext(AuthContext);
  
  return (
    <div>
      {loading ? 'Loading...' : user ? `User: ${user.email}` : 'No user'}
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password', 'Test')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    secureStorage.getItem.mockReturnValue(null);
    api.get.mockResolvedValue({ data: { id: '1', email: 'test@example.com' } });
  });

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText(/No user|Loading/)).toBeInTheDocument();
  });

  it('should load user when token exists', async () => {
    secureStorage.getItem.mockReturnValue('test-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/auth/me');
    });
  });

  it('should handle login', async () => {
    api.post.mockResolvedValue({
      data: {
        token: 'new-token',
        user: { id: '1', email: 'test@example.com' }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
    });

    expect(secureStorage.setItem).toHaveBeenCalledWith('token', 'new-token');
  });

  it('should handle logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(secureStorage.removeItem).toHaveBeenCalledWith('token');
  });
});

