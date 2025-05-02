/**
 * Routes index
 * Central router for all API endpoints
 */

// Import route modules using CommonJS
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const carRoutes = require('./carRoutes');
const bookingRoutes = require('./bookingRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const reportRoutes = require('./reportRoutes');
const homeRoutes = require('./homeRoutes');

/**
 * Process API request
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const processRequest = async (path, method, event) => {
  try {
    console.log(`Routing ${method} ${path}`);
    
    // Route based on path prefix
    if (path.startsWith('/auth')) {
      return await authRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/users')) {
      return await userRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/cars')) {
      return await carRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/bookings')) {
      return await bookingRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/feedbacks')) {
      return await feedbackRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/reports')) {
      return await reportRoutes.handleRequest(path, method, event);
    } else if (path.startsWith('/home')) {
      return await homeRoutes.handleRequest(path, method, event);
    } else if (path === '/health' || path === '/') {
      // Health check endpoint
      return {
        statusCode: 200,
        body: {
          status: 'ok',
          message: 'API is running'
        }
      };
    } else {
      // Route not found
      return {
        statusCode: 404,
        body: {
          message: 'Route not found'
        }
      };
    }
  } catch (error) {
    console.error('Error in router:', error);
    return {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    };
  }
};

// Export router
module.exports = {
  processRequest
};