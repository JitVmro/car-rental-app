/**
 * User Routes Handler
 * Handles routing for user-related endpoints
 */

const userController = require('../controllers/userController');

/**
 * Handle user-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`User route: ${method} ${path}`);
  
  // Get personal info
  if (path.match(/^\/users\/[^/]+\/personal-info$/) && method === 'GET') {
    const userId = path.split('/')[2];
    return await userController.getPersonalInfo(event, userId);
  }
  
  // Update personal info
  if (path.match(/^\/users\/[^/]+\/personal-info$/) && method === 'PUT') {
    const userId = path.split('/')[2];
    return await userController.updatePersonalInfo(event, userId);
  }
  
  // Change password
  if (path.match(/^\/users\/[^/]+\/change-password$/) && method === 'PUT') {
    const userId = path.split('/')[2];
    return await userController.changePassword(event, userId);
  }
  
  // Get all agents (admin only)
  if (path === '/users/agents' && method === 'GET') {
    return await userController.getAgents(event);
  }
  
  // Get all clients (admin/agent only)
  if (path === '/users/clients' && method === 'GET') {
    return await userController.getClients(event);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'User endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};