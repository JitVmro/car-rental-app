/**
 * Feedback Routes Handler
 * Handles routing for feedback-related endpoints
 */

const feedbackController = require('../controllers/feedbackController');

/**
 * Handle feedback-related requests
 * @param {string} path - Request path
 * @param {string} method - HTTP method
 * @param {Object} event - API Gateway event
 * @returns {Promise<Object>} Response object
 */
const handleRequest = async (path, method, event) => {
  console.log(`Feedback route: ${method} ${path}`);
  
  // Create feedback
  if (path === '/feedbacks' && method === 'POST') {
    return await feedbackController.createFeedback(event);
  }
  
  // Get recent feedbacks
  if (path === '/feedbacks/recent' && method === 'GET') {
    return await feedbackController.getRecentFeedbacks(event);
  }
  
  // Get all feedbacks (admin/agent only)
  if (path === '/feedbacks' && method === 'GET') {
    return await feedbackController.getAllFeedbacks(event);
  }
  
  // Add admin response to feedback
  if (path.match(/^\/feedbacks\/[^/]+\/response$/) && method === 'POST') {
    const feedbackId = path.split('/')[2];
    return await feedbackController.addAdminResponse(event, feedbackId);
  }
  
  // If no route matches
  return {
    statusCode: 404,
    body: { 
      message: 'Feedback endpoint not found',
      path,
      method
    }
  };
};

module.exports = {
  handleRequest
};