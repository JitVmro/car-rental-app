/**
 * Home Routes Handler
 * Handles routing for home page content endpoints
 */

const homeController = require('../controllers/homeController');

/**
 * Handle home-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Home route: ${method} ${path}`);
  
  // Get about us content
  if (path === '/home/about-us' && method === 'GET') {
    return await homeController.getAboutUs(event);
  }
  
  // Get FAQ content
  if (path === '/home/faq' && method === 'GET') {
    return await homeController.getFaq(event);
  }
  
  // Get locations
  if (path === '/home/locations' && method === 'GET') {
    return await homeController.getLocations(event);
  }
  
  // Update about us (admin only)
  if (path === '/home/about-us' && method === 'PUT') {
    return await homeController.updateAboutUs(event);
  }
  
  // Update FAQ (admin only)
  if (path === '/home/faq' && method === 'PUT') {
    return await homeController.updateFaq(event);
  }
  
  // Create location (admin only)
  if (path === '/home/locations' && method === 'POST') {
    return await homeController.createLocation(event);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Home endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};