/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Implements OWASP CSRF prevention best practices
 */

/**
 * Generate CSRF token
 */
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Store CSRF token
 */
export const storeCSRFToken = (token) => {
  try {
    sessionStorage.setItem('csrf_token', token);
  } catch (error) {
    console.error('Error storing CSRF token:', error);
  }
};

/**
 * Get CSRF token
 */
export const getCSRFToken = () => {
  try {
    return sessionStorage.getItem('csrf_token');
  } catch (error) {
    console.error('Error retrieving CSRF token:', error);
    return null;
  }
};

/**
 * Initialize CSRF protection
 */
export const initCSRFProtection = () => {
  let token = getCSRFToken();
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  return token;
};

/**
 * Add CSRF token to request headers
 */
export const addCSRFTokenToHeaders = (headers = {}) => {
  const token = getCSRFToken();
  if (token) {
    headers['X-CSRF-Token'] = token;
  }
  return headers;
};

/**
 * Verify CSRF token (for API responses)
 */
export const verifyCSRFToken = (responseToken) => {
  const storedToken = getCSRFToken();
  return storedToken && storedToken === responseToken;
};

