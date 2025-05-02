/**
 * Authentication Routes Handler
 * Handles routing for auth-related endpoints
 */

const authController = require('../controllers/authController');

/**
 * Handle authentication-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Auth route: ${method} ${path}`);
  
  // Sign In endpoint
  if (path === '/auth/sign-in' && method === 'POST') {
    return await authController.signIn(event);
  }
  
  // Sign Up endpoint
  if (path === '/auth/sign-up' && method === 'POST') {
    return await authController.signUp(event);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Auth endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};