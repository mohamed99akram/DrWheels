// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage with proper jest.fn() structure
let localStorageStore = {};
const localStorageMock = {
  getItem: jest.fn((key) => localStorageStore[key] || null),
  setItem: jest.fn((key, value) => { localStorageStore[key] = value.toString(); }),
  removeItem: jest.fn((key) => { delete localStorageStore[key]; }),
  clear: jest.fn(() => {
    Object.keys(localStorageStore).forEach((key) => {
      delete localStorageStore[key];
    });
  }),
};
global.localStorage = localStorageMock;
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

global.localStorageStore = localStorageStore;

// Mock sessionStorage with proper jest.fn() structure
let sessionStorageStore = {};
const sessionStorageMock = {
  getItem: jest.fn((key) => sessionStorageStore[key] || null),
  setItem: jest.fn((key, value) => { sessionStorageStore[key] = value.toString(); }),
  removeItem: jest.fn((key) => { delete sessionStorageStore[key]; }),
  clear: jest.fn(() => {
    Object.keys(sessionStorageStore).forEach((key) => {
      delete sessionStorageStore[key];
    });
  }),
};
global.sessionStorage = sessionStorageMock;
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
  configurable: true,
});
global.sessionStorageStore = sessionStorageStore;

// Mock crypto for CSRF token generation
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    global.crypto.__counter = (global.crypto.__counter || 0) + 1;
    const c = global.crypto.__counter;
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (c + i) % 256;
    }
    return arr;
  }),
};

Object.defineProperty(window, 'crypto', {
  value: global.crypto,
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'crypto', {
  value: global.crypto,
  writable: true,
  configurable: true,
});

beforeEach(() => {
  global.localStorageStore = localStorageStore;
  localStorageMock.getItem.mockImplementation((key) => localStorageStore[key] || null);
  localStorageMock.setItem.mockImplementation((key, value) => { localStorageStore[key] = value.toString(); });
  localStorageMock.removeItem.mockImplementation((key) => { delete localStorageStore[key]; });
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(localStorageStore).forEach((key) => {
      delete localStorageStore[key];
    });
  });

  global.sessionStorageStore = sessionStorageStore;
  sessionStorageMock.getItem.mockImplementation((key) => sessionStorageStore[key] || null);
  sessionStorageMock.setItem.mockImplementation((key, value) => { sessionStorageStore[key] = value.toString(); });
  sessionStorageMock.removeItem.mockImplementation((key) => { delete sessionStorageStore[key]; });
  sessionStorageMock.clear.mockImplementation(() => {
    Object.keys(sessionStorageStore).forEach((key) => {
      delete sessionStorageStore[key];
    });
  });

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

// Mock axios to avoid ES module issues
// This is a fallback - individual test files should mock axios as needed
if (typeof jest !== 'undefined') {
  try {
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
  } catch (e) {
    // Mock might already be set up in individual test files
  }
}

